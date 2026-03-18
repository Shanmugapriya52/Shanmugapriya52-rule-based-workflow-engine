const mongoose = require('mongoose');
const Rule = require('./models/Rule');

const API_BASE = 'http://localhost:5000/api';
const ORG_ID = '65f1a2b3c4d5e6f7a8b9c0d1'; // Mock Org ID

async function verifyFixes() {
  try {
    console.log('--- STARTING LIVE FETCH VERIFICATION ---');
    
    // Connect to DB for direct verification
    await mongoose.connect('mongodb://localhost:27017/halleyx-workflow');
    console.log('Connected to MongoDB');

    // 1. Create a Workflow
    const workflowId = `wf-test-${Date.now()}`;
    const workflowRes = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-organization-id': ORG_ID 
      },
      body: JSON.stringify({
        name: 'Verification Workflow',
        organization_id: ORG_ID
      })
    });
    const workflowData = await workflowRes.json();
    if (!workflowData.success) throw new Error('Workflow creation failed');
    console.log('1. Created Workflow:', workflowId);

    // 2. Create Steps out of order
    console.log('2. Creating steps out of order via API...');
    
    const postStep = async (name, order) => {
      const res = await fetch(`${API_BASE}/workflows/${workflowId}/steps`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-organization-id': ORG_ID 
        },
        body: JSON.stringify({
          name,
          step_type: 'approval',
          order,
          organization_id: ORG_ID
        })
      });
      const data = await res.json();
      return data.step;
    };

    const step3 = await postStep('CEO Approval', 3);
    console.log('Created Step 3 (CEO)');
    
    const step1 = await postStep('Manager Approval', 1);
    console.log('Created Step 1 (Manager)');
    
    const step2 = await postStep('Head Approval', 2);
    console.log('Created Step 2 (Head) - This should link Step 1 to Step 2 AND Step 2 to Step 3');

    // 3. Verify Linking in DB
    console.log('3. Verifying Bi-directional Smart Linking in Database...');
    
    const checkLink = async (fromStepId, expectedToStepId, label) => {
      const rule = await Rule.findOne({ step_id: fromStepId, condition: 'DEFAULT' });
      const linked = rule?.next_step_id === expectedToStepId;
      console.log(`Link [${label}]: ${linked ? '✅ OK' : '❌ FAILED'} (Expected: ${expectedToStepId}, Found: ${rule?.next_step_id})`);
      return linked;
    };

    const link1 = await checkLink(step1.id, step2.id, 'Manager -> Head');
    const link2 = await checkLink(step2.id, step3.id, 'Head -> CEO');
    const link3 = await checkLink(step3.id, null, 'CEO -> END');

    if (link1 && link2 && link3) {
      console.log('--- VERIFICATION SUCCESSFUL ---');
    } else {
      console.log('--- VERIFICATION FAILED ---');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Verification Error:', error.message);
    process.exit(1);
  }
}

verifyFixes();
