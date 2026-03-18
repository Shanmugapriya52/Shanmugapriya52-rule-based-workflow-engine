const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `rule-${Date.now()}`
  },
  step_id: {
    type: String,
    required: true,
    ref: "Step"
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  condition: {
    type: String,
    required: true,
    trim: true
  },
  next_step_id: {
    type: String,
    default: null
  },
  priority: {
    type: Number,
    required: true,
    default: 1
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
ruleSchema.index({ step_id: 1 });
ruleSchema.index({ priority: 1 });

module.exports = mongoose.model("Rule", ruleSchema);
