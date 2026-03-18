const express = require('express');
const router = express.Router();
const DashboardConfig = require('../models/DashboardConfig');

// Get dashboard config for a user
router.get('/:userId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { user_id: req.params.userId };
    if (organizationId) query.organization_id = organizationId;

    const config = await DashboardConfig.findOne(query);
    if (!config) {
      return res.status(200).json(null);
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save or update dashboard config
router.post('/', async (req, res) => {
  try {
    const { user_id, ...configData } = req.body;
    const organizationId = req.headers['x-organization-id'];
    
    const query = { user_id };
    if (organizationId) query.organization_id = organizationId;

    const update = { ...configData, user_id, updated_at: new Date() };
    if (organizationId) update.organization_id = organizationId;

    const config = await DashboardConfig.findOneAndUpdate(
      query,
      update,
      { new: true, upsert: true }
    );
    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
