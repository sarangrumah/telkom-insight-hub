import { createHash } from 'node:crypto';
import { query } from '../db.js';

// =============================================================================
// Panel — Batched Activity Logger (ISO 27001 audit trail)
// Ported pattern from e-telekomunikasi-js (src/lib/services/activity-logger.ts).
//
// Writes to existing public.activity_logs table:
//   (user_id, action, resource_type, resource_id, details, created_at)
// Extra request metadata (path, method, ip, ua, status, duration) is stuffed
// into `details` JSON so no schema change is required.
// =============================================================================

const FLUSH_INTERVAL_MS = 2_000;
const FLUSH_THRESHOLD = 50;
const UA_MAX_LENGTH = 500;

let buffer = [];
let flushTimer = null;
let flushing = false;

export function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') return realIp;
  return req.ip || null;
}

export function computeSessionId(userId, ip, ua) {
  if (userId) return userId;
  const raw = `${ip ?? 'unknown'}|${ua ?? 'unknown'}`;
  return createHash('sha256').update(raw).digest('hex').substring(0, 64);
}

async function flush() {
  if (flushing || buffer.length === 0) return;
  flushing = true;

  const batch = buffer;
  buffer = [];

  try {
    // Build a single multi-row INSERT. 6 cols per row.
    const values = [];
    const placeholders = batch
      .map((entry, i) => {
        const base = i * 6;
        values.push(
          entry.userId,
          entry.action,
          entry.resourceType,
          entry.resourceId,
          JSON.stringify(entry.details),
          entry.createdAt,
        );
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::jsonb, $${base + 6})`;
      })
      .join(', ');

    await query(
      `INSERT INTO public.activity_logs
         (user_id, action, resource_type, resource_id, details, created_at)
       VALUES ${placeholders}`,
      values,
    );
  } catch (err) {
    console.error(`[activityLogger] Batch write failed (${batch.length} entries):`, err?.message);
  } finally {
    flushing = false;
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
  if (typeof flushTimer === 'object' && 'unref' in flushTimer) flushTimer.unref();
}

/**
 * Queue an activity log entry. Batched writes prevent connection pool exhaustion.
 * @param {object} params
 * @param {string} params.action           e.g. 'api_request', 'login', 'logout', 'upload'
 * @param {string|null} [params.userId]
 * @param {string} [params.resourceType='api']
 * @param {string|null} [params.resourceId]
 * @param {object} [params.details={}]     Arbitrary JSON metadata
 */
export function logActivity(params) {
  if (!params?.action) return;

  const details = {
    ...(params.details || {}),
    sessionId: computeSessionId(
      params.userId ?? null,
      params.details?.ipAddress ?? null,
      params.details?.userAgent ?? null,
    ),
  };

  if (typeof details.userAgent === 'string' && details.userAgent.length > UA_MAX_LENGTH) {
    details.userAgent = details.userAgent.slice(0, UA_MAX_LENGTH);
  }

  // `resource_id` is a UUID column in public.activity_logs — never put a path
  // or free-form string there. Only accept valid UUIDs; otherwise leave null
  // and keep the identifier in `details`.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const rid = typeof params.resourceId === 'string' && UUID_RE.test(params.resourceId)
    ? params.resourceId
    : null;
  if (!rid && params.resourceId != null) {
    details.resourceIdText = String(params.resourceId);
  }

  buffer.push({
    userId: params.userId ?? null,
    action: params.action,
    resourceType: params.resourceType ?? 'api',
    resourceId: rid,
    details,
    createdAt: new Date(),
  });

  if (buffer.length >= FLUSH_THRESHOLD) {
    void flush();
  } else {
    scheduleFlush();
  }
}

/**
 * Express middleware — logs every request that reaches it (after authMiddleware
 * for correct userId). Skips OPTIONS, /health, and static /uploads/*.
 */
export function requestLogger(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  if (req.path === '/health') return next();
  if (req.path.startsWith('/uploads/')) return next();

  const start = Date.now();
  const userId = req.user?.sub || null;
  const ip = extractClientIp(req);
  const ua = req.headers['user-agent'] || null;

  res.on('finish', () => {
    logActivity({
      action: 'api_request',
      userId,
      resourceType: 'api',
      // resource_id column is UUID — request paths go into details.path below.
      resourceId: null,
      details: {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        ipAddress: ip,
        userAgent: ua,
      },
    });
  });

  next();
}

// Flush remaining entries on process exit
for (const sig of ['SIGINT', 'SIGTERM', 'beforeExit']) {
  process.once(sig, () => {
    void flush();
  });
}
