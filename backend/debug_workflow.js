const mongoose = require('mongoose');
const Execution = require('./models/Execution');
const Step = require('./models/Step');
const Rule = require('./models/Rule');
const Workflow = require('./models/Workflow');

async function debug() {
  try {
    await mongoose.connect('mongodb://localhost:27017/halleyx-workflow');
    console.log('Connected to MongoDB');

    const lastExec = await Execution.findOne({}).sort({ started_at: -1 });
    if (!lastExec) {
      console.log('No executions found');
      return;
    }

    console.log('--- Last Execution ---');
    console.log(JSON.stringify(lastExec, null, 2));
    
    console.log('\n--- Execution Logs ---');
    console.log(JSON.stringify(lastExec.logs, null, 2));

    const steps = await Step.find({ workflow_id: lastExec.workflow_id }).sort({ order: 1 });
    console.log('\n--- Steps ---');
    console.log(JSON.stringify(steps, null, 2));

    const stepIds = steps.map(s => s.id);
    const rules = await Rule.find({ step_id: { $in: stepIds } }).sort({ priority: 1 });
    console.log('\n--- Rules ---');
    console.log(JSON.stringify(rules, null, 2));

    const workflow = await Workflow.findOne({ id: lastExec.workflow_id });
    console.log('\n--- Workflow ---');
    console.log(JSON.stringify(workflow, null, 2));

  } catch (err) {
    console.error('Debug failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
