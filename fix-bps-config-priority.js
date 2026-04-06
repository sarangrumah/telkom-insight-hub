#!/usr/bin/env node

/**
 * Script to fix BPS configuration priority
 * Ensures the correct configuration is used by the application
 */

import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:M%40ryadi86!@localhost:5432/telkom_hub'
});

async function fixBPSConfigPriority() {
  try {
    console.log('=== Fixing BPS Configuration Priority ===\n');
    
    // Get all active configurations
    const configsResult = await pool.query(`
      SELECT * FROM bps_config 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    
    console.log('Current active configurations:');
    configsResult.rows.forEach((config, index) => {
      console.log(`${index + 1}. ${config.config_name}`);
      console.log(`   Created: ${config.created_at}`);
      console.log(`   API Key: ${config.api_key === '***CONFIGURED***' ? 'INVALID (placeholder)' : 'VALID'}`);
      console.log(`   Base URL: ${config.base_url}`);
      console.log('');
    });
    
    // Find the configuration with the valid API key
    const validConfig = configsResult.rows.find(config => 
      config.api_key !== '***CONFIGURED***' && 
      config.api_key !== 'your_bps_api_key_here'
    );
    
    if (!validConfig) {
      console.log('❌ No configuration with valid API key found');
      console.log('Please update one of the configurations with a valid BPS API key');
      return;
    }
    
    console.log(`✅ Found valid configuration: ${validConfig.config_name}`);
    
    // Option 1: Deactivate the invalid configuration
    console.log('\nOption 1: Deactivating invalid configurations...');
    const invalidConfigs = configsResult.rows.filter(config => 
      config.config_name !== validConfig.config_name
    );
    
    if (invalidConfigs.length > 0) {
      for (const invalidConfig of invalidConfigs) {
        await pool.query(`
          UPDATE bps_config 
          SET is_active = false, updated_at = CURRENT_TIMESTAMP
          WHERE config_name = $1
        `, [invalidConfig.config_name]);
        console.log(`   Deactivated: ${invalidConfig.config_name}`);
      }
    }
    
    // Option 2: Update the created_at timestamp to make valid config most recent
    console.log('\nOption 2: Updating timestamps to prioritize valid configuration...');
    await pool.query(`
      UPDATE bps_config 
      SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE config_name = $1
    `, [validConfig.config_name]);
    
    console.log(`   Updated timestamp for: ${validConfig.config_name}`);
    
    // Verify the fix
    console.log('\nVerifying fix...');
    const fixedConfigsResult = await pool.query(`
      SELECT * FROM bps_config 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `);
    
    console.log('Fixed active configurations:');
    fixedConfigsResult.rows.forEach((config, index) => {
      console.log(`${index + 1}. ${config.config_name} (MOST RECENT)`);
      console.log(`   Created: ${config.created_at}`);
      console.log(`   API Key: ${config.api_key === '***CONFIGURED***' ? 'INVALID' : 'VALID'}`);
      console.log('');
    });
    
    // Test the configuration that will be selected
    const selectedConfig = fixedConfigsResult.rows[0];
    console.log(`✅ Application will now use: ${selectedConfig.config_name}`);
    
    if (selectedConfig.api_key !== '***CONFIGURED***' && selectedConfig.api_key !== 'your_bps_api_key_here') {
      console.log('✅ Selected configuration has valid API key');
      
      // Test the API key
      console.log('\nTesting selected API key...');
      const testResult = await testBPSAPIKey(selectedConfig.api_key);
      if (testResult.success) {
        console.log('✅ BPS API test successful!');
      } else {
        console.log('⚠️  BPS API test failed:', testResult.message);
        console.log('The API key may be invalid or expired');
      }
    } else {
      console.log('❌ Selected configuration still has invalid API key');
    }
    
  } catch (error) {
    console.error('❌ Error fixing BPS configuration:', error.message);
  } finally {
    await pool.end();
  }
}

async function testBPSAPIKey(apiKey) {
  try {
    const axios = await import('axios');
    
    const response = await axios.default.get(
      `https://webapi.bps.go.id/v1/api/view/domain/0/model/dynamictable/lang/ind/key/${apiKey}`,
      { timeout: 10000 }
    );
    
    return {
      success: true,
      message: 'BPS API connection successful',
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      message: `BPS API connection failed: ${error.message}`,
      status: error.response?.status
    };
  }
}

// Run the fix
fixBPSConfigPriority();