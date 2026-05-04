// =============================================================================
// Panel ↔ e-Telekomunikasi registration proxy
//
// Flow (dual-source; neither system is sole source of truth):
//   1. Browser fetches captcha/wilayah through Panel → forwarded to e-telekom.
//   2. Browser uploads each required document through Panel → Panel forwards
//      to e-telekom /api/upload and hands the returned filePath back.
//   3. Browser submits final registration → Panel forwards to e-telekom
//      /api/auth/register. On success Panel also inserts a linked row in
//      auth.users (external_source='etelekomunikasi', external_id=eUserId)
//      so the user can log in locally without another round-trip.
//
// Login is handled by loginViaEtelekomunikasi() in auth.js — this route only
// owns the registration half.
// =============================================================================

import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import {
  getCaptcha,
  verifyCaptcha,
  getWilayah,
  uploadFile,
  registerAccount,
} from '../services/external/etelekom-client.js';

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(application\/pdf|image\/(jpeg|jpg|png|webp))$/;
    if (!allowed.test(file.mimetype)) {
      const err = new Error('Only PDF or image files are allowed');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

function relayResult(res, result) {
  return res.status(result.status || 500).json(result.data ?? {});
}

// ── CAPTCHA ────────────────────────────────────────────────────────────────
router.get('/captcha', async (_req, res) => {
  const result = await getCaptcha();
  return relayResult(res, result);
});

router.post('/captcha', async (req, res) => {
  const { token, answer } = req.body || {};
  if (!token || !answer) {
    return res.status(400).json({ success: false, message: 'token dan answer wajib diisi.' });
  }
  const result = await verifyCaptcha(token, answer);
  return relayResult(res, result);
});

// ── WILAYAH (cascading geographic data) ────────────────────────────────────
router.get('/wilayah', async (req, res) => {
  const { level, provinsiId, kabupatenKotaId, kecamatanId } = req.query;
  if (!level) {
    return res.status(400).json({ success: false, message: 'Parameter level wajib diisi.' });
  }
  const result = await getWilayah({ level, provinsiId, kabupatenKotaId, kecamatanId });
  return relayResult(res, result);
});

// ── FILE UPLOAD (proxied) ──────────────────────────────────────────────────
router.post('/upload', (req, res) => {
  memoryUpload.single('file')(req, res, async (err) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Upload gagal';
      return res.status(err.status || 400).json({ success: false, message: msg });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan.' });
    }

    const docType = typeof req.body?.docType === 'string' ? req.body.docType.slice(0, 30) : undefined;

    const result = await uploadFile({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      docType,
    });

    return relayResult(res, result);
  });
});

// ── REGISTER ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const payload = req.body ?? {};
  if (!payload.email || !payload.password) {
    return res.status(400).json({ success: false, message: 'email dan password wajib diisi.' });
  }

  const forwarded = await registerAccount(payload);
  if (!forwarded.ok) {
    return relayResult(res, forwarded);
  }

  const eUserId = forwarded.data?.data?.userId;
  if (!eUserId) {
    return res.status(200).json(forwarded.data);
  }

  // Mirror into Panel's auth.users so local login works immediately.
  // Password is stored hashed on Panel too (user can still log in via either
  // Panel-local credentials or the cross-login /login-etelekomunikasi path).
  try {
    const emailLower = String(payload.email).toLowerCase().trim();

    const { rowCount } = await query(
      'SELECT 1 FROM auth.users WHERE email = $1 LIMIT 1',
      [emailLower]
    );

    if (rowCount === 0) {
      const panelUserId = uuidv4();
      const hash = await bcrypt.hash(payload.password, BCRYPT_ROUNDS);

      await query('BEGIN');
      try {
        await query(
          `INSERT INTO auth.users
             (id, email, encrypted_password, created_at, updated_at,
              raw_user_meta_data, external_id, external_source)
           VALUES ($1, $2, $3, now(), now(), $4::jsonb, $5, $6)`,
          [
            panelUserId,
            emailLower,
            hash,
            JSON.stringify({
              nama_pelaku_usaha: payload.namaPelakuUsaha,
              pj_nama: payload.pjNama,
              source: 'panel_register',
            }),
            eUserId,
            'etelekomunikasi',
          ]
        );

        await query(
          `INSERT INTO public.profiles
             (id, user_id, full_name, company_name, phone, created_at, updated_at)
           VALUES ($1, $1, $2, $3, $4, now(), now())
           ON CONFLICT (user_id) DO NOTHING`,
          [
            panelUserId,
            payload.pjNama || emailLower,
            payload.namaPelakuUsaha || null,
            payload.pjNoTelepon || null,
          ]
        );

        await query(
          `INSERT INTO public.user_roles (id, user_id, role, created_at)
           VALUES ($1, $2, 'pelaku_usaha', now())
           ON CONFLICT DO NOTHING`,
          [uuidv4(), panelUserId]
        );

        await query('COMMIT');
      } catch (txErr) {
        await query('ROLLBACK');
        // Don't fail the whole request — e-telekom record was created; panel
        // link can be retried on first login via loginViaEtelekomunikasi.
        console.error('[auth-etelekom] local mirror failed:', txErr.message);
      }
    }
  } catch (mirrorErr) {
    console.error('[auth-etelekom] mirror error:', mirrorErr.message);
  }

  return res.status(forwarded.status).json(forwarded.data);
});

export default router;
