#!/usr/bin/env node

/**
 * Detailed BPS API debugging script
 * Tests the exact API call that's failing
 */

import axios from 'axios';

async function debugBPSAPI() {
  console.log('=== BPS API Debug Analysis ===\n');
  
  // Test the exact API call that's failing
  const apiKey = '4f25b3b3bb4eee15614e93834eb58cd7';
  const testUrl = `https://webapi.bps.go.id/v1/api/view/domain/type/all/key/${apiKey}`;
  
  console.log('Testing exact failing URL:', testUrl.replace(apiKey, '***API_KEY***'));
  console.log('API Key length:', apiKey.length);
  console.log('API Key format:', /^[a-zA-Z0-9]+$/.test(apiKey) ? 'Valid alphanumeric' : 'Invalid format');
  
  try {
    console.log('\n1. Testing direct API call...');
    
    const response = await axios.get(testUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'TelkomInsightHub/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
      }
    });
    
    console.log('✅ Direct API call successful!');
    console.log('Status:', response.status);
    console.log('Response type:', typeof response.data);
    console.log('Response keys:', Object.keys(response.data || {}));
    
    if (response.data && response.data.error) {
      console.log('Error in response:', response.data.error);
    }
    
  } catch (error) {
    console.log('❌ Direct API call failed');
    console.log('Error type:', error.constructor.name);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
      console.log('Response data:', error.response.data);
      
      // Check for specific BPS error codes
      if (error.response.data) {
        const errorData = typeof error.response.data === 'string' ? 
          error.response.data : 
          JSON.stringify(error.response.data);
          
        console.log('Raw response:', errorData);
        
        if (errorData.includes('invalid') || errorData.includes('Invalid')) {
          console.log('⚠️  API key appears to be invalid or expired');
        }
        if (errorData.includes('limit') || errorData.includes('Limit')) {
          console.log('⚠️  Rate limit exceeded');
        }
        if (errorData.includes('forbidden') || errorData.includes('Forbidden')) {
          console.log('⚠️  Forbidden access - possible IP blocking or key restrictions');
        }
      }
    } else if (error.request) {
      console.log('No response received - network issue');
      console.log('Request details:', error.request);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
  
  console.log('\n2. Testing alternative BPS API endpoints...');
  
  // Test with different endpoints to isolate the issue
  const testEndpoints = [
    `https://webapi.bps.go.id/v1/api/view/domain/0/model/dynamictable/lang/ind/key/${apiKey}`,
    `https://webapi.bps.go.id/v1/api/view/domain/0/model/variable/lang/ind/key/${apiKey}`,
    `https://webapi.bps.go.id/v1/api/view/domain/0/model/subject/lang/ind/key/${apiKey}`
  ];
  
  for (const [index, endpoint] of testEndpoints.entries()) {
    try {
      console.log(`\nTesting endpoint ${index + 1}: ${endpoint.replace(apiKey, '***API_KEY***')}`);
      
      const response = await axios.get(endpoint, {
        timeout: 10000,
        headers: { 'User-Agent': 'TelkomInsightHub/1.0' }
      });
      
      console.log(`✅ Endpoint ${index + 1} successful - Status: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ Endpoint ${index + 1} failed - Status: ${error.response?.status || 'No response'}`);
      if (error.response?.status === 403) {
        console.log('   → 403 Forbidden - API key issue confirmed');
      }
    }
  }
  
  console.log('\n3. Testing API key format requirements...');
  
  // BPS API key validation
  const keyPattern = /^[a-f0-9]{32}$/; // MD5 hash format
  if (keyPattern.test(apiKey)) {
    console.log('✅ API key matches expected MD5 format (32 hex characters)');
  } else {
    console.log('⚠️  API key format may be incorrect');
    console.log('Expected: 32 hexadecimal characters (MD5 hash)');
    console.log('Actual length:', apiKey.length);
    console.log('Contains only hex:', /^[a-f0-9]+$/.test(apiKey) ? 'Yes' : 'No');
  }
  
  console.log('\n=== Debug Complete ===');
  console.log('\nRecommendations:');
  console.log('1. Verify the API key is active and not expired');
  console.log('2. Check if the API key has the correct permissions for /domain/type/all endpoint');
  console.log('3. Contact BPS support if the key appears valid but still returns 403');
  console.log('4. Try regenerating the API key from BPS dashboard');
}

debugBPSAPI().catch(console.error);