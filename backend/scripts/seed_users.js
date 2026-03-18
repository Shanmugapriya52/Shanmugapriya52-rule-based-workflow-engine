const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'Administrator',
    department: 'IT',
    email: 'admin@halleyx.com',
    status: 'Active'
  },
  {
    username: 'manager',
    password: 'manager123',
    role: 'Manager',
    department: 'Operations',
    email: 'manager@halleyx.com',
    status: 'Active'
  },
  {
    username: 'finance',
    password: 'finance123',
    role: 'Finance',
    department: 'Finance',
    email: 'finance@halleyx.com',
    status: 'Active'
  },
  {
    username: 'employee',
    password: 'employee123',
    role: 'Employee',
    department: 'Engineering',
    email: 'employee@halleyx.com',
    status: 'Active'
  },
  {
    username: 'ceo',
    password: 'ceo123',
    role: 'CEO',
    department: 'Executive',
    email: 'ceo@halleyx.com',
    status: 'Active'
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users just in case
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert default users
    const createdUsers = await User.insertMany(defaultUsers);
    console.log(`Successfully seeded ${createdUsers.length} users!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
