const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Organization = require('../models/Organization');
const mongoose = require('mongoose');

// Helper to get role permissions
const getRolePermissions = (roleId) => {
  const permissions = {
    admin: ['manage_system', 'create_workflow', 'delete_workflow', 'view_logs'],
    manager: ['create_workflow', 'approve_workflows'],
    finance: ['approve_financial'],
    employee: ['execute_workflow'],
    ceo: ['view_all']
  };
  return permissions[roleId.toLowerCase()] || [];
};

// Signup - Creates a new organization AND its first admin user
router.post('/signup', async (req, res) => {
  try {
    const { organizationName, username, password, email } = req.body;

    // 1. Create Organization
    const organization = new Organization({
      name: organizationName
    });
    await organization.save();

    // 2. Create Admin User
    const user = new User({
      username,
      password,
      email,
      role: 'admin',
      organization_id: organization._id,
      status: 'Active'
    });

    try {
      await user.save();
    } catch (userError) {
      // Manual rollback if user creation fails
      await Organization.findByIdAndDelete(organization._id);
      throw userError; 
    }

    // 3. Update Organization with Admin reference
    organization.admin_id = user._id;
    await organization.save();

    res.status(201).json({
      success: true,
      message: "Organization and Admin created successfully",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        organization_id: user.organization_id
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login - Multi-tenant aware
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user and populate organization
    const user = await User.findOne({ username, password }).populate('organization_id');
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const authUser = {
      _id: user._id,
      username: user.username,
      role: user.role,
      organization_id: user.organization_id?._id,
      organizationName: user.organization_id?.name || 'Default Org',
      permissions: getRolePermissions(user.role)
    };

    res.json({ success: true, user: authUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
