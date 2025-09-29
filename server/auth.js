import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_EXPIRES_DAYS || '30', 10);

function generateAccessToken(userId, email) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60, // seconds
  };
}

function setRefreshCookies(res, sessionId, refreshToken) {
  const opts = getCookieOptions();
  res.cookie('sid', sessionId, opts);
  res.cookie('rt', refreshToken, opts);
}

function clearRefreshCookies(res) {
  const opts = getCookieOptions();
  res.clearCookie('sid', { ...opts, maxAge: 0 });
  res.clearCookie('rt', { ...opts, maxAge: 0 });
}

async function createSessionAndRefreshToken(req, userId) {
  const sessionId = uuidv4();
  const ua = req.headers['user-agent'] || null;
  const ip = req.ip || null;

  await query(
    `INSERT INTO auth.sessions (id, user_id, created_at, updated_at, not_after, user_agent, ip)
     VALUES ($1, $2, now(), now(), now() + ($3 || ' days')::interval, $4, $5)`,
    [sessionId, userId, String(REFRESH_EXPIRES_DAYS), ua, ip]
  );

  const refreshPlain = crypto.randomBytes(64).toString('hex');
  const refreshHash = await bcrypt.hash(refreshPlain, 12);

  await query(
    `INSERT INTO auth.refresh_tokens (token, user_id, revoked, parent, created_at, updated_at, session_id)
     VALUES ($1, $2, false, NULL, now(), now(), $3)`,
    [refreshHash, userId, sessionId]
  );

  return { sessionId, refreshToken: refreshPlain };
}

export async function register(req, res) {
  try {
    const {
      email,
      password,
      full_name,
      company_name,
      phone,
      maksud_tujuan,
      role, // optional: from Public Register (e.g., 'pelaku_usaha' | 'internal_group')
      context, // optional: 'public' only from PublicRegister
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Allow only safe roles from PublicRegister context; fallback to 'guest' for others (e.g., AuthPage)
    const allowedPublicRoles = ['pelaku_usaha', 'internal_group'];
    const isPublic = context === 'public';
    const assignedRole = isPublic && allowedPublicRoles.includes(role) ? role : 'guest';

    await query('BEGIN');

    try {
      const existing = await query(
        'SELECT id FROM auth.users WHERE email = $1 LIMIT 1',
        [email]
      );

      if (existing.rowCount > 0) {
        await query('ROLLBACK');
        return res.status(409).json({ error: 'Email already registered' });
      }

      const userId = uuidv4();
      const hash = await bcrypt.hash(password, 10);

      // Store basic user + raw meta for traceability
      await query(
        `INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, raw_user_meta_data)
         VALUES ($1,$2,$3, now(), now(), $4::jsonb)`,
        [
          userId,
          email,
          hash,
          JSON.stringify({ full_name, company_name, phone, maksud_tujuan }),
        ]
      );

      // Upsert full profile with metadata
      await query(
        `INSERT INTO public.profiles (id, user_id, full_name, company_name, phone, maksud_tujuan, created_at, updated_at)
         VALUES ($1,$1,$2,$3,$4,$5, now(), now())
         ON CONFLICT (user_id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           company_name = EXCLUDED.company_name,
           phone = EXCLUDED.phone,
           maksud_tujuan = EXCLUDED.maksud_tujuan,
           updated_at = now()`,
        [
          userId,
          full_name || email,
          company_name || null,
          phone || null,
          maksud_tujuan || null,
        ]
      );

      // Enforce single role: cleanup then assign role based on context (public only)
      await query('DELETE FROM public.user_roles WHERE user_id = $1', [userId]);
      await query(
        `INSERT INTO public.user_roles (id, user_id, role, created_at)
         VALUES ($1,$2,$3, now())`,
        [uuidv4(), userId, assignedRole]
      );

      // Issue Access Token for auto-login (short-lived)
      const accessToken = generateAccessToken(userId, email);

      const roleRes = await query(
        'SELECT role FROM public.user_roles WHERE user_id = $1',
        [userId]
      );
      const roles = roleRes.rows.map(r => r.role);

      await query('COMMIT');

      // Create session + refresh token (httpOnly cookie)
      const { sessionId, refreshToken } = await createSessionAndRefreshToken(req, userId);
      setRefreshCookies(res, sessionId, refreshToken);

      return res.json({
        token: accessToken,
        user: {
          id: userId,
          email,
          full_name: full_name || email,
          roles,
          is_validated: false, // still pending admin validation (but login allowed)
        },
      });
    } catch (transactionError) {
      await query('ROLLBACK');
      throw transactionError;
    }
  } catch (e) {
    console.error('Registration error:', e.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Missing email or password in request');
      return res.status(400).json({ error: 'Email and password required' });
    }

    console.log('Querying user from database...');
    const { rows } = await query(
      'SELECT id, encrypted_password, raw_user_meta_data FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      console.log('User not found for email:', email);
      // Generic message (rollback) untuk mengurangi enumeration: tetap 404 untuk logging internal
      return res
        .status(404)
        .json({ error: 'Coba Lagi!. Email atau Password Salah' });
    }

    const user = rows[0];
    console.log('User found, verifying password...');
    const match = await bcrypt.compare(password, user.encrypted_password);
    if (!match) {
      console.log('Password verification failed for user:', user.id);
      // Generic message (rollback) tetap 401
      return res
        .status(401)
        .json({ error: 'Coba Lagi!. Email atau Password Salah' });
    }

    // Cek status validasi profile (informational only; login tetap diizinkan)
    const profileRes = await query(
      'SELECT is_validated FROM public.profiles WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    const isValidated = profileRes.rows[0]?.is_validated ?? false;
    // DO NOT block login if not validated; limited access enforced by permissions/role

    console.log('Password verified, generating token...');
    const accessToken = generateAccessToken(user.id, email);

    // Basic roles
    console.log('Fetching user roles...');
    const roleRes = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [user.id]
    );
    const roles = roleRes.rows.map(r => r.role);
    console.log('Login successful for user:', user.id, 'with roles:', roles);

    // Fetch profile (full_name) so frontend immediately has display name without needing extra refresh
    let fullName = null;
    try {
      const profileRes2 = await query(
        'SELECT full_name FROM public.profiles WHERE user_id = $1 LIMIT 1',
        [user.id]
      );
      fullName = profileRes2.rows[0]?.full_name || null;
    } catch (e) {
      console.warn(
        'Failed to load full_name during login for user',
        user.id,
        e.message
      );
    }

    // Create session + refresh token (httpOnly cookie)
    const { sessionId, refreshToken } = await createSessionAndRefreshToken(req, user.id);
    setRefreshCookies(res, sessionId, refreshToken);

    return res.json({
      token: accessToken,
      user: {
        id: user.id,
        email,
        roles,
        full_name: fullName,
        meta: user.raw_user_meta_data,
        is_validated: isValidated,
      },
    });
  } catch (e) {
    console.error('Login error details:', {
      message: e.message,
      code: e.code,
      detail: e.detail,
      stack: e.stack,
    });
    return res.status(500).json({ error: 'Login failed', details: e.message });
  }
}

export function authMiddleware(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.substring(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
    } catch (e) {
      // ignore invalid token
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

export async function refresh(req, res) {
  try {
    const sid = req.cookies?.sid;
    const rt = req.cookies?.rt;
    if (!sid || !rt) {
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { rows: sessRows } = await query(
      'SELECT id, user_id, not_after FROM auth.sessions WHERE id = $1 LIMIT 1',
      [sid]
    );
    if (sessRows.length === 0) {
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const session = sessRows[0];
    if (session.not_after && new Date(session.not_after) <= new Date()) {
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Session expired' });
    }

    const { rows: tokenRows } = await query(
      `SELECT id, token, revoked, created_at
         FROM auth.refresh_tokens
        WHERE session_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [sid]
    );
    if (tokenRows.length === 0) {
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const latest = tokenRows[0];
    if (latest.revoked) {
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const match = await bcrypt.compare(rt, latest.token);
    if (!match) {
      // Reuse or stolen token - revoke entire session and expire it
      await query(
        'UPDATE auth.refresh_tokens SET revoked = true, updated_at = now() WHERE session_id = $1 AND revoked = false',
        [sid]
      );
      await query(
        'UPDATE auth.sessions SET not_after = now(), updated_at = now() WHERE id = $1',
        [sid]
      );
      clearRefreshCookies(res);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Rotate refresh token
    const newPlain = crypto.randomBytes(64).toString('hex');
    const newHash = await bcrypt.hash(newPlain, 12);
    await query('UPDATE auth.refresh_tokens SET revoked = true, updated_at = now() WHERE id = $1', [latest.id]);
    await query(
      `INSERT INTO auth.refresh_tokens (token, user_id, revoked, parent, created_at, updated_at, session_id)
       VALUES ($1, $2, false, $3, now(), now(), $4)`,
      [newHash, session.user_id, String(latest.id), sid]
    );

    const { rows: userRows } = await query(
      'SELECT email FROM auth.users WHERE id = $1 LIMIT 1',
      [session.user_id]
    );
    const email = userRows[0]?.email || undefined;

    const accessToken = generateAccessToken(session.user_id, email);
    setRefreshCookies(res, sid, newPlain);

    return res.json({ token: accessToken });
  } catch (e) {
    console.error('Refresh error:', e?.message);
    clearRefreshCookies(res);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function logout(req, res) {
  try {
    const sid = req.cookies?.sid;
    if (sid) {
      await query(
        'UPDATE auth.refresh_tokens SET revoked = true, updated_at = now() WHERE session_id = $1 AND revoked = false',
        [sid]
      );
      await query(
        'UPDATE auth.sessions SET not_after = now(), updated_at = now() WHERE id = $1',
        [sid]
      );
    }
    clearRefreshCookies(res);
    return res.json({ success: true });
  } catch (_e) {
    clearRefreshCookies(res);
    return res.json({ success: true });
  }
}
