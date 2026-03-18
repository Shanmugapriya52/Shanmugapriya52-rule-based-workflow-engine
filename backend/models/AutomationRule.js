const mongoose = require('mongoose');

const AutomationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  trigger: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  conditions: { type: Array, default: [] },
  actions: { type: Array, default: [] },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AutomationRule', AutomationRuleSchema);
