const express = require('express');
const router = express.Router();
const AutomationRule = require('../models/AutomationRule');

// Get all rules
router.get('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = organizationId ? { organization_id: organizationId } : {};
    const rules = await AutomationRule.find(query).sort({ created_at: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create rule
router.post('/', async (req, res) => {
  const organizationId = req.headers['x-organization-id'];
  const ruleData = { ...req.body };
  if (organizationId) ruleData.organization_id = organizationId;
  
  const rule = new AutomationRule(ruleData);
  try {
    const newRule = await rule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update rule
router.put('/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { _id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    const updatedRule = await AutomationRule.findOneAndUpdate(
      query,
      req.body,
      { new: true }
    );
    res.json(updatedRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete rule
router.delete('/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { _id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    await AutomationRule.deleteOne(query);
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
