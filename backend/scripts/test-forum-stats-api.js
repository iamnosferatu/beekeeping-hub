const axios = require('axios');

async function testForumStatsAPI() {
  try {
    // First get admin token
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@beekeeper.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Got admin token');
    
    // Test forum stats endpoint
    console.log('\nTesting /api/admin/forum/stats...');
    try {
      const statsResponse = await axios.get('http://localhost:8080/api/admin/forum/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Success:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.error('Error:', error.response?.status, error.response?.data);
      console.error('Full error:', error.message);
    }
    
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
  }
}

testForumStatsAPI();