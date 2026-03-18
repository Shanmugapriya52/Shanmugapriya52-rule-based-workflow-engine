const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// Broadcast notification to all users
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    
    // Get all active users
    const users = await User.find({ status: 'Active' });
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No active users found" });
    }

    const notifications = users.map(user => ({
      user_id: user._id,
      title: title || 'System Update',
      message: message || 'A new system update is available.',
      type: type || 'system_alert',
      priority: priority || 'medium'
    }));

    await Notification.insertMany(notifications);

    res.json({ 
      success: true, 
      message: `Notification broadcasted to ${users.length} users successfully.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all notifications (as requested by frontend)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const organizationId = req.headers['x-organization-id'];
    
    let query = {};
    if (userId && userId !== 'undefined' && userId !== 'null') {
      query.user_id = userId;
    }
    if (organizationId) {
      query.organization_id = organizationId;
    }
    
    const notifications = await Notification.find(query).sort({ created_at: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get notifications for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const organizationId = req.headers['x-organization-id'];
    
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.json([]);
    }
    
    const query = { user_id: userId };
    if (organizationId) query.organization_id = organizationId;
    
    const notifications = await Notification.find(query).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { _id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    const notification = await Notification.findOneAndUpdate(query, { read: true }, { new: true });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark all notifications for a user as read
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const userId = req.params.userId;
    const organizationId = req.headers['x-organization-id'];
    
    const query = { user_id: userId, read: false };
    if (organizationId) query.organization_id = organizationId;
    
    await Notification.updateMany(query, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    const query = { _id: req.params.id };
    if (organizationId) query.organization_id = organizationId;

    await Notification.findOneAndDelete(query);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
