const { User } = require('../src/models');
const { sequelize } = require('../src/models');

async function debugUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role']
    });
    
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check for admin user specifically
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    console.log('\nAdmin user check:', adminUser ? `Found (ID: ${adminUser.id})` : 'NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugUsers();