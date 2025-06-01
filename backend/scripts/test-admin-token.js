// Test if admin token is working correctly
const axios = require('axios');
const { User } = require('../src/models');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

async function testAdminOperations() {
  try {
    // Get admin user
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.error('No admin user found!');
      return;
    }

    // Generate token
    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '30d' });
    console.log('Admin token generated');

    // Test getting articles (should work)
    console.log('\n1. Testing GET /api/articles...');
    try {
      const response = await axios.get(`${API_URL}/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ GET articles successful');
    } catch (error) {
      console.log('✗ GET articles failed:', error.response?.data || error.message);
    }

    // Test deleting an article
    console.log('\n2. Testing DELETE /api/articles/1...');
    try {
      const response = await axios.delete(`${API_URL}/articles/1`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ DELETE article successful:', response.data);
    } catch (error) {
      console.log('✗ DELETE article failed:', error.response?.data || error.message);
    }

    // Test admin-specific route
    console.log('\n3. Testing PUT /api/admin/articles/1/block...');
    try {
      const response = await axios.put(
        `${API_URL}/admin/articles/1/block`,
        { reason: 'Test block' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ Block article successful:', response.data);
    } catch (error) {
      console.log('✗ Block article failed:', error.response?.data || error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

// Wait a moment for the server to be ready
setTimeout(testAdminOperations, 1000);