// Test script for author application endpoints with authentication
const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testWithAuth() {
  console.log('Testing Author Application Endpoints with Authentication...\n');

  try {
    // Step 1: Try to get a valid test user token
    // We'll need to create a test user and login first
    console.log('1. Creating a test user for authentication...');
    
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };

    let authToken = null;

    try {
      // Register user
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ Test user created');
      
      // The registration response includes a token that can be used even before email verification
      authToken = registerResponse.data.token;
      console.log('✅ Authentication token obtained from registration');
    } catch (error) {
      console.log('❌ Failed to create test user:', error.response?.data?.error?.message || error.message);
      return;
    }

    // Step 2: Test authenticated endpoints
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // Test /can-apply with authentication
    console.log('\n2. Testing /can-apply with authentication...');
    try {
      const response = await axios.get(`${API_BASE}/author-applications/can-apply`, {
        headers: authHeaders
      });
      console.log('✅ /can-apply successful:', response.data);
    } catch (error) {
      console.log('❌ /can-apply failed:', error.response?.status, error.response?.data);
    }

    // Test /my-application with authentication
    console.log('\n3. Testing /my-application with authentication...');
    try {
      const response = await axios.get(`${API_BASE}/author-applications/my-application`, {
        headers: authHeaders
      });
      console.log('✅ /my-application successful:', response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ /my-application correctly returns 404 (no application found)');
      } else {
        console.log('❌ /my-application failed:', error.response?.status, error.response?.data);
      }
    }

    // Test submitting an application
    console.log('\n4. Testing application submission...');
    try {
      const applicationData = {
        application_text: 'I am passionate about beekeeping and would love to share my knowledge with the community. I have been keeping bees for over 5 years and have experience in various aspects of beekeeping including hive management, honey production, and bee health.'
      };

      const response = await axios.post(`${API_BASE}/author-applications`, applicationData, {
        headers: authHeaders
      });
      console.log('✅ Application submitted successfully:', response.data);

      // Now test /my-application again to see the submitted application
      console.log('\n5. Testing /my-application after submission...');
      try {
        const myAppResponse = await axios.get(`${API_BASE}/author-applications/my-application`, {
          headers: authHeaders
        });
        console.log('✅ Retrieved submitted application:', myAppResponse.data);
      } catch (error) {
        console.log('❌ Failed to retrieve submitted application:', error.response?.data);
      }

      // Test /can-apply again (should now return false)
      console.log('\n6. Testing /can-apply after submission (should be false)...');
      try {
        const canApplyResponse = await axios.get(`${API_BASE}/author-applications/can-apply`, {
          headers: authHeaders
        });
        console.log('✅ /can-apply after submission:', canApplyResponse.data);
      } catch (error) {
        console.log('❌ /can-apply after submission failed:', error.response?.data);
      }

    } catch (error) {
      console.log('❌ Application submission failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

// Run the test
testWithAuth().catch(console.error);