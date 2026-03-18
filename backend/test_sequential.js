const mongoose = require('mongoose');
const Execution = require('./models/Execution');
const Step = require('./models/Step');
const Workflow = require('./models/Workflow');
const Notification = require('./models/Notification');
const Rule = require('./models/Rule');
const User = require('./models/User');
const executionsRouter = require('./routes/executions');

async function runTest() {
  await mongoose.connect('mongodb://localhost:27017/halleyx_workflow');
  console.log('Connected to DB');

  // Let's check a pending execution
  const pending = await Execution.find({ status: { $in: ['in_progress', 'pending_approval'] } }).sort({ started_at: -1 }).limit(1);
  
  if (pending.length === 0) {
    console.log('No pending executions. Trigger one from UI.');
    process.exit(0);
  }

  const exec = pending[0];
  console.log(`Execution ${exec.id} is ${exec.status}`);
  console.log(`Current Step ID: ${exec.current_step_id}`);

  // Fetch the current step
  const step = await Step.findOne({ id: exec.current_step_id });
  if (step) {
    console.log(`Step Name: ${step.name}, Type: ${step.step_type}`);
    
    // Find who has pending notifications for this workflow execution
    const notifs = await Notification.find({ execution_id: exec.id }).populate('user_id');
    console.log(`\nNotifications sent for this execution:`);
    for (const n of notifs) {
      if (n.user_id) {
        console.log(`- To ${n.user_id.username} (${n.user_id.role}): [${n.type}] ${n.title} - ${n.message}`);
      }
    }

    // Now let's simulate a completion if it's an approval
    if (step.step_type === 'approval') {
      console.log(`\nSimulating API call to approve step ${step.id}...`);
      
      // Need to find an approver
      let approverRole = step.metadata?.target_role || 'manager';
      if (step.name.toLowerCase().includes('ceo')) approverRole = 'ceo';
      if (step.name.toLowerCase().includes('finance') || step.name.toLowerCase().includes('cfo')) approverRole = 'cfo';
      
      const potentialApprovers = await User.find({ role: { $regex: new RegExp(approverRole, 'i') } });
      const approver = potentialApprovers.length > 0 ? potentialApprovers[0].username : 'admin';
      
      console.log(`We will approve as: ${approver}`);
      console.log('Use POST http://localhost:5000/api/executions/' + exec.id + '/complete-step');
      console.log({ step_id: step.id, action: 'approve', approver_username: approver });
    }
  }

  process.exit(0);
}

runTest().catch(console.error);
