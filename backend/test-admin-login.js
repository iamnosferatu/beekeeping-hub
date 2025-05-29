// Test admin login and token generation
const axios = require('axios');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

const API_URL = 'http://localhost:8080/api';

async function testAdminLogin() {
  try {
    console.log('=== Testing Admin Login ===\n');

    // Get admin user from database
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.error('No admin user found in database!');
      return;
    }

    console.log('Admin user in database:');
    console.log('- ID:', admin.id);
    console.log('- Username:', admin.username);
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);

    // Test login with default password
    console.log('\nTesting login with credentials:');
    console.log('- Email: admin@beekeeper.com');
    console.log('- Password: admin123');

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@beekeeper.com',
        password: 'admin123'
      });

      console.log('\n✓ Login successful!');
      console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
      console.log('User data returned:', {
        id: loginResponse.data.user.id,
        username: loginResponse.data.user.username,
        role: loginResponse.data.user.role
      });

      // Test authenticated request
      const token = loginResponse.data.token;
      console.log('\nTesting authenticated request...');
      
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✓ /auth/me successful:', {
        id: meResponse.data.user.id,
        role: meResponse.data.user.role
      });

      // Test article delete
      console.log('\nTesting DELETE /api/articles/1...');
      try {
        await axios.delete(`${API_URL}/articles/1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✓ Delete successful');
      } catch (error) {
        console.log('✗ Delete failed:', error.response?.data || error.message);
      }

    } catch (error) {
      console.error('✗ Login failed:', error.response?.data || error.message);
      
      // Check password hash
      console.log('\nChecking password hash...');
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log('Password "admin123" is valid:', isValid);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

// Run test
testAdminLogin();