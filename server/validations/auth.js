// =============================================================================
// Panel — Auth Input Validation (Zod)
// Pattern from: e-telekomunikasi/src/lib/validations/auth.ts
// =============================================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .email('Format email tidak valid')
    .max(255)
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password wajib diisi')
    .max(128),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255).trim(),
  email: z.string()
    .email('Format email tidak valid')
    .max(255)
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .max(128)
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka')
    .regex(/[^A-Za-z0-9]/, 'Harus mengandung karakter spesial'),
  companyName: z.string().min(1).max(255).optional(),
});

/**
 * Express middleware factory for Zod validation.
 * Validated data is available as `req.validatedBody`.
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
