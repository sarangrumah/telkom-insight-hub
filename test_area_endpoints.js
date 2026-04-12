const axios = require('axios');

const BASE_URL = 'http://localhost:3000/v2/panel/api/bps';

async function testAreaEndpoints() {
  console.log('Testing BPS Area Endpoints...\n');

  // Test 1: Test without authentication (should fail)
  console.log('1. Testing /areas/test without authentication (should fail):');
  try {
    const response = await axios.get(`${BASE_URL}/areas/test`);
    console.log('❌ Unexpected success:', response.data);
  } catch (error) {
    console.log('✅ Expected failure:', error.response?.status, error.response?.data);
  }

  // Test 2: Test with authentication (need to get a valid token first)
  console.log('\n2. Testing /areas/test with authentication:');
  try {
    // First, try to get a token (this might not work if auth system is complex)
    const loginResponse = await axios.post(`${BASE_URL}/../auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Got token:', token ? 'Yes' : 'No');
    
    if (token) {
      const response = await axios.get(`${BASE_URL}/areas/test`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Success:', response.data);
    } else {
      console.log('⚠️  Cannot test authenticated endpoints without valid token');
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.status, error.response?.data);
    console.log('⚠️  Cannot test authenticated endpoints without valid token');
  }

  // Test 3: Test sync endpoint without authentication (should fail)
  console.log('\n3. Testing /areas/sync without authentication (should fail):');
  try {
    const response = await axios.post(`${BASE_URL}/areas/sync`);
    console.log('❌ Unexpected success:', response.data);
  } catch (error) {
    console.log('✅ Expected failure:', error.response?.status, error.response?.data);
  }

  // Test 4: Test existing endpoints that should work
  console.log('\n4. Testing existing /config endpoint:');
  try {
    const response = await axios.get(`${BASE_URL}/config`);
    console.log('✅ Config endpoint works:', response.data);
  } catch (error) {
    console.log('❌ Config endpoint failed:', error.response?.status, error.response?.data);
  }

  console.log('\nTest completed!');
}

testAreaEndpoints().catch(console.error);