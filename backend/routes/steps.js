const express = require('express');
const router = express.Router();
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const Workflow = require('../models/Workflow');
const { v4: uuidv4 } = require('uuid');

// POST /workflows/:workflow_id/steps - Add step
router.post('/workflows/:workflow_id/steps', async (req, res) => {
  try {
    const { name, step_type, order, metadata } = req.body;
    const workflow_id = req.params.workflow_id;
    
    // Verify workflow exists and respect organization context
    const organizationId = req.headers['x-organization-id'];
    const workflowQuery = { id: workflow_id };
    if (organizationId) workflowQuery.$or = [{ organization_id: organizationId }, { organization_id: null }];
    
    const workflow = await Workflow.findOne(workflowQuery);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found or access denied'
      });
    }
    
    const step = new Step({
      id: uuidv4(),
      workflow_id,
      organization_id: workflow.organization_id || organizationId,
      name,
      step_type: step_type || 'task',
      order: order || 1,
      metadata: metadata || {}
    });

    await step.save();

    // Automatically create a DEFAULT rule for the new step
    const defaultRule = new Rule({
      id: uuidv4(),
      step_id: step.id,
      organization_id: step.organization_id || organizationId,
      condition: 'DEFAULT',
      next_step_id: null,
      priority: 999
    });
    await defaultRule.save();

    // Smart Linking (Bi-directional): 
    // 1. Link PREVIOUS step to this new step
    if (step.order > 1) {
      const prevStep = await Step.findOne({ 
        workflow_id, 
        order: step.order - 1,
        organization_id: step.organization_id || organizationId
      });
      if (prevStep) {
        // Only link if the previous step's DEFAULT rule currently points to nothing
        await Rule.updateOne(
          { 
            step_id: prevStep.id, 
            condition: 'DEFAULT', 
            next_step_id: null,
            organization_id: step.organization_id || organizationId
          },
          { next_step_id: step.id }
        );
      }
    }

    // 2. Link THIS new step to the NEXT step (if it exists already)
    const nextStep = await Step.findOne({
      workflow_id,
      order: step.order + 1,
      organization_id: step.organization_id || organizationId
    });
    if (nextStep) {
      await Rule.updateOne(
        {
          step_id: step.id,
          condition: 'DEFAULT',
          organization_id: step.organization_id || organizationId
        },
        { next_step_id: nextStep.id }
      );
    }
    // Update workflow start_step_id if it's currently null
    if (!workflow.start_step_id) {
      await Workflow.updateOne(
        { id: workflow_id },
        { start_step_id: step.id }
      );
    }
    
    res.status(201).json({
      success: true,
      step,
      message: 'Step created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /workflows/:workflow_id/steps - List steps for workflow
router.get('/workflows/:workflow_id/steps', async (req, res) => {
  try {
    const workflow_id = req.params.workflow_id;
    
    // Verify workflow exists
    const organizationId = req.headers['x-organization-id'];
    const query = { id: workflow_id };
    if (organizationId) query.$or = [{ organization_id: organizationId }, { organization_id: null }];

    const workflow = await Workflow.findOne(query);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found or access denied'
      });
    }
    
    const stepQuery = { workflow_id };
    if (organizationId) stepQuery.organization_id = organizationId;

    const steps = await Step.find(stepQuery)
      .sort({ order: 1 });
    
    res.json({
      success: true,
      steps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /steps/:id - Update step
router.put('/steps/:id', async (req, res) => {
  try {
    const { name, step_type, order, metadata } = req.body;
    
    const organizationId = req.headers['x-organization-id'];
    const query = { id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    const step = await Step.findOne(query);
    
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (step_type !== undefined) updates.step_type = step_type;
    if (order !== undefined) updates.order = order;
    if (metadata !== undefined) updates.metadata = metadata;
    
    await Step.updateOne(
      query,
      { ...updates, updated_at: new Date() }
    );
    
    const updatedStep = await Step.findOne({ id: req.params.id });
    
    res.json({
      success: true,
      step: updatedStep,
      message: 'Step updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /steps/:id - Delete step
router.delete('/steps/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    const step = await Step.findOne(query);
    
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }
    
    // Delete associated rules
    await Rule.deleteMany({ step_id: step.id });
    
    // Delete step
    await Step.deleteOne(query);
    
    res.json({
      success: true,
      message: 'Step deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
