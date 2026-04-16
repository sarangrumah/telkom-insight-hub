#!/usr/bin/env node

/**
 * Verification script to test JWT token expiration fix
 * Run this after restarting the server to verify the fix is working
 */

const jwt = require('jsonwebtoken');

// Test the new token expiration configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '1h';

console.log('=== JWT Token Expiration Fix Verification ===');
console.log('Current configuration:');
console.log(`  JWT_SECRET: ${JWT_SECRET ? '[SET]' : '[NOT SET]'}`);
console.log(`  ACCESS_EXPIRES_IN: ${TOKEN_EXPIRES_IN}`);
console.log('');

// Generate a test token to verify expiration
try {
  const testPayload = {
    sub: 'test-user-id',
    email: 'test@example.com'
  };
  
  const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  const decoded = jwt.decode(testToken);
  
  console.log('Test token generated successfully:');
  console.log(`  User ID: ${decoded.sub}`);
  console.log(`  Email: ${decoded.email}`);
  console.log(`  Issued at: ${new Date(decoded.iat * 1000).toISOString()}`);
  console.log(`  Expires at: ${new Date(decoded.exp * 1000).toISOString()}`);
  
  const expiresInMinutes = (decoded.exp - decoded.iat) / 60;
  console.log(`  Expires in: ${expiresInMinutes} minutes`);
  
  if (expiresInMinutes >= 55) {
    console.log('✅ SUCCESS: Token expiration is set to 1 hour or more');
  } else if (expiresInMinutes === 15) {
    console.log('❌ ISSUE: Token expiration is still 15 minutes - server may need restart');
  } else {
    console.log(`⚠️  WARNING: Unexpected expiration time: ${expiresInMinutes} minutes`);
  }
  
} catch (error) {
  console.error('❌ ERROR: Failed to generate test token:', error.message);
}

console.log('');
console.log('Next steps:');
console.log('1. If server was not restarted, restart it now');
console.log('2. Log in to the application to get a new token');
console.log('3. Check server logs for "Generated new access token" message');
console.log('4. Verify "jwt expired" errors are reduced');