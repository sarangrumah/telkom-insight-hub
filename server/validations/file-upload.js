// =============================================================================
// Panel — File Upload Validation (Magic Bytes)
// Pattern from: e-telekomunikasi/src/lib/validations/permohonan.ts lines 82-135
// =============================================================================

const MAGIC_SIGNATURES = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46, 0x2d],                         // %PDF-
  'image/jpeg':      [0xff, 0xd8, 0xff],
  'image/png':       [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/webp':      [0x52, 0x49, 0x46, 0x46],                               // RIFF
  'image/gif':       [0x47, 0x49, 0x46],                                      // GIF
};

// Always reject executables regardless of declared MIME or extension
const EXECUTABLE_SIGNATURES = [
  [0x4d, 0x5a],                       // Windows EXE/DLL (MZ)
  [0x7f, 0x45, 0x4c, 0x46],         // Linux ELF
  [0x50, 0x4b, 0x03, 0x04],         // ZIP/JAR/APK
  [0xca, 0xfe, 0xba, 0xbe],         // Java class
  [0x23, 0x21],                       // Shell script (#!)
];

/**
 * Validate file contents by checking magic bytes against declared MIME type.
 * @param {Buffer} buffer - File buffer (at least first 8 bytes)
 * @param {string} declaredMime - MIME type declared by the client
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateFileBytes(buffer, declaredMime) {
  const header = new Uint8Array(buffer.slice(0, 8));

  // Reject executables first
  for (const sig of EXECUTABLE_SIGNATURES) {
    if (sig.every((byte, i) => header[i] === byte)) {
      return { valid: false, reason: 'File executable terdeteksi' };
    }
  }

  // Verify magic bytes match declared MIME
  const expected = MAGIC_SIGNATURES[declaredMime];
  if (!expected) {
    return { valid: false, reason: 'Tipe file tidak didukung' };
  }

  if (!expected.every((byte, i) => header[i] === byte)) {
    return { valid: false, reason: 'Konten file tidak sesuai dengan tipe yang dideklarasikan' };
  }

  return { valid: true };
}
