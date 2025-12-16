/**
 * Test script to verify all service API endpoints are working properly
 */

async function testEndpoints() {
  console.log('Testing all service endpoints...');
  
  const endpoints = [
    '/api/telsus?page=1&pageSize=10',
    '/api/jaringan?page=1&pageSize=10',
    '/api/isr?page=1&pageSize=10',
    '/api/penomoran?page=1&pageSize=10',
    '/api/lko?page=1&pageSize=10',
    '/api/jasa?page=1&pageSize=10',
    '/api/sklo?page=1&pageSize=10'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`http://localhost:4000${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ ${endpoint} - Success (${data.data?.length || 0} records returned)`);
      } else {
        console.log(`✗ ${endpoint} - Error ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${endpoint} - Failed to connect: ${error.message}`);
    }
  }
  
  console.log('Test complete!');
}

// Run the test
testEndpoints();