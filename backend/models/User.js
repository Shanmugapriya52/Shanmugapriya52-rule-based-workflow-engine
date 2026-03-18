const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple password for now as per requirements
  role: { type: String, default: 'User' },
  department: { type: String },
  email: { type: String },
  status: { type: String, default: 'Active' },
  organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
