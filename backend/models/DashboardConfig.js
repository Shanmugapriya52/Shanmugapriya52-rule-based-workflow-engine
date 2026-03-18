const mongoose = require('mongoose');

const DashboardConfigSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  title: { type: String, default: 'My Dashboard' },
  widgets: { type: Array, default: [] },
  quickActions: { type: Array, default: [] },
  permissions: { type: Array, default: [] },
  theme: { type: String, default: 'default' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DashboardConfig', DashboardConfigSchema);
