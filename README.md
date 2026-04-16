# Project Overview & Server / Database Migration Guide

## 1. Ringkasan Arsitektur

- Frontend: React + TypeScript (Vite) ([package.json](package.json), [vite.config.ts](vite.config.ts), [tsconfig.json](tsconfig.json))
- Styling: TailwindCSS ([tailwind.config.ts](tailwind.config.ts)), utility classes di komponen & halaman (misal [src/pages/DataManagement.tsx](src/pages/DataManagement.tsx))
- UI Kit: shadcn/ui (komponen lokal di `src/components/ui/*`)
- State/Logic: React hooks kustom (misal izin: [src/hooks/usePermissions.ts](src/hooks/usePermissions.ts))
- Backend-as-a-Service: Supabase (Auth, Postgres, Storage, Realtime, RLS, Functions)
- Realtime: Channel subscription telekom_data (lihat [`DataManagement`](src/pages/DataManagement.tsx))
- Auth: Supabase email/password (public register: [`PublicRegister`](src/pages/PublicRegister.tsx))
- RBAC + Fine-Grained Permission: gabungan enum role + tabel izin + fungsi SQL (lihat migrations)
- Deployment (indikatif): CI/CD via GitHub Actions ([.github/workflows](.github/workflows))

## 2. Teknologi Utama

| Layer       | Teknologi                         | Catatan                                                                      |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------- |
| UI          | React, TypeScript                 | SPA dengan routing (lihat [src/App.tsx](src/App.tsx))                        |
| Styling     | TailwindCSS                       | Konfigurasi: [tailwind.config.ts](tailwind.config.ts)                        |
| Build       | Vite                              | Dev server + bundling                                                        |
| Testing     | Vitest                            | Konfigurasi: [vitest.config.ts](vitest.config.ts)                            |
| Auth & DB   | Supabase Postgres                 | RLS + policies                                                               |
| Realtime    | Supabase Realtime                 | Subskripsi perubahan tabel                                                   |
| Security    | RLS, Policies, CSP, Audit Logging | Dirinci di [DEVSECOPS.md](DEVSECOPS.md)                                      |
| Permissions | SQL functions + hook              | Lihat docs: [docs/role-flows-and-testing.md](docs/role-flows-and-testing.md) |

## 3. Role & Izin

Enum role didefinisikan di migration: [`app_role`](supabase/migrations/20250804171437_4c78f08c-a817-43ac-adb3-4a00aa86e8aa.sql).  
Alur per role & skenario uji: [docs/role-flows-and-testing.md](docs/role-flows-and-testing.md).  
Hook izin: [`usePermissions`](src/hooks/usePermissions.ts).  
Guard komponen: [`PermissionGuard`](src/components/PermissionGuard.tsx).  
Halaman sensitif: [`PermissionManagement`](src/pages/PermissionManagement.tsx), [`UserManagement`](src/pages/UserManagement.tsx), [`DataManagement`](src/pages/DataManagement.tsx).

Fungsi SQL (lihat migrations terkait):

- `check_user_permission()` ([supabase/migrations/20250817052145_78b76b12-0c57-4399-84ec-955f2c6f4cac.sql](supabase/migrations/20250817052145_78b76b12-0c57-4399-84ec-955f2c6f4cac.sql))
- `get_user_permissions()` (file sama)
- Seeder default izin: [supabase/migrations/20250817052312_98f9fdb8-71b5-4f3f-ba47-f0d485665d15.sql](supabase/migrations/20250817052312_98f9fdb8-71b5-4f3f-ba47-f0d485665d15.sql)

## 4. Skema Database (inti)

Dari migration dasar: [supabase/migrations/20250804171437_4c78f08c-a817-43ac-adb3-4a00aa86e8aa.sql](supabase/migrations/20250804171437_4c78f08c-a817-43ac-adb3-4a00aa86e8aa.sql)

- Enum: `app_role`, `service_type`
- Tabel: `profiles`, `user_roles`, `telekom_data`, (tabel tambahan izin & modul—lihat seed/izin)
- Policies contoh:
  - RLS telekom_data (select hanya user tervalidasi; insert dibatasi pelaku_usaha ke data sendiri; admin penuh)
- Trigger: `handle_new_user()` buat profile otomatis saat signup

## 5. Fitur Keamanan

Dirinci di [DEVSECOPS.md](DEVSECOPS.md):

- RLS & granular policies
- Fungsi permission hardened (search_path diset)
- Audit logging (lihat catatan status)
- CSP & security headers (komponen: [src/components/SecurityHeaders.tsx](src/components/SecurityHeaders.tsx) jika ada)
- Linting security rules (ESLint config: [eslint.config.js](eslint.config.js))
- Pre-commit checks: [.husky/pre-commit](.husky/pre-commit), [.lintstagedrc.json](.lintstagedrc.json)
- Password leak & MFA: masih manual (lihat bagian “Remaining Security Tasks” di DEVSECOPS)

## 6. Alur Fungsional Utama

1. Registrasi publik: [`PublicRegister`](src/pages/PublicRegister.tsx) -> create auth user -> insert role di `user_roles`
2. Login -> sidebar dinamis (lihat [`AppLayout`](src/components/AppLayout.tsx))
3. Manajemen Data: CRUD + realtime refresh [`DataManagement`](src/pages/DataManagement.tsx)
4. Detail data publik: [`TelekomDataDetail`](src/pages/TelekomDataDetail.tsx)
5. Migrasi lokasi (one-off ops tool): [`LocationMigration`](src/components/LocationMigration.tsx)
6. Admin:
   - User & Role: [`UserManagement`](src/pages/UserManagement.tsx)
   - Permission Matrix: [`PermissionManagement`](src/pages/PermissionManagement.tsx)

## 7. Realtime

Subscription contoh: channel `telekom_data_changes` pada [`DataManagement`](src/pages/DataManagement.tsx).

## 8. API / Data Access Pattern

Semua akses via Supabase JS client: [src/integrations/supabase/client] (file init).  
Pola umum:

````ts
supabase.from('telekom_data').select(...).eq(...);
supabase.auth.signUp / signIn / getSession;
supabase.channel(...).on('postgres_changes', {...}).subscribe();

## Backend API

### Authentication
- `POST /api/auth/register` — Register user (returns token + user)
- `POST /api/auth/login` — Login (returns token + user)

### User & Profile
- `GET /api/user/profile` — Current authenticated user profile & roles
- `GET /api/roles` — Roles for current user

### Admin: Users
Requires role `super_admin` or `internal_admin`.

- `GET /api/admin/users` — List users with profile & roles
- `POST /api/admin/users/:userId/roles` — Assign role `{ role }`
- `DELETE /api/admin/users/:userId/roles/:role` — Remove role
- `PATCH /api/admin/users/:userId/profile` — Update profile fields `{ full_name, company_name, phone }`
- `PATCH /api/admin/users/:userId/validation` — Toggle validation `{ is_validated }`
- `DELETE /api/admin/users/:userId` — Hard delete user (auth.users, profiles, user_roles)

### Permissions
Admin endpoints:
- `GET /api/admin/permissions?role=ROLE` — List permissions (module & field rows)
- `POST /api/admin/permissions/bulk` — Bulk upsert
  Payload example:
  ```json
  {
    "modulePermissions": [
      { "role": "pengolah_data", "module_id": "uuid", "can_create": true, "can_read": true, "can_update": false, "can_delete": false }
    ],
    "fieldPermissions": [
      { "role": "pengolah_data", "module_id": "uuid", "field_id": "uuid", "field_access": "editable", "can_create": false, "can_read": true, "can_update": true, "can_delete": false }
    ]
  }
````

User-facing effective permissions:

- `GET /api/permissions/effective` — Returns rows with module_code, field_code, and action flags.

### Metadata

- `GET /api/admin/metadata/modules` — List active modules
- `GET /api/admin/metadata/fields` — List active fields

### Tickets

- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/:id`

### Telekom Data

- `GET /api/telekom-data` — Simplified list for dashboard

### Notes

- All protected routes use `Authorization: Bearer <token>`
- Roles checked server-side for admin endpoints
- Recommended: rotate `JWT_SECRET` in production & add refresh token mechanism.
