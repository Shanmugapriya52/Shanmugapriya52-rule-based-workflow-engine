const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Workflow = require('./models/Workflow');
const Execution = require('./models/Execution');
const Notification = require('./models/Notification');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB for migration...");

    // 1. Create Default Organization
    let defaultOrg = await Organization.findOne({ name: 'Global Hub' });
    if (!defaultOrg) {
      defaultOrg = new Organization({
        name: 'Global Hub',
        id: 'org-default'
      });
      await defaultOrg.save();
      console.log("Created 'Global Hub' as default organization.");
    }

    // 2. Assign null-org data to default org
    const filter = { organization_id: { $exists: false } };
    const update = { organization_id: defaultOrg._id };

    const users = await User.updateMany(filter, update);
    const workflows = await Workflow.updateMany(filter, update);
    const executions = await Execution.updateMany(filter, update);
    const notifications = await Notification.updateMany(filter, update);

    console.log(`Migration Complete:
    - Users updated: ${users.modifiedCount}
    - Workflows updated: ${workflows.modifiedCount}
    - Executions updated: ${executions.modifiedCount}
    - Notifications updated: ${notifications.modifiedCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Migration Failed:", err);
    process.exit(1);
  }
}

migrate();
