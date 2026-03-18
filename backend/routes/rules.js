const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const Step = require('../models/Step');
const { v4: uuidv4 } = require('uuid');

// Helper to reorder rule priorities sequentially (1, 2, 3...)
const reorderPriorities = async (step_id) => {
  const rules = await Rule.find({ step_id }).sort({ priority: 1, created_at: 1 });
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].priority !== i + 1) {
      rules[i].priority = i + 1;
      await rules[i].save();
    }
  }
};

// POST /steps/:step_id/rules - Add rule
router.post('/steps/:step_id/rules', async (req, res) => {
  try {
    const { condition, next_step_id, priority } = req.body;
    const step_id = req.params.step_id;
    
    // Verify step exists and respect organization context
    const organizationId = req.headers['x-organization-id'];
    const stepQuery = { id: step_id };
    if (organizationId) stepQuery.organization_id = organizationId;

    const step = await Step.findOne(stepQuery);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found or access denied'
      });
    }
    
    // If priority is provided, we might need to shift others...
    
    const rule = new Rule({
      id: uuidv4(),
      step_id,
      organization_id: step.organization_id || organizationId,
      condition: condition || 'DEFAULT',
      next_step_id: next_step_id || null,
      priority: priority || 999 // High number to append to end
    });

    await rule.save();
    await reorderPriorities(step_id);
    
    const finalRule = await Rule.findOne({ id: rule.id });
    
    res.status(201).json({
      success: true,
      rule: finalRule,
      message: 'Rule created successfully and priorities synchronized'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /steps/:step_id/rules - List rules for step
router.get('/steps/:step_id/rules', async (req, res) => {
  try {
    const step_id = req.params.step_id;
    
    // Verify step exists
    const organizationId = req.headers['x-organization-id'];
    const stepQuery = { id: step_id };
    if (organizationId) stepQuery.organization_id = organizationId;

    const step = await Step.findOne(stepQuery);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found or access denied'
      });
    }
    
    const ruleQuery = { step_id };
    if (organizationId) ruleQuery.organization_id = organizationId;

    const rules = await Rule.find(ruleQuery)
      .sort({ priority: 1 });
    
    res.json({
      success: true,
      rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /rules/:id - Update rule
router.put('/rules/:id', async (req, res) => {
  try {
    const { condition, next_step_id, priority } = req.body;
    
    const organizationId = req.headers['x-organization-id'];
    const ruleQuery = { id: req.params.id };
    if (organizationId) ruleQuery.organization_id = organizationId;

    const rule = await Rule.findOne(ruleQuery);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    const updates = {};
    if (condition !== undefined) updates.condition = condition;
    if (next_step_id !== undefined) updates.next_step_id = next_step_id;
    if (priority !== undefined) updates.priority = priority;
    
    await Rule.updateOne(
      { id: req.params.id },
      { ...updates, updated_at: new Date() }
    );

    if (priority !== undefined) {
      await reorderPriorities(rule.step_id);
    }
    
    const updatedRule = await Rule.findOne({ id: req.params.id });
    
    res.json({
      success: true,
      rule: updatedRule,
      message: 'Rule updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /rules/:id - Delete rule
router.delete('/rules/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const ruleQuery = { id: req.params.id };
    if (organizationId) ruleQuery.organization_id = organizationId;

    const rule = await Rule.findOne(ruleQuery);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    
    // Don't allow deletion of DEFAULT rules
    if (rule.condition === 'DEFAULT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete DEFAULT rule'
      });
    }
    
    const step_id = rule.step_id;
    await Rule.deleteOne({ id: req.params.id });
    
    await reorderPriorities(step_id);
    
    res.json({
      success: true,
      message: 'Rule deleted successfully and priorities synchronized'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
