import BPSDataService from './server/services/bpsDataService.js';

async function testBPSServiceLoading() {
  try {
    console.log('Testing BPSDataService loading...');
    
    const bpsService = new BPSDataService();
    
    console.log('BPSDataService created successfully');
    console.log('Table names:', bpsService.tableNames);
    
    // Test the getMonitoredAreas method
    console.log('Testing getMonitoredAreas method...');
    const result = await bpsService.getMonitoredAreas();
    
    console.log('✅ getMonitoredAreas method successful');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error testing BPSDataService:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testBPSServiceLoading();