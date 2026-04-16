# JWT Token Expiration Fix

## Problem
The application was experiencing frequent "jwt expired" errors because the JWT access tokens were configured to expire after only 15 minutes (`ACCESS_EXPIRES_IN=15m`). This caused users to be frequently logged out and required constant re-authentication.

## Solution
Increased the JWT access token expiration time from 15 minutes to 1 hour to provide a better user experience while maintaining security.

## Changes Made

### 1. Environment Configuration (`.env`)
- **Before**: `ACCESS_EXPIRES_IN=15m`
- **After**: `ACCESS_EXPIRES_IN=1h`

### 2. Authentication Module (`server/auth.js`)
- Updated the default token expiration fallback from `'15m'` to `'1h'`
- Enhanced error logging in the authentication middleware to provide better debugging information for different JWT error types:
  - `TokenExpiredError`: Shows when the token expired
  - `JsonWebTokenError`: Indicates invalid token format
  - `NotBeforeError`: Shows when token is not active yet
- Added logging for token generation to track expiration times

### 3. Server Restart Scripts
- Created `restart-server.bat` for Windows users
- Created `restart-server.sh` for Linux/macOS users

## Security Considerations
- **Access Token**: 1 hour expiration provides a good balance between user experience and security
- **Refresh Token**: Still configured for 30 days, providing long-term session management
- **Automatic Refresh**: The refresh mechanism will automatically renew access tokens when needed
- **Session Management**: Sessions are properly tracked and can be revoked if needed

## How It Works
1. When a user logs in, they receive an access token valid for 1 hour
2. The refresh token (stored in httpOnly cookies) remains valid for 30 days
3. When the access token expires, the client can automatically refresh it using the refresh endpoint
4. Enhanced logging helps identify token expiration issues during development

## Restart Required
After making these changes, the server needs to be restarted for the new configuration to take effect:

**Windows:**
```cmd
restart-server.bat
```

**Linux/macOS:**
```bash
./restart-server.sh
```

## Testing
To verify the fix:
1. Restart the server
2. Log in to the application
3. Perform actions that require authentication
4. Verify that "jwt expired" errors no longer occur frequently
5. Check server logs for improved error messages if issues persist

## Monitoring
The enhanced logging will help identify:
- Token expiration patterns
- Authentication failures
- Token refresh activity
- Security issues with token validation