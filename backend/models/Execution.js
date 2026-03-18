const mongoose = require('mongoose');

const stepLogSchema = new mongoose.Schema({
  step_id: {
    type: String
  },
  step_name: {
    type: String,
    required: true
  },
  step_type: {
    type: String,
    required: true,
    enum: ['task', 'approval', 'notification', 'unknown']
  },
  evaluated_rules: [{
    rule_id: String,
    condition: String,
    matched: Boolean
  }],
  selected_next_step: String,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'pending_approval', 'in_progress', 'completed', 'approved', 'rejected', 'failed', 'canceled']
  },
  approver_id: String,
  error_message: String,
  started_at: Date,
  ended_at: Date,
  duration: Number // in milliseconds
}, { _id: false });

const executionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `exec-${Date.now()}`
  },
  workflow_id: {
    type: String,
    required: true,
    ref: 'Workflow'
  },
  workflow_version: {
    type: Number,
    required: true
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'pending_approval', 'completed', 'failed', 'canceled'],
    default: 'pending'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  logs: [stepLogSchema],
  current_step_id: String,
  retries: {
    type: Number,
    default: 0
  },
  triggered_by: {
    type: String,
    required: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  ended_at: Date
});

// Index for better query performance
executionSchema.index({ workflow_id: 1 });
executionSchema.index({ status: 1 });
executionSchema.index({ triggered_by: 1 });
executionSchema.index({ started_at: -1 });

module.exports = mongoose.model('Execution', executionSchema);
