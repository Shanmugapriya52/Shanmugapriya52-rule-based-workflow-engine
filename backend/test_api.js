const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/workflows',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Workflows count:', parsed.workflows ? parsed.workflows.length : 0);
    } catch(e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw response:', data.substring(0, 100));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.end();
