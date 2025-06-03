const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

async function resetAdminPassword() {
  try {
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminUser) {
      console.error('No admin user found');
      process.exit(1);
    }
    
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await adminUser.update({ password: hashedPassword });
    
    console.log('✅ Admin password reset successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();