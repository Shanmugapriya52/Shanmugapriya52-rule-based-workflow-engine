const mongoose = require('mongoose');

async function checkIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/halleyx-workflow');
    
    const usersCollection = mongoose.connection.db.collection('users');
    const indexes = await usersCollection.indexes();
    
    console.log('USER_INDEXES_START');
    console.log(JSON.stringify(indexes, null, 2));
    console.log('USER_INDEXES_END');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkIndexes();
