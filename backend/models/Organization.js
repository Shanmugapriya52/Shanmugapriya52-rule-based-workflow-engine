const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `org-${Date.now()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  settings: {
    theme: { type: String, default: 'lilac-lollipop' },
    logo: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
