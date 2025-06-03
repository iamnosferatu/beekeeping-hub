const axios = require('axios');

async function getAdminToken() {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@beekeeper.com',
      password: 'admin123'
    });
    
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('Admin token:', response.data.token);
    
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
  }
}

getAdminToken();