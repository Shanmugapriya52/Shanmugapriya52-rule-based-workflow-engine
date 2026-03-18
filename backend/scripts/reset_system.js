const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const resetSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for system reset...');

    // Get all collection names directly from the DB
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      // Skip system collections if any
      if (collectionName.startsWith('system.')) continue;
      
      await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`Cleared collection: ${collectionName}`);
    }

    // Re-create only the admin user so the user can log in
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      email: 'admin@halleyx.com',
      status: 'Active'
    });

    await adminUser.save();
    console.log('Restored admin user: admin / admin123');

    console.log('System reset to zero. All data cleared from all collections.');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
};


resetSystem();
