const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `wf-${Date.now()}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true
  },
  input_schema: {
    type: mongoose.Schema.Types.Mixed,
    default: { type: "object", fields: [] }
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  start_step_id: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Indexes
workflowSchema.index({ name: 1 });
workflowSchema.index({ is_active: 1 });
workflowSchema.index({ created_at: -1 });

module.exports = mongoose.model("Workflow", workflowSchema);
