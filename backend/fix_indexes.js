const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow-engine');
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const workflowCollection = collections.find(c => c.name === 'workflows');
    
    if (workflowCollection) {
      console.log('Dropping unique index on workflows...');
      try {
        await mongoose.connection.db.collection('workflows').dropIndex('id_1');
        console.log('Index id_1 dropped');
      } catch (e) {
        console.log('Index id_1 not found or already dropped');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixIndex();
