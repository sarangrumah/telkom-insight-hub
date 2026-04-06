#!/usr/bin/env node

/**
 * Test script for BPS Area Synchronization
 * This script tests the area fetching and synchronization functionality
 */

import { BPSAPIFetcherService } from './server/services/bpsAPIFetcherService.js';
import { BPSDataService } from './server/services/bpsDataService.js';

async function testAreaSync() {
  console.log('🧪 Testing BPS Area Synchronization...\n');
  
  try {
    // Initialize services
    const apiFetcher = new BPSAPIFetcherService();
    const dataService = new BPSDataService();
    
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const dbTest = await dataService.testDatabaseConnection();
    if (dbTest.success) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed:', dbTest.error);
      return;
    }
    
    // Test 2: Get current configuration
    console.log('\n2. Getting BPS configuration...');
    const config = await dataService.getConfig();
    if (!config.success || !config.data?.api_key) {
      console.log('❌ BPS API key not configured');
      console.log('   Please configure the API key in the BPS configuration first');
      return;
    }
    console.log('✅ BPS configuration found');
    
    // Test 3: Test area fetching from API
    console.log('\n3. Testing area fetch from BPS API...');
    const fetchResult = await apiFetcher.fetchAreas(config.data.api_key);
    
    if (fetchResult.success) {
      console.log('✅ BPS API area fetch successful');
      console.log(`   Response status: ${fetchResult.meta.status}`);
      console.log(`   Response time: ${fetchResult.meta.responseTime}ms`);
      
      // Process the area data
      const areas = apiFetcher.processAreaData(fetchResult.data);
      console.log(`   Processed ${areas.length} areas from API response`);
      
      if (areas.length > 0) {
        console.log('\n   Sample areas:');
        areas.slice(0, 3).forEach((area, index) => {
          console.log(`     ${index + 1}. ${area.area_name} (${area.area_code}) - ${area.area_type}`);
        });
      }
      
      // Test 4: Test area synchronization
      console.log('\n4. Testing area synchronization to database...');
      const syncResult = await apiFetcher.fetchAndSyncAreas(config.data.api_key);
      
      if (syncResult.success) {
        console.log('✅ Area synchronization successful');
        console.log(`   Total fetched: ${syncResult.data.totalFetched}`);
        console.log(`   Synced to database: ${syncResult.data.syncedCount}`);
        console.log(`   Errors: ${syncResult.data.errorCount}`);
        
        if (syncResult.data.errors) {
          console.log('\n   Errors encountered:');
          syncResult.data.errors.forEach((error, index) => {
            console.log(`     ${index + 1}. ${error.area.area_name}: ${error.error}`);
          });
        }
      } else {
        console.log('❌ Area synchronization failed:', syncResult.error);
      }
      
    } else {
      console.log('❌ BPS API area fetch failed:', fetchResult.error);
      console.log('   This might be due to API access restrictions');
    }
    
    // Test 5: Get current monitored areas
    console.log('\n5. Getting current monitored areas...');
    const areasResult = await dataService.getMonitoredAreas();
    if (areasResult.success) {
      console.log(`✅ Found ${areasResult.data.length} monitored areas in database`);
      
      const provinces = areasResult.data.filter(a => a.area_type === 'province');
      const districts = areasResult.data.filter(a => a.area_type === 'district');
      
      console.log(`   Provinces: ${provinces.length}`);
      console.log(`   Districts: ${districts.length}`);
    } else {
      console.log('❌ Failed to get monitored areas:', areasResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n🏁 Area synchronization test completed');
}

// Run the test
testAreaSync().catch(console.error);