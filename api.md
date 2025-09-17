# API Documentation

This document describes the main API endpoints and integration points for the application.

## Supabase Edge Functions (API Endpoints)

### 1. `/api-integration-example`
- **File:** `supabase/functions/api-integration-example/index.ts`
- **Purpose:** Example of integrating with a third-party API or service.
- **Request:** Typically POST/GET with JSON body, depending on implementation.
- **Response:** JSON object with integration result or error.
- **Security:** Authenticated via Supabase JWT; input validation recommended.

### 2. `/complete-registration`
- **File:** `supabase/functions/complete-registration/index.ts`
- **Purpose:** Completes user registration, processes additional data, or triggers onboarding logic.
- **Request:** POST with registration data (JSON).
- **Response:** JSON object with registration status or error.
- **Security:** Authenticated; input validation and audit logging.

### 3. `/get-mapbox-token`
- **File:** `supabase/functions/get-mapbox-token/index.ts`
- **Purpose:** Provides a Mapbox API token for frontend geospatial features.
- **Request:** GET (may require authentication).
- **Response:** JSON object with token.
- **Security:** May restrict to authenticated users.

### 4. `/validate-registration-data`
- **File:** `supabase/functions/validate-registration-data/index.ts`
- **Purpose:** Validates user registration data before submission.
- **Request:** POST with registration data (JSON).
- **Response:** JSON object with validation result.
- **Security:** Input validation, rate limiting recommended.

## Frontend API Integrations

- **Supabase Client:**  
  - File: `src/integrations/supabase/client.ts`
  - Used for authentication, database queries, and real-time features.

- **Custom Hooks:**  
  - `useAuth.tsx`: Handles authentication and user session.
  - `useThirdPartyAPI.ts`: Integrates with external APIs.
  - `useAPIMonitoring.ts`, `useMonitoring.tsx`: API health and monitoring.
  - `usePermissions.ts`: Permission checks for UI and API calls.

## Example API Request

```http
POST /complete-registration
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "email": "user@example.com",
  "profile": { ... }
}
```

## Security Considerations

- All endpoints should validate input and authenticate requests.
- Sensitive operations are logged (see audit_logs, api_integration_logs).
- Use HTTPS for all API calls.
- Environment variables are used for credentials and tokens.

> For detailed request/response schemas, see the TypeScript types in `src/integrations/supabase/types.ts` and the implementation in each function's `index.ts`.
