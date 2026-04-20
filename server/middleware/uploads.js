import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// =============================================================================
// Panel — Secure Multer configuration factory
// Centralizes file-upload limits, MIME whitelist, and safe filename generation.
// =============================================================================

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const MIME_GROUPS = {
  pdf: ['application/pdf'],
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

function normalizeFilename(name) {
  return String(name || 'file').replace(/[^\w.\-]+/g, '_').slice(0, 180);
}

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn('Failed to ensure upload dir:', e?.message);
  }
}

/**
 * Build a multer middleware with explicit allowed MIME groups and size cap.
 * @param {object} opts
 * @param {string} opts.uploadDir       Absolute destination directory
 * @param {Array<'pdf'|'image'|'document'>} [opts.allow=['pdf']]
 * @param {number} [opts.maxSize]       Bytes (default 10MB)
 * @param {string[]} [opts.extraMimes]  Additional explicit MIMEs
 */
export function makeUpload({
  uploadDir,
  allow = ['pdf'],
  maxSize = DEFAULT_MAX_SIZE,
  extraMimes = [],
} = {}) {
  if (!uploadDir) throw new Error('uploadDir is required');
  ensureDir(uploadDir);

  const allowedMimes = new Set([
    ...allow.flatMap((group) => MIME_GROUPS[group] || []),
    ...extraMimes,
  ]);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const userId = req.user?.sub || 'anon';
      const timestamp = Date.now();
      const safe = normalizeFilename(file.originalname);
      cb(null, `${userId}-${timestamp}-${safe}`);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: maxSize,
      files: 20,
      fields: 100,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimes.has(file.mimetype)) {
        const err = new Error(`File type not allowed: ${file.mimetype}`);
        err.status = 400;
        return cb(err);
      }
      // Belt-and-suspenders: block double extensions / path traversal attempts
      const base = path.basename(file.originalname || '');
      if (base.includes('..') || base.includes('/') || base.includes('\\')) {
        const err = new Error('Invalid file name');
        err.status = 400;
        return cb(err);
      }
      cb(null, true);
    },
  });
}

/** Express error handler for multer errors — returns JSON instead of HTML. */
export function multerErrorHandler(err, _req, res, next) {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File terlalu besar'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
        ? 'Field file tidak dikenali'
        : 'Gagal mengunggah file';
    return res.status(400).json({ error: msg });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  return next(err);
}
