const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `step-${Date.now()}`
  },
  workflow_id: {
    type: String,
    required: true,
    ref: "Workflow"
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  step_type: {
    type: String,
    required: true,
    enum: ["task", "approval", "notification"]
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
stepSchema.index({ workflow_id: 1 });
stepSchema.index({ order: 1 });

module.exports = mongoose.model("Step", stepSchema);
