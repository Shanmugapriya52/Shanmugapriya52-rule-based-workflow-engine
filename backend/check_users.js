const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find();
    console.log('Users in DB:', users.length);
    users.forEach(u => console.log(`- ${u.username} (${u.role})`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
