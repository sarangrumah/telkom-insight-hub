#!/usr/bin/env node

/**
 * Test script for BPS API connectivity and configuration
 */

import BPSAPIFetcherService from './server/services/bpsAPIFetcherService.js';
import BPSDataService from './server/services/bpsDataService.js';

async function testBPSAPI() {
  console.log('=== BPS API Diagnostic Test ===\n');
  
  const fetcherService = new BPSAPIFetcherService();
  const dataService = new BPSDataService();
  
  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const dbTest = await dataService.testDatabaseConnection();
    console.log('Database test result:', dbTest);
    
    if (!dbTest.success) {
      console.error('❌ Database connection failed - cannot proceed');
      return;
    }
    
    // 2. Get BPS configuration
    console.log('\n2. Getting BPS configuration...');
    const configResult = await dataService.getConfig();
    console.log('BPS config result:', configResult);
    
    if (!configResult.success || !configResult.data) {
      console.error('❌ No BPS configuration found');
      console.log('Please configure BPS API settings first');
      return;
    }
    
    const config = configResult.data;
    console.log('BPS Configuration:', {
      configName: config.config_name,
      hasApiKey: !!config.api_key,
      baseUrl: config.base_url,
      rateLimit: config.rate_limit_per_hour
    });
    
    // 3. Test BPS API connection
    console.log('\n3. Testing BPS API connection...');
    const connectionTest = await fetcherService.testConnection();
    console.log('BPS API connection test:', connectionTest);
    
    if (!connectionTest.success) {
      console.error('❌ BPS API connection failed');
      console.log('This could indicate network issues or API downtime');
    }
    
    // 4. Test areas fetch with the configured API key
    console.log('\n4. Testing areas fetch with configured API key...');
    if (config.api_key) {
      const areasResult = await fetcherService.fetchAreas(config.api_key);
      console.log('Areas fetch result:', areasResult);
      
      if (!areasResult.success) {
        console.error('❌ Areas fetch failed');
        console.log('Error details:', areasResult.details);
        
        // Check for common issues
        if (areasResult.details?.status === 403) {
          console.log('\n⚠️  403 Forbidden - Possible issues:');
          console.log('  - Invalid API key');
          console.log('  - API key not activated');
          console.log('  - Rate limiting exceeded');
          console.log('  - IP address not whitelisted');
        } else if (areasResult.details?.status === 401) {
          console.log('\n⚠️  401 Unauthorized - API key authentication failed');
        }
      } else {
        console.log('✅ Areas fetch successful');
        console.log('Response time:', areasResult.meta?.responseTime, 'ms');
      }
    } else {
      console.log('❌ No API key configured');
    }
    
    // 5. Check rate limit status
    console.log('\n5. Checking rate limit status...');
    const rateLimitStatus = fetcherService.getRateLimitStatus();
    console.log('Rate limit status:', rateLimitStatus);
    
    // 6. Test monitored areas
    console.log('\n6. Testing monitored areas...');
    const areasResult = await dataService.getMonitoredAreas();
    console.log('Monitored areas result:', areasResult);
    
    if (areasResult.success) {
      console.log(`Found ${areasResult.count} monitored areas`);
      if (areasResult.count > 0) {
        console.log('Sample areas:', areasResult.data.slice(0, 3));
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testBPSAPI().catch(console.error);