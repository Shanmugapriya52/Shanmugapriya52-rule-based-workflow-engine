const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'Administrator',
        email: 'admin@halleyx.com',
        department: 'Operations'
      });
      await admin.save();
      console.log('Admin user created successfully: admin / admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
