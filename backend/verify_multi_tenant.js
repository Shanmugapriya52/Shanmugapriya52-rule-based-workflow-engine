const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Models
const Organization = require('./models/Organization');
const User = require('./models/User');
const Workflow = require('./models/Workflow');
const Execution = require('./models/Execution');
const Notification = require('./models/Notification');

async function verifyIsolation() {
  try {
    console.log('Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workflow_db';
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    // 1. Setup Test Organizations
    console.log('\n--- Setting up test tenants ---');
    const orgA = await Organization.findOneAndUpdate(
      { name: 'Tenant A' }, 
      { name: 'Tenant A' }, 
      { upsert: true, new: true }
    );
    const orgB = await Organization.findOneAndUpdate(
      { name: 'Tenant B' }, 
      { name: 'Tenant B' }, 
      { upsert: true, new: true }
    );
    console.log(`Created Org A: ${orgA._id}`);
    console.log(`Created Org B: ${orgB._id}`);

    // 2. Create Isolated Data
    console.log('\n--- Creating isolated data ---');
    const workflowA = await Workflow.findOneAndUpdate(
      { name: 'Workflow A', organization_id: orgA._id },
      { id: 'wf-a', name: 'Workflow A', organization_id: orgA._id, is_active: true },
      { upsert: true, new: true }
    );
    console.log(`Workflow A created for Org A: ${workflowA.id}`);

    // 3. Verify Isolation via Queries (simulating route logic)
    console.log('\n--- Verifying isolation queries ---');
    
    const findAWithA = await Workflow.find({ organization_id: orgA._id });
    console.log(`Query Org A data with Org A ID: ${findAWithA.length > 0 ? 'SUCCESS' : 'FAILURE'}`);

    const findAWithB = await Workflow.find({ organization_id: orgB._id });
    console.log(`Query Org A data with Org B ID: ${findAWithB.length === 0 ? 'SUCCESS (Isolated)' : 'FAILURE (Leaked)'}`);

    // 4. Verify User Isolation
    console.log('\n--- Verifying User isolation ---');
    const userA = await User.findOneAndUpdate(
      { username: 'adminA', organization_id: orgA._id },
      { username: 'adminA', organization_id: orgA._id, role: 'admin', password: 'password', email: 'a@a.com' },
      { upsert: true, new: true }
    );

    const usersForB = await User.find({ organization_id: orgB._id });
    const isLeaked = usersForB.some(u => u.username === 'adminA');
    console.log(`User A isolation in Org B: ${!isLeaked ? 'SUCCESS (Isolated)' : 'FAILURE (Leaked)'}`);

    console.log('\n--- Verification Phase Complete ---');
    
    // Cleanup if needed, but better to keep for now
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyIsolation();
