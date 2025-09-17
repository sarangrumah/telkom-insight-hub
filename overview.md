# Application Overview

## Frameworks & Libraries

- **Frontend:** React 18.3.1, Vite 5.4.19, Tailwind CSS 3.4.17, TypeScript 5.8.3, Radix UI, React Query, ESLint, Helmet, etc.
- **Backend/API:** Supabase (PostgreSQL, serverless functions), Supabase JS SDK 2.53.0
- **Testing:** Vitest, Testing Library
- **Other:** Mapbox, XLSX, Zod, class-variance-authority, etc.

## Database

- **Type:** PostgreSQL (managed by Supabase)
- **Schema:** Includes user profiles, roles, permissions, FAQ, ticketing, telecommunication data, region hierarchy, audit logs, API integration logs, document management, and more.
- **Migrations:** Managed via Supabase migration files.

## Operating System

- **Development/Deployment:** Windows 11 (dev), cross-platform compatible (Node.js, Vite, Supabase)

## JavaScript/TypeScript Version

- **TypeScript:** 5.8.3
- **React:** 18.3.1
- **ES Version:** ES2022+ (via Vite/Babel)

## Security Features

- **HTTP Security Headers:**  
  - Content Security Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer Policy: strict-origin-when-cross-origin
  - Permissions Policy: disables geolocation, camera, microphone, payment
- **Role-Based Access Control:**  
  - Fine-grained module and field-level permissions via PermissionGuard and ConditionalField components.
- **Audit Logging:**  
  - All critical actions and API integrations are logged in dedicated tables.
- **Environment Variables:**  
  - Supabase credentials and sensitive config are managed via `.env` (never hardcoded).
- **Linting & Best Practices:**  
  - Uses eslint-plugin-security, Helmet, and Prettier for code quality and security.
- **Other:**  
  - Secure API integration, validation with Zod, and secure file upload handling.

## Architecture Summary

- **Frontend:** SPA built with React, Vite, and Tailwind CSS.
- **Backend/API:** Serverless functions (Supabase Edge Functions) for business logic and integrations.
- **Database:** PostgreSQL with normalized schema and migrations.
- **Integrations:** Mapbox for geospatial data, XLSX for Excel import/export, third-party APIs via serverless functions.
- **DevSecOps:** Linting, Prettier, Husky, and security monitoring components.
