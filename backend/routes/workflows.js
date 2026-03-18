const express = require("express");
const router = express.Router();
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const Execution = require('../models/Execution');
const { v4: uuidv4 } = require("uuid");

// WORKFLOW ROUTES

// Create workflow
router.post("/", async (req, res) => {
  try {
    const triggerUserName = req.body.triggered_by || 'anonymous';
    // Get organization context from header
    const organizationId = req.headers['x-organization-id'] || req.body.organization_id;
    
    const User = require('../models/User');
    const triggerUser = await User.findOne({ username: triggerUserName });
    
    if (triggerUser && triggerUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators can create workflows'
      });
    }

    const workflow = new Workflow({
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description,
      version: 1,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      input_schema: req.body.input_schema || { type: "object", fields: [] },
      organization_id: organizationId || null, 
      start_step_id: req.body.start_step_id || null,
    });

    await workflow.save();
    res.status(201).json({ success: true, workflow });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// List workflows
router.get("/", async (req, res) => {
  try {
    const { page = 1, search, status } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status && status !== "all") {
      query.is_active = status === "active";
    }

    // Isolate by Organization
    const organizationId = req.headers['x-organization-id'] || req.query.organization_id;
    if (organizationId) {
        query.organization_id = organizationId;
    }

    const workflows = await Workflow.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Workflow.countDocuments(query);

    res.json({
      success: true,
      workflows,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get workflow details
router.get("/:id", async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { id: req.params.id };
    if (organizationId) {
      query.$or = [{ organization_id: organizationId }, { organization_id: null }];
    }

    const workflow = await Workflow.findOne(query);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    // Get steps for this workflow
    const workflowSteps = await Step.find({ 
      workflow_id: req.params.id,
      $or: [{ organization_id: organizationId }, { organization_id: null }]
    }).sort({ order: 1 });
    
    // Get rules for each step
    const stepsWithRules = await Promise.all(
      workflowSteps.map(async (step) => {
        const stepRules = await Rule.find({ 
          step_id: step.id,
          $or: [{ organization_id: organizationId }, { organization_id: null }]
        }).sort({ priority: 1 });
        return { ...step.toObject(), rules: stepRules };
      })
    );

    res.json({
      success: true,
      workflow: { ...workflow.toObject(), steps: stepsWithRules }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update workflow
router.put("/:id", async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { id: req.params.id };
    if (organizationId) {
      query.organization_id = organizationId;
    }

    const workflow = await Workflow.findOne(query);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    // Update existing workflow instead of creating new version for now (simpler for user)
    const updates = {
      name: req.body.name || workflow.name,
      description: req.body.description || workflow.description,
      is_active: req.body.is_active !== undefined ? req.body.is_active : workflow.is_active,
      input_schema: req.body.input_schema || workflow.input_schema,
      start_step_id: req.body.start_step_id || workflow.start_step_id,
      updated_at: new Date()
    };

    await Workflow.updateOne(query, updates);
    const updatedWorkflow = await Workflow.findOne(query);

    res.json({ success: true, workflow: updatedWorkflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete workflow
router.delete("/:id", async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const workflowId = req.params.id;
    const query = { id: workflowId };
    if (organizationId) query.organization_id = organizationId;

    const workflow = await Workflow.findOne(query);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }
    
    // Find steps for this workflow
    const workflowSteps = await Step.find({ workflow_id: workflowId });
    const stepIds = workflowSteps.map(s => s.id);
    
    // Delete associated rules
    await Rule.deleteMany({ step_id: { $in: stepIds } });
    
    // Delete associated steps
    await Step.deleteMany({ workflow_id: workflowId });
    
    // Delete workflow
    await Workflow.deleteOne(query);
    
    res.json({ success: true, message: "Workflow deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
