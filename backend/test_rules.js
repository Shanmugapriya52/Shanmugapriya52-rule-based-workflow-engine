const http = require('http');

const request = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, res => {
      let responseData = '';
      res.on('data', d => responseData += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch(e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runTests() {
  console.log('--- Starting Workflow API Tests ---');
  
  // 1. Create Workflow
  const wfResponse = await request('POST', '/workflows', {
    name: 'Test Workflow',
    description: 'Testing rules engine',
    input_schema: {
      fields: [
        { name: 'amount', type: 'number', required: true }
      ]
    }
  });
  console.log('Create Workflow:', wfResponse.status, wfResponse.data.success);
  const wfId = wfResponse.data.workflow.id;

  // 2. Create Steps
  const step1Res = await request('POST', `/workflows/${wfId}/steps`, {
    name: 'Initial Check',
    step_type: 'task',
    order: 1
  });
  const step1Id = step1Res.data.step.id;
  
  const step2Res = await request('POST', `/workflows/${wfId}/steps`, {
    name: 'Approval Required',
    step_type: 'approval',
    order: 2
  });
  const step2Id = step2Res.data.step.id;

  const step3Res = await request('POST', `/workflows/${wfId}/steps`, {
    name: 'Auto Approved',
    step_type: 'task',
    order: 3
  });
  const step3Id = step3Res.data.step.id;

  console.log('Create Steps:', step1Res.status, step2Res.status, step3Res.status);

  // 3. Create Rules on Step 1
  const rule1Res = await request('POST', `/steps/${step1Id}/rules`, {
    condition: 'amount > 1000',
    next_step_id: step2Id,
    priority: 1
  });
  
  const rule2Res = await request('POST', `/steps/${step1Id}/rules`, {
    condition: 'amount <= 1000',
    next_step_id: step3Id,
    priority: 2
  });
  console.log('Create Rules:', rule1Res.status, rule2Res.status);

  // 4. Update Workflow to publish (so it can be executed)
  const wfUpdateRes = await request('PUT', `/workflows/${wfId}`, {
    is_active: true,
    start_step_id: step1Id
  });
  console.log('Update Workflow to active:', wfUpdateRes.status);

  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 1000));

  // 5. Execute workflow (Path 1: amount > 1000 -> Approval Required)
  const exec1Res = await request('POST', `/workflows/${wfId}/execute`, {
    data: { amount: 1500 }
  });
  console.log('Execute Path 1:', exec1Res.status, exec1Res.data.execution?.status);
  
  if(exec1Res.data.execution) {
      setTimeout(async () => {
         const logRes = await request('GET', `/executions/${exec1Res.data.execution.id}`);
         console.log('Execution 1 Logs Status:', logRes.data.execution.status); // should be in_progress because it stops at approval step
         console.log('Execution 1 Current Step:', logRes.data.execution.current_step_id, '(Expected:', step2Id, ')');
      }, 500);
  }

  // 6. Execute workflow (Path 2: amount <= 1000 -> Auto Approved)
  const exec2Res = await request('POST', `/workflows/${wfId}/execute`, {
    data: { amount: 500 }
  });
  console.log('Execute Path 2:', exec2Res.status, exec2Res.data.execution?.status);

  if (exec2Res.data.execution) {
      setTimeout(async () => {
         const logRes2 = await request('GET', `/executions/${exec2Res.data.execution.id}`);
         console.log('Execution 2 Logs Status:', logRes2.data.execution.status); // should be completed
         console.log('Execution 2 End:', logRes2.data.execution.logs[1]?.step_name); 
      }, 600);
  }
}

runTests().catch(console.error);
