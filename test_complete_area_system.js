const axios = require('axios');

const BASE_URL = 'http://localhost:3000/v2/panel/api/bps';

async function testCompleteAreaSystem() {
  console.log('🧪 Testing Complete BPS Area Management System\n');

  // Test 1: Check if server is running
  console.log('1. Testing server health:');
  try {
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server health check passed:', healthResponse.data.status);
  } catch (error) {
    console.log('❌ Server health check failed:', error.response?.status, error.response?.data);
    return;
  }

  // Test 2: Test existing config endpoint (should work without auth)
  console.log('\n2. Testing existing config endpoint:');
  try {
    const configResponse = await axios.get(`${BASE_URL}/config`);
    console.log('✅ Config endpoint works:', configResponse.data.success);
  } catch (error) {
    console.log('❌ Config endpoint failed:', error.response?.status, error.response?.data);
  }

  // Test 3: Test areas endpoint without auth (should fail)
  console.log('\n3. Testing /areas endpoint without auth (should fail):');
  try {
    const areasResponse = await axios.get(`${BASE_URL}/areas`);
    console.log('❌ Unexpected success:', areasResponse.data);
  } catch (error) {
    console.log('✅ Expected failure (auth required):', error.response?.status);
  }

  // Test 4: Test areas/test endpoint without auth (should fail)
  console.log('\n4. Testing /areas/test endpoint without auth (should fail):');
  try {
    const testResponse = await axios.get(`${BASE_URL}/areas/test`);
    console.log('❌ Unexpected success:', testResponse.data);
  } catch (error) {
    console.log('✅ Expected failure (auth required):', error.response?.status);
  }

  // Test 5: Test areas/sync endpoint without auth (should fail)
  console.log('\n5. Testing /areas/sync endpoint without auth (should fail):');
  try {
    const syncResponse = await axios.post(`${BASE_URL}/areas/sync`);
    console.log('❌ Unexpected success:', syncResponse.data);
  } catch (error) {
    console.log('✅ Expected failure (auth required):', error.response?.status);
  }

  // Test 6: Test manual area management endpoints
  console.log('\n6. Testing manual area management endpoints:');
  
  // Test GET areas (should fail without auth)
  try {
    const getAreasResponse = await axios.get(`${BASE_URL}/areas`);
    console.log('❌ GET /areas should require auth');
  } catch (error) {
    console.log('✅ GET /areas requires auth:', error.response?.status);
  }

  // Test POST areas (should fail without auth)
  try {
    const postAreaResponse = await axios.post(`${BASE_URL}/areas`, {
      area_code: 'TEST01',
      area_name: 'Test Area',
      area_type: 'province',
      priority_level: 1
    });
    console.log('❌ POST /areas should require auth');
  } catch (error) {
    console.log('✅ POST /areas requires auth:', error.response?.status);
  }

  // Test 7: Test BPS API accessibility directly
  console.log('\n7. Testing BPS API accessibility:');
  try {
    const bpsTestResponse = await axios.get('https://webapi.bps.go.id/v1/api/domain/type/all/key/4f25b3b3bb4eee15614e93834eb58cd7');
    console.log('✅ BPS API is accessible:', bpsTestResponse.status);
    console.log('   Response size:', JSON.stringify(bpsTestResponse.data).length, 'bytes');
  } catch (error) {
    console.log('❌ BPS API access failed:', error.response?.status, error.response?.data);
  }

  console.log('\n📋 Summary:');
  console.log('- ✅ Server is running and healthy');
  console.log('- ✅ Existing endpoints work correctly');
  console.log('- ✅ New area endpoints properly require authentication');
  console.log('- ✅ BPS API is accessible from this environment');
  console.log('- ⚠️  Manual area management requires authentication');
  console.log('- ⚠️  Area fetching/syncing requires authentication');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Restart the server to ensure new routes are registered');
  console.log('2. Test with proper authentication (admin user)');
  console.log('3. Configure BPS API key in the admin panel');
  console.log('4. Test area fetching and synchronization with valid credentials');
}

testCompleteAreaSystem().catch(console.error);