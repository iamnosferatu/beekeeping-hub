// Test script for author application endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testAuthorEndpoints() {
  console.log('Testing Author Application Endpoints...\n');

  try {
    // Test 1: Check /can-apply without authentication (should fail)
    console.log('1. Testing /can-apply without auth (should fail with 401)...');
    try {
      const response = await axios.get(`${API_BASE}/author-applications/can-apply`);
      console.log('❌ Unexpected success:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 2: Check /my-application without authentication (should fail)
    console.log('\n2. Testing /my-application without auth (should fail with 401)...');
    try {
      const response = await axios.get(`${API_BASE}/author-applications/my-application`);
      console.log('❌ Unexpected success:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 3: Check general API health
    console.log('\n3. Testing API health...');
    try {
      const response = await axios.get(`${API_BASE}/health`);
      console.log('✅ API health check passed:', response.data.message);
    } catch (error) {
      console.log('❌ API health check failed:', error.message);
    }

    // Test 4: Check if the route is registered
    console.log('\n4. Testing route registration...');
    try {
      const response = await axios.get(`${API_BASE}/`);
      const endpoints = response.data.endpoints;
      if (endpoints.includes('/author-applications')) {
        console.log('✅ Author applications route is registered');
      } else {
        console.log('❌ Author applications route NOT found in endpoints list');
        console.log('Available endpoints:', endpoints);
      }
    } catch (error) {
      console.log('❌ Could not check route registration:', error.message);
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

// Run the test
testAuthorEndpoints().catch(console.error);