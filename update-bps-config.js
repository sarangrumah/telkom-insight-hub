#!/usr/bin/env node

/**
 * Script to update BPS API configuration
 * Usage: node update-bps-config.js <api_key>
 */

import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const args = process.argv.slice(2);
const apiKey = args[0];

if (!apiKey) {
  console.log('Usage: node update-bps-config.js <bps_api_key>');
  console.log('Example: node update-bps-config.js abc123def456');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:M%40ryadi86!@localhost:5432/telkom_hub'
});

async function updateBPSConfig() {
  try {
    console.log('Updating BPS API configuration...');
    console.log('API Key provided:', apiKey ? '***HIDDEN***' : 'NOT PROVIDED');
    
    // Check if API key looks valid (alphanumeric, reasonable length)
    if (!/^[a-zA-Z0-9]{10,}$/.test(apiKey)) {
      console.error('❌ Invalid API key format. API key should be alphanumeric and at least 10 characters long.');
      process.exit(1);
    }
    
    // Update the BPS configuration
    const result = await pool.query(`
      UPDATE bps_config 
      SET api_key = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE config_name = 'default_bps_config'
      RETURNING id, config_name, api_key, is_active, updated_at
    `, [apiKey]);
    
    if (result.rowCount > 0) {
      console.log('✅ BPS configuration updated successfully!');
      console.log('Updated config:', {
        id: result.rows[0].id,
        configName: result.rows[0].config_name,
        isActive: result.rows[0].is_active,
        updatedAt: result.rows[0].updated_at
      });
      
      // Test the configuration
      console.log('\nTesting BPS API connection...');
      const testResult = await testBPSConnection(apiKey);
      if (testResult.success) {
        console.log('✅ BPS API connection test successful!');
      } else {
        console.log('⚠️  BPS API connection test failed:', testResult.message);
        console.log('This might be due to network issues or API downtime.');
      }
      
    } else {
      console.log('❌ No BPS configuration found to update.');
      console.log('Make sure the BPS schema has been created and the default configuration exists.');
    }
    
  } catch (error) {
    console.error('❌ Error updating BPS configuration:', error.message);
    if (error.code === '23505') {
      console.log('This might be a constraint violation. Check if the configuration already exists.');
    }
  } finally {
    await pool.end();
  }
}

async function testBPSConnection(apiKey) {
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

// Run the update
updateBPSConfig();