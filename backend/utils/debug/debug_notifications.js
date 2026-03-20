const mongoose = require('mongoose');
const User = require('../../models/User');
const Execution = require('../../models/Execution');
const Notification = require('../../models/Notification');

async function debugNotifications() {
  await mongoose.connect('mongodb://localhost:27017/halleyx-workflow');
  
  console.log('--- RECENT NOTIFICATIONS ---');
  const notifs = await Notification.find().sort({ created_at: -1 }).limit(5);
  notifs.forEach(n => {
    console.log(`To: ${n.user_id}, Title: ${n.title}, Org: ${n.organization_id}, Created: ${n.created_at}`);
  });

  console.log('\n--- RECENT EXECUTIONS ---');
  const execs = await Execution.find().sort({ started_at: -1 }).limit(3);
  execs.forEach(e => {
    console.log(`ID: ${e.id}, Status: ${e.status}, Org: ${e.organization_id}, Step: ${e.current_step_id}`);
  });

  console.log('\n--- USERS ---');
  const users = await User.find();
  users.forEach(u => {
    console.log(`ID: ${u._id}, Name: ${u.username}, Role: ${u.role}, Org: ${u.organization_id}`);
  });

  await mongoose.disconnect();
}

debugNotifications();
