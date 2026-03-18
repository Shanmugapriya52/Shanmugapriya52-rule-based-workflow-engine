const express = require('express');
const router = express.Router();
const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const RuleEngine = require('../utils/RuleEngine');
const SchemaValidator = require('../utils/SchemaValidator');
const { v4: uuidv4 } = require('uuid');

// ─── Helper: send notifications to users for a step ──────────────────────────

async function notifyUsers(usersToNotify, payload, organization_id) {
  const Notification = require('../models/Notification');
  for (const user of usersToNotify) {
    await Notification.create({
      user_id: user._id,
      organization_id,
      ...payload
    });
  }
}

// ─── Core Execution Engine ────────────────────────────────────────────────────

async function processExecution(executionId) {
  const execution = await Execution.findOne({ id: executionId });
  if (!execution) return;
  
  const orgId = execution.organization_id;

  const User = require('../models/User');

  let currentStepId = execution.current_step_id;

  while (currentStepId) {
    const freshExec = await Execution.findOne({ id: executionId });
    if (!freshExec || freshExec.status === 'canceled') return;

    const step = await Step.findOne({ id: currentStepId, organization_id: orgId });
    if (!step) {
      const failLog = {
        step_name: 'System Error',
        step_type: 'unknown',
        evaluated_rules: [],
        selected_next_step: null,
        status: 'failed',
        approver_id: null,
        error_message: 'Step definition missing: ' + currentStepId,
        started_at: new Date(),
        ended_at: new Date()
      };
      await Execution.updateOne(
        { id: executionId },
        { status: 'failed', ended_at: new Date(), $push: { logs: failLog } }
      );
      return;
    }

    await Execution.updateOne({ id: executionId }, { status: 'in_progress' });

    const stepLog = {
      step_id: step.id,
      step_name: step.name,
      step_type: step.step_type,
      evaluated_rules: [],
      selected_next_step: null,
      status: 'in_progress',
      approver_id: null,
      error_message: null,
      started_at: new Date(),
      ended_at: null
    };

    const isManual =
      step.step_type === 'approval' ||
      (step.step_type === 'task' && step.metadata?.task_type === 'manual');

    if (isManual) {
      stepLog.status = 'pending_approval';
      await Execution.updateOne(
        { id: executionId },
        {
          status: 'pending_approval',
          current_step_id: currentStepId,
          $push: { logs: stepLog }
        }
      );

      const workflow = await Workflow.findOne({ id: freshExec.workflow_id });
      let usersToNotify = [];

      if (step.metadata?.assignee_id) {
        const assignee = await User.findById(step.metadata.assignee_id);
        if (assignee) usersToNotify = [assignee];
      } else if (step.metadata?.assignee_email) {
        const assignee = await User.findOne({ email: step.metadata.assignee_email });
        if (assignee) usersToNotify = [assignee];
      } else {
        const targetRole = step.metadata?.target_role || deriveRoleFromStepName(step.name);
        const userQuery = { role: { $regex: new RegExp(`^${targetRole}$`, 'i') } };
        if (orgId) {
          userQuery.$or = [{ organization_id: orgId }, { organization_id: null }];
        }
        usersToNotify = await User.find(userQuery);
      }

      await notifyUsers(usersToNotify, {
        title: 'Action Required',
        message: `Workflow "${workflow?.name || freshExec.workflow_id}" requires your ${step.step_type === 'approval' ? 'approval' : 'action'} at step "${step.name}".`,
        type: 'approval_required',
        workflow_id: freshExec.workflow_id,
        execution_id: freshExec.id,
        step_id: step.id,
        priority: 'high'
      }, freshExec.organization_id);

      return; 
    }

    if (step.step_type === 'notification') {
      const workflow = await Workflow.findOne({ 
        id: freshExec.workflow_id,
        organization_id: orgId
      });
      let recipients = [];
      const triggerUser = await User.findOne({ 
        username: freshExec.triggered_by,
        organization_id: orgId
      });
      if (triggerUser) recipients.push(triggerUser);

      if (step.metadata?.assignee_email) {
        const assignee = await User.findOne({ 
          email: step.metadata.assignee_email,
          organization_id: orgId
        });
        if (assignee && !recipients.find(u => u._id.equals(assignee._id))) {
          recipients.push(assignee);
        }
      }

      await notifyUsers(recipients, {
        title: step.metadata?.notification_title || 'Workflow Update',
        message: step.metadata?.notification_message ||
          `Workflow "${workflow?.name || freshExec.workflow_id}" reached step "${step.name}".`,
        type: 'info',
        workflow_id: freshExec.workflow_id,
        execution_id: freshExec.id,
        step_id: step.id,
        priority: 'medium'
      }, freshExec.organization_id);
    }

    const rules = await Rule.find({ 
      step_id: currentStepId,
      organization_id: orgId
    }).sort({ priority: 1 });
    let nextStepId = null;
    let defaultNextStepId = null;

    for (const rule of rules) {
      const isDefault = rule.condition === 'DEFAULT' || !rule.condition;
      let isMatch = false;
      try {
        isMatch = isDefault || RuleEngine.evaluate(rule.condition, freshExec.data);
      } catch (e) {
        console.error(`Rule eval error:`, e.message);
      }

      stepLog.evaluated_rules.push({
        rule_id: rule.id,
        condition: rule.condition,
        matched: isMatch
      });

      if (isDefault) {
        defaultNextStepId = rule.next_step_id;
      } else if (isMatch) {
        nextStepId = rule.next_step_id;
        break; // Stop at first specific rule match (priority sorted)
      }
    }

    if (!nextStepId) nextStepId = defaultNextStepId;

    stepLog.selected_next_step = nextStepId;
    stepLog.ended_at = new Date();
    stepLog.status = 'completed';

    await Execution.updateOne(
      { id: executionId },
      {
        current_step_id: nextStepId,
        $push: { logs: stepLog }
      }
    );

    // If no next step, the loop will terminate
    currentStepId = nextStepId;
  }

  // Final check: if we exited the loop with no currentStepId, it's completed
  const finalExec = await Execution.findOne({ id: executionId });
  if (finalExec && (finalExec.status === 'in_progress' || finalExec.status === 'pending')) {
    await Execution.updateOne(
      { id: executionId },
      { status: 'completed', ended_at: new Date() }
    );
  }
}

// ─── Helper: derive role from step name ──────────────────────────────────────
function deriveRoleFromStepName(name = '') {
  const n = name.toLowerCase();
  
  // High priority specific roles
  if (n.includes('cfo')) return 'CFO';
  if (n.includes('ceo') || n.includes('chief executive')) return 'CEO';
  if (n.includes('cto')) return 'CTO';
  if (n.includes('coo')) return 'COO';
  
  // Departmental/Functional roles
  if (n.includes('finance') || n.includes('accounting') || n.includes('payroll')) return 'Finance';
  if (n.includes('hr') || n.includes('human resources') || n.includes('people ops')) return 'HR';
  if (n.includes('legal') || n.includes('compliance')) return 'Legal';
  if (n.includes('it ') || n.includes(' it') || n.includes('infrastructure')) return 'IT';
  
  // Leadership roles
  if (n.includes('manager') || n.includes('supervisor') || n.includes('lead')) return 'Manager';
  if (n.includes('director') || n.includes('vp') || n.includes('vice president')) return 'Director';
  if (n.includes('executive')) return 'Executive';
  
  // Default fallback
  return 'Manager';
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /workflows/:workflow_id/execute
router.post('/workflows/:workflow_id/execute', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'] || req.body.organization_id;
    const workflow = await Workflow.findOne({
      id: req.params.workflow_id,
      is_active: true,
      $or: [{ organization_id: organizationId }, { organization_id: null }]
    }).sort({ version: -1 });

    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Active workflow not found' });
    }

    // Step 10: Input Schema Validation
    const inputData = req.body.data || {};
    const validation = SchemaValidator.validate(workflow.input_schema, inputData);
    if (!validation.valid) {
      console.log('--- SCHEMA VALIDATION FAILED ---');
      console.log('Workflow ID:', req.params.workflow_id);
      console.log('Input Data:', JSON.stringify(inputData, null, 2));
      console.log('Schema:', JSON.stringify(workflow.input_schema, null, 2));
      console.log('Errors:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Input schema validation failed',
        errors: validation.errors
      });
    }

    const User = require('../models/User');
    const triggerUserName = req.body.triggered_by || 'anonymous';
    const triggerUser = await User.findOne({ username: triggerUserName });

    if (triggerUser && triggerUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Administrators can execute workflows' });
    }

    const execution = new Execution({
      id: uuidv4(),
      workflow_id: workflow.id,
      workflow_version: workflow.version,
      status: 'pending',
      data: inputData,
      logs: [],
      current_step_id: workflow.start_step_id,
      organization_id: organizationId,
      triggered_by: triggerUserName,
      started_at: new Date()
    });

    await execution.save();

    setImmediate(async () => {
      try {
        await processExecution(execution.id);
      } catch (error) {
        console.error('Execution error:', error);
        await Execution.updateOne({ id: execution.id }, { status: 'failed', ended_at: new Date() });
      }
    });

    res.status(201).json({
      success: true,
      execution: {
        id: execution.id,
        workflow_id: execution.workflow_id,
        status: execution.status,
        started_at: execution.started_at
      },
      message: 'Workflow execution started'
    });
  } catch (error) {
    console.error('--- EXECUTION ROUTE ERROR ---');
    console.error('Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/executions/stats — aggregated telemetry for dashboards
router.get('/executions/stats', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'] || req.query.organization_id;
    const queryFilter = organizationId ? { organization_id: organizationId } : {};

    const totalWorkflows = await Workflow.countDocuments(queryFilter);
    const activeWorkflows = await Workflow.countDocuments({ is_active: true, ...queryFilter });
    
    // Recent executions
    const recentExecutions = await Execution.find(queryFilter)
      .sort({ started_at: -1 })
      .limit(10);
    
    // Status counts
    const statusStats = await Execution.aggregate([
      { $match: queryFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const statsObj = {};
    statusStats.forEach(s => { statsObj[s._id] = s.count; });

    // Pending approvals (total)
    const pendingTotal = statsObj.pending_approval || 0;
    
    // Performance calculation (success rate)
    const completed = statsObj.completed || 0;
    const failed = statsObj.failed || 0;
    const totalFinished = completed + failed;
    const successRate = totalFinished > 0 ? ((completed / totalFinished) * 100).toFixed(1) : 0;

    // Fetch organization name for identification
    let orgName = 'Halleyx';
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      const Organization = require('../models/Organization');
      const org = await Organization.findById(organizationId);
      if (org) orgName = org.name;
    }

    res.json({
      success: true,
      stats: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions: await Execution.countDocuments(queryFilter),
        pendingApprovals: pendingTotal,
        completedExecutions: completed,
        failedExecutions: failed,
        successRate,
        recentActivity: recentExecutions,
        organizationName: orgName
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/executions/my-approvals — role-filtered pending approvals for a user
router.get('/executions/my-approvals', async (req, res) => {
  try {
    const User = require('../models/User');
    const { userId, username } = req.query;

    if (!userId && !username) {
      return res.json({ success: true, executions: [], message: 'userId or username required' });
    }

    let user;
    if (userId && userId !== 'undefined' && userId !== 'null') {
      user = await User.findById(userId);
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.json({ success: true, executions: [], message: 'User context not found' });
    }

    const organizationId = req.headers['x-organization-id'] || req.query.organization_id;
    const queryFilter = { status: 'pending_approval' };
    if (organizationId) queryFilter.organization_id = organizationId;

    // Find all pending_approval executions for this org
    const pendingExecs = await Execution.find(queryFilter).sort({ started_at: -1 });

    // Filter to executions where current step matches user's role
    const myApprovals = [];
    for (const exec of pendingExecs) {
      try {
        const step = await Step.findOne({ id: exec.current_step_id });
        if (!step) continue;

        let isForMe = false;

        // Check by explicit assignee_id
        if (step.metadata?.assignee_id && step.metadata.assignee_id.toString() === user._id.toString()) {
          isForMe = true;
        }
        // Check by explicit assignee_email
        else if (step.metadata?.assignee_email && step.metadata.assignee_email.toLowerCase() === user.email?.toLowerCase()) {
          isForMe = true;
        }
        // Check by target_role
        else if (step.metadata?.target_role) {
          isForMe = step.metadata.target_role.toLowerCase() === user.role?.toLowerCase();
        }
        // Check by role derived from step name
        else {
          const derivedRole = deriveRoleFromStepName(step.name);
          isForMe = derivedRole.toLowerCase() === user.role?.toLowerCase();
        }

        if (isForMe) {
          const workflow = await Workflow.findOne({ id: exec.workflow_id });
          myApprovals.push({
            ...exec.toObject(),
            workflow_name: workflow?.name || exec.workflow_id,
            current_step_name: step.name,
            current_step_type: step.step_type,
            current_step_instructions: step.metadata?.instructions || null
          });
        }
      } catch (err) {
        console.error(`Error processing approval for execution ${exec.id}:`, err);
      }
    }

    res.json({ success: true, executions: myApprovals });
  } catch (error) {
    console.error('my-approvals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /executions/:id
router.get('/executions/:id', async (req, res) => {
  try {
    const execution = await Execution.findOne({ id: req.params.id });
    if (!execution) return res.status(404).json({ success: false, message: 'Execution not found' });

    const workflow = await Workflow.findOne({ id: execution.workflow_id });
    const stepDetails = await Promise.all(
      execution.logs.map(async (log) => {
        if (log.step_id) {
          const step = await Step.findOne({ id: log.step_id });
          const plain = log.toObject ? log.toObject() : log;
          return {
            ...plain,
            step_name: step?.name || plain.step_name || 'Unknown Step',
            step_type: step?.step_type || plain.step_type || 'task'
          };
        }
        return log;
      })
    );

    res.json({
      success: true,
      execution: {
        ...execution.toObject(),
        workflow_name: workflow?.name || 'Unknown Workflow',
        logs: stepDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /executions/:id/cancel
router.post('/executions/:id/cancel', async (req, res) => {
  try {
    const execution = await Execution.findOne({ id: req.params.id });
    if (!execution) return res.status(404).json({ success: false, message: 'Execution not found' });
    if (execution.status === 'completed') return res.status(400).json({ success: false, message: 'Cannot cancel completed execution' });
    if (execution.status === 'canceled') return res.status(400).json({ success: false, message: 'Execution already canceled' });

    await Execution.updateOne(
      { id: req.params.id },
      {
        status: 'canceled',
        ended_at: new Date(),
        $push: { logs: { step_id: null, step_name: 'System', step_type: 'task', message: 'Execution canceled by user', status: 'canceled', started_at: new Date(), ended_at: new Date() } }
      }
    );

    res.json({ success: true, message: 'Execution canceled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /executions/:id
router.delete('/executions/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'] || req.query.organization_id;
    const query = { id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    const result = await Execution.deleteOne(query);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Execution not found' });
    }

    res.json({ success: true, message: 'Execution deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /executions/:id/retry
router.post('/executions/:id/retry', async (req, res) => {
  try {
    const execution = await Execution.findOne({ id: req.params.id });
    if (!execution) return res.status(404).json({ success: false, message: 'Execution not found' });
    if (execution.status !== 'failed') return res.status(400).json({ success: false, message: 'Can only retry failed executions' });

    await Execution.updateOne(
      { id: req.params.id },
      {
        status: 'in_progress',
        retries: execution.retries + 1,
        ended_at: null
      }
    );

    setImmediate(async () => {
      try { await processExecution(req.params.id); }
      catch (error) {
        console.error('Retry error:', error);
        await Execution.updateOne({ id: req.params.id }, { status: 'failed', ended_at: new Date() });
      }
    });

    res.json({ success: true, message: 'Execution retry started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /executions/:id/complete-step
router.post('/executions/:id/complete-step', async (req, res) => {
  try {
    const { step_id, action, approver_username, data } = req.body;

    if (!step_id) {
      return res.status(400).json({ success: false, message: 'step_id is required' });
    }

    const execution = await Execution.findOne({ id: req.params.id });
    if (!execution) return res.status(404).json({ success: false, message: 'Execution not found' });

    if (execution.status !== 'in_progress' && execution.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: `Cannot complete step — execution status is "${execution.status}"` });
    }

    // Find the most recent pending log entry for this step
    const logs = execution.logs;
    let actualIndex = -1;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].step_id === step_id) {
        actualIndex = i;
        break;
      }
    }

    if (actualIndex === -1) {
      return res.status(400).json({ success: false, message: `No log entry found for step_id "${step_id}". Current step: "${execution.current_step_id}"` });
    }

    // Merge action into data for rule evaluation
    const updatedData = { ...execution.data, ...(data || {}), action };

    // Determine next step via rules (with DEFAULT fallback)
    const rules = await Rule.find({ 
      step_id,
      organization_id: execution.organization_id
    }).sort({ priority: 1 });
    let nextStepId = null;
    let defaultNextStepId = null;
    let evalLogs = [];

    for (const rule of rules) {
      const isDefault = rule.condition === 'DEFAULT' || !rule.condition;
      let isMatch = false;
      try {
        isMatch = isDefault || RuleEngine.evaluate(rule.condition, updatedData);
      } catch (e) {
        console.error('Rule eval error:', e.message);
      }
      
      evalLogs.push({
        rule_id: rule.id,
        condition: rule.condition,
        matched: isMatch
      });

      if (isDefault) {
        defaultNextStepId = rule.next_step_id;
      } else if (isMatch) {
        nextStepId = rule.next_step_id;
        break; // Stop at first specific rule match
      }
    }
    if (!nextStepId) nextStepId = defaultNextStepId;

    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const workflow = await Workflow.findOne({ 
      id: execution.workflow_id,
      organization_id: execution.organization_id
    });

    // If rejected → stop the workflow
    if (action === 'reject') {
      await Execution.updateOne(
        { id: req.params.id },
        {
          $set: {
            [`logs.${actualIndex}.status`]: 'rejected',
            [`logs.${actualIndex}.ended_at`]: new Date(),
            [`logs.${actualIndex}.approver_id`]: approver_username || 'unknown',
            [`logs.${actualIndex}.evaluated_rules`]: evalLogs,
            [`logs.${actualIndex}.selected_next_step`]: null,
            status: 'failed',
            ended_at: new Date(),
            data: updatedData
          }
        }
      );

      // Notify the person who triggered the workflow
      const triggerUser = await User.findOne({ 
        username: execution.triggered_by,
        organization_id: execution.organization_id
      });
      const step = await Step.findOne({ 
        id: step_id,
        organization_id: execution.organization_id
      });
      if (triggerUser) {
        await Notification.create({
          user_id: triggerUser._id,
          organization_id: execution.organization_id,
          title: 'Workflow Rejected',
          message: `Your workflow "${workflow?.name || execution.workflow_id}" was rejected at step "${step?.name || step_id}" by ${approver_username || 'an approver'}.`,
          type: 'rejection',
          workflow_id: execution.workflow_id,
          execution_id: execution.id,
          step_id,
          priority: 'high'
        });
      }

      return res.json({ success: true, message: 'Step rejected, workflow stopped' });
    }

    // Approve / complete: update log and advance to next step
    const stepStatus = action === 'approve' ? 'approved' : 'completed';
    await Execution.updateOne(
      { id: req.params.id },
      {
        $set: {
          [`logs.${actualIndex}.status`]: stepStatus,
          [`logs.${actualIndex}.ended_at`]: new Date(),
          [`logs.${actualIndex}.approver_id`]: approver_username || 'unknown',
          [`logs.${actualIndex}.evaluated_rules`]: evalLogs,
          [`logs.${actualIndex}.selected_next_step`]: nextStepId,
          data: updatedData,
          current_step_id: nextStepId,
          status: 'in_progress'
        }
      }
    );

    // Notify triggerer about step completion
    const triggerUser = await User.findOne({ 
      username: execution.triggered_by,
      organization_id: execution.organization_id
    });
    
    if (triggerUser) {
      const step = await Step.findOne({ 
        id: step_id,
        organization_id: execution.organization_id
      });
      const nextStep = nextStepId ? await Step.findOne({ 
        id: nextStepId,
        organization_id: execution.organization_id
      }) : null;

      await Notification.create({
        user_id: triggerUser._id,
        organization_id: execution.organization_id,
        title: 'Step Completed',
        message: `Step "${step?.name || step_id}" in your workflow "${workflow?.name || execution.workflow_id}" was ${action === 'approve' ? 'approved' : 'completed'} by ${approver_username || 'an approver'}.${nextStep ? ` Moving to step: "${nextStep.name}".` : ' Workflow finalized.'}`,
        type: 'info',
        workflow_id: execution.workflow_id,
        execution_id: execution.id,
        step_id: step_id
      });
    }

    // Resume processing the next step(s)
    if (nextStepId) {
      setImmediate(async () => {
        try { await processExecution(req.params.id); }
        catch (error) { console.error('Resume error:', error); }
      });
    } else {
      // No next step → workflow complete
      await Execution.updateOne(
        { id: req.params.id },
        { status: 'completed', ended_at: new Date() }
      );

      // Final completion notification to all participants
      if (triggerUser) {
        const participants = await Execution.distinct('logs.approver_id', { id: execution.id });
        const participantUsers = await User.find({ 
          username: { $in: participants },
          organization_id: execution.organization_id
        });

        const notificationPayload = {
          title: 'Workflow Completed',
          message: `Your workflow "${workflow?.name || execution.workflow_id}" has been successfully completed!`,
          type: 'success',
          workflow_id: execution.workflow_id,
          execution_id: execution.id,
          priority: 'medium'
        };

        // Notify triggerer
        await Notification.create({
          user_id: triggerUser._id,
          organization_id: execution.organization_id,
          ...notificationPayload
        });

        // Notify all participants
        for (const pUser of participantUsers) {
          if (!pUser._id.equals(triggerUser._id)) {
            await Notification.create({
              user_id: pUser._id,
              organization_id: execution.organization_id,
              ...notificationPayload,
              message: `The workflow "${workflow?.name || execution.workflow_id}" you participated in has completed.`
            });
          }
        }
      }
    }

    return res.json({ success: true, message: 'Step completed, workflow resumed' });
  } catch (error) {
    console.error('complete-step error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /executions
router.get('/executions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const workflow = req.query.workflow || '';
    const triggered_by = req.query.triggered_by || '';

    let query = {};
    if (status) query.status = status;
    
    const organizationId = req.headers['x-organization-id'] || req.query.organization_id;
    if (organizationId) query.organization_id = organizationId;

    if (workflow) {
      const workflowDoc = await Workflow.findOne({ 
        name: { $regex: workflow, $options: 'i' },
        $or: [{ organization_id: organizationId }, { organization_id: null }]
      });
      if (workflowDoc) query.workflow_id = workflowDoc.id;
    }
    if (triggered_by) query.triggered_by = { $regex: triggered_by, $options: 'i' };

    const executions = await Execution.find(query)
      .sort({ started_at: -1 })
      .skip(skip)
      .limit(limit);

    const executionsWithWorkflowNames = await Promise.all(
      executions.map(async (execution) => {
        const workflowData = await Workflow.findOne({ id: execution.workflow_id });
        return { ...execution.toObject(), workflow_name: workflowData?.name };
      })
    );

    const total = await Execution.countDocuments(query);

    res.json({
      success: true,
      executions: executionsWithWorkflowNames,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
