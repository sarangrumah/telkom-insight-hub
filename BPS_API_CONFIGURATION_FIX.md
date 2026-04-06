# BPS API Configuration Fix

## Problem
The BPS API is returning 403 errors (ERR_BAD_REQUEST) because the API key in the database is set to a placeholder value `'your_bps_api_key_here'` instead of a valid BPS API key.

## Root Cause
From the schema file `server/database/schema/bps_schema_fixed.sql`, line 344:
```sql
INSERT INTO bps_config (config_name, api_key, is_active) 
VALUES ('default_bps_config', 'your_bps_api_key_here', true)
```

The API key is a placeholder and not a valid BPS API key, causing authentication failures.

## Solution

### 1. Update BPS API Configuration
The BPS API key needs to be updated with a valid key from BPS (Badan Pusat Statistik).

### 2. Configuration Update Script
Create a script to update the BPS configuration with a valid API key:

```sql
-- Update BPS configuration with valid API key
UPDATE bps_config 
SET api_key = 'YOUR_VALID_BPS_API_KEY_HERE',
    updated_at = CURRENT_TIMESTAMP
WHERE config_name = 'default_bps_config';
```

### 3. Environment Variable Configuration
Alternatively, configure the API key through environment variables:

```bash
# Add to .env file
BPS_API_KEY=your_valid_bps_api_key_here
```

### 4. Application Configuration
Update the application to use environment variables for the API key:

```javascript
// In the application configuration
const BPS_API_KEY = process.env.BPS_API_KEY || 'your_bps_api_key_here';
```

## Steps to Fix

### Step 1: Obtain Valid BPS API Key
1. Register at [BPS Web API](https://webapi.bps.go.id/)
2. Request API key access
3. Verify email and activate account
4. Generate API key from dashboard

### Step 2: Update Database Configuration
```sql
-- Connect to database and run:
UPDATE bps_config 
SET api_key = 'ACTUAL_BPS_API_KEY',
    updated_at = CURRENT_TIMESTAMP
WHERE config_name = 'default_bps_config';
```

### Step 3: Restart Application
After updating the configuration, restart the application to pick up the changes.

### Step 4: Test Configuration
Use the test script to verify the BPS API is working:
```bash
node test-bps-api.js
```

## Verification

### Expected Results After Fix
- ✅ BPS API connection test should succeed
- ✅ Areas fetch should return valid data
- ✅ No more 403 errors
- ✅ Statistical data synchronization should work

### Test Commands
```bash
# Test BPS API connectivity
node test-bps-api.js

# Check BPS configuration
SELECT * FROM bps_config WHERE is_active = true;

# Test areas endpoint
curl -H "Authorization: Bearer <your_token>" http://localhost:4000/api/bps/areas
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Invalid or expired API key
   - Solution: Update with valid API key

2. **401 Unauthorized**: Authentication failed
   - Solution: Check API key format and permissions

3. **Rate Limiting**: Too many requests
   - Solution: Implement proper rate limiting (already configured)

4. **Network Issues**: Cannot reach BPS API
   - Solution: Check internet connection and firewall settings

### Debugging Steps
1. Check server logs for detailed error messages
2. Verify API key format (should be alphanumeric)
3. Test API key directly with BPS API endpoints
4. Check rate limit status in application logs

## Security Notes
- Never commit actual API keys to version control
- Use environment variables for sensitive configuration
- Rotate API keys regularly
- Monitor API usage and rate limits