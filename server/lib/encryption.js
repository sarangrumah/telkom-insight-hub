import crypto from 'node:crypto';

// =============================================================================
// Panel — AES-256-GCM Encryption for PII / sensitive fields (ISO 27001)
// ENCRYPTION_KEY must be set in env — validated by config/env.js in production.
// Ported from e-telekomunikasi-js (src/lib/encryption.ts).
// =============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be set in environment variables and be at least 32 characters.'
    );
  }
  return Buffer.from(key.slice(0, 32), 'utf-8');
}

export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData) {
  const key = getKey();
  const [ivHex, authTagHex, ciphertext] = String(encryptedData).split(':');
  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('Invalid encrypted data format.');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export function maskPii(value) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= 8) return '****' + s.slice(-4);
  return s.slice(0, 4) + '*'.repeat(s.length - 8) + s.slice(-4);
}
