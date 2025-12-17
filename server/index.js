import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { authMiddleware, register, registerWithDetails, login, requireAuth, refresh, logout } from './auth.js';
import { listTickets, updateTicket, createTicket } from './tickets.js';
import { getProfile } from './user.js';
import {
  getSecurityMetrics,
  getAPIMetrics,
  logActivity,
  logAPICall,
  getAuditLogs,
  createAuditLog,
} from './devsecops.js';
import { query } from './db.js';
import pool from './db.js';

import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer } from 'http';
import { attachWebSocket } from './ws.js';
import { listTicketMessages, createTicketMessage, markMessagesRead } from './messages.js';
import skloRoutes from './routes/sklo.js';
import telekomDataRoutes from './routes/telekom-data.js';
import tariffRoutes from './routes/tarif.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean)) || ['http://localhost:5173', 'http://localhost:8080'];
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));

// Register telekom data routes
app.use('/panel/api', skloRoutes);
app.use('/panel/api', telekomDataRoutes);
app.use('/panel/api', tariffRoutes);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// User profile (untuk kompatibilitas frontend apiClient.getProfile())
app.get('/panel/api/user/profile', requireAuth, getProfile);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---- Rate Limiters ----
// Global (optional) - moderate limits to prevent abuse (can be tuned / disabled)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // high enough not to disturb normal users
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Login attempts: stricter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 100,
  max: 100, // 10 attempts / 15m / IP
 standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true, // successful logins do not count toward limit
});

// Email availability check: lighter but still prevents hammering
const emailCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
 max: 3000, // 30 checks per minute per IP
  standardHeaders: true,
 legacyHeaders: false,
  message: { error: 'Too many email checks, slow down' },
});

// Auth
app.post('/panel/api/auth/register', register);
app.post('/panel/api/auth/login', loginLimiter, login);
// Refresh and logout for session handling
app.post('/panel/api/auth/refresh', refresh);
app.post('/panel/api/auth/logout', logout);
// Cek ketersediaan email (pre-registration)
app.get('/panel/api/auth/check-email', emailCheckLimiter, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email query param required' });
    }
    const { rows } = await query(
      'SELECT 1 FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    );
    return res.json({ available: rows.length === 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to check email' });
  }
});

// ---- Uploads: PDF to storage/uploads ----
const UPLOAD_DIR = path.resolve(process.cwd(), 'storage', 'uploads');
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (e) {
  console.warn('Failed to ensure upload dir exists:', e?.message);
}

// Multer configuration for general file uploads (PDFs)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const userId = req.user?.sub || 'anon';
    const timestamp = Date.now();
    const safeOriginal = String(file.originalname || 'file.pdf').replace(/[^\w.\-]+/g, '_');
    cb(null, `${userId}-${timestamp}-${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      const err = new Error('Only PDF files are allowed');
      // @ts-ignore
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
 },
});

// Multer configuration for registration with documents (PDFs and images)
const storageWithImages = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const userId = req.user?.sub || 'anon';
    const timestamp = Date.now();
    const safeOriginal = String(file.originalname || 'file').replace(/[^\w.\-]+/g, '_');
    cb(null, `${userId}-${timestamp}-${safeOriginal}`);
  },
});

const uploadWithImages = multer({
  storage: storageWithImages,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    // Allow both PDFs and images for registration
    if (!file.mimetype.match(/^(application\/pdf|image\/(jpeg|jpg|png|gif|webp))$/)) {
      const err = new Error('Only PDF and image files are allowed');
      // @ts-ignore
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

// Enhanced registration with document support (after multer middleware is defined)
app.post('/panel/api/auth/register-with-details', uploadWithImages.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'nib_document', maxCount: 1 },
  { name: 'npwp_document', maxCount: 1 },
  { name: 'akta_document', maxCount: 1 },
  { name: 'ktp_document', maxCount: 1 },
  { name: 'assignment_letter', maxCount: 1 },
  { name: 'business_license_document', maxCount: 1 },
  { name: 'company_stamp', maxCount: 1 },
  { name: 'company_certificate', maxCount: 1 }
]), registerWithDetails);

// Serve static uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// Upload endpoint (returns absolute file URL)
app.post('/panel/api/uploads', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      return res.status(err.status || 400).json({ error: msg });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const base =
      process.env.PUBLIC_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;
    const file_url = `${base}/uploads/${file.filename}`;

    return res.json({
      file_url,
      file_name: file.originalname,
      size: file.size,
    });
 });
});

// Tickets
app.get('/panel/api/tickets', requireAuth, listTickets);
app.post('/panel/api/tickets', requireAuth, createTicket);
app.patch('/panel/api/tickets/:id', requireAuth, updateTicket);
// Ticket messages
app.get('/panel/api/tickets/:id/messages', requireAuth, listTicketMessages);
app.post('/panel/api/tickets/:id/messages', requireAuth, createTicketMessage);
app.post('/panel/api/tickets/:id/messages/read', requireAuth, markMessagesRead);

// Ticket assignments
app.get('/panel/api/tickets/:id/assignments', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      'SELECT * FROM public.ticket_assignments WHERE ticket_id = $1 ORDER BY assigned_at DESC',
      [id]
    );

    // Get user profiles for assignees and assigners
    const userIds = [...new Set([
      ...rows.map(r => r.assigned_to),
      ...rows.map(r => r.assigned_by)
    ].filter(Boolean))];

    let profilesMap = {};
    if (userIds.length > 0) {
      const { rows: profiles } = await query(
        'SELECT user_id, full_name FROM public.profiles WHERE user_id = ANY($1)',
        [userIds]
      );
      profilesMap = profiles.reduce((acc, p) => {
        acc[p.user_id] = { full_name: p.full_name };
        return acc;
      }, {});
    }

    const assignments = rows.map(assignment => ({
      ...assignment,
      assignee_profile: profilesMap[assignment.assigned_to] || null,
      assigner_profile: profilesMap[assignment.assigned_by] || null,
    }));

    res.json(assignments);
  } catch (e) {
    console.error('Error fetching assignments:', e);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/panel/api/tickets/:id/assign', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, notes } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }

    await query('BEGIN');

    // End any current assignment
    await query(
      'UPDATE public.ticket_assignments SET unassigned_at = now() WHERE ticket_id = $1 AND unassigned_at IS NULL',
      [id]
    );

    // Create new assignment
    const { rows } = await query(
      `INSERT INTO public.ticket_assignments (id, ticket_id, assigned_to, assigned_by, notes, assigned_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, now())
       RETURNING *`,
      [id, assigned_to, req.user.sub, notes || null]
    );

    // Update ticket
    await query(
      'UPDATE public.tickets SET assigned_to = $1, assignment_status = $2, updated_at = now() WHERE id = $3',
      [assigned_to, 'assigned', id]
    );

    await query('COMMIT');
    res.json({ assignment: rows[0] });
 } catch (e) {
    await query('ROLLBACK');
    console.error('Error assigning ticket:', e);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

app.post('/panel/api/tickets/:id/unassign', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await query('BEGIN');

    // End current assignment
    await query(
      'UPDATE public.ticket_assignments SET unassigned_at = now() WHERE ticket_id = $1 AND unassigned_at IS NULL',
      [id]
    );

    // Update ticket
    await query(
      'UPDATE public.tickets SET assigned_to = NULL, assignment_status = $1, updated_at = now() WHERE id = $2',
      ['unassigned', id]
    );

    await query('COMMIT');
    res.json({ success: true });
  } catch (e) {
    await query('ROLLBACK');
    console.error('Error unassigning ticket:', e);
    res.status(500).json({ error: 'Failed to unassign ticket' });
  }
});

// Admin users endpoint
app.get('/panel/api/admin/users/admins', requireAuth, requirePermission('user_management','read'), async (req, res) => {
  try {
    // Check if user is admin
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const roles = roleRows.map(r => r.role);
    if (!roles.includes('super_admin') && !roles.includes('internal_admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get admin users
    const { rows } = await query(`
      SELECT ur.user_id, p.full_name
      FROM public.user_roles ur
      LEFT JOIN public.profiles p ON p.user_id = ur.user_id
      WHERE ur.role IN ('super_admin', 'internal_admin', 'pengolah_data')
      ORDER BY p.full_name
    `);

    res.json(rows);
  } catch (e) {
    console.error('Error fetching admin users:', e);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});



// Telekom data list dengan pagination & filtering
app.get('/panel/api/telekom-data', requireAuth, requirePermission(['dashboard','data_management'],'read'), async (req, res) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      search,
      status,
      service_type,
      province_id,
      kabupaten_id,
      date_from,
      date_to,
    } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const pageSizeNum = Math.min(Math.max(parseInt(String(pageSize), 10) || 10, 1), 100);
    const offset = (pageNum - 1) * pageSizeNum;

    // Build filters (only filtering on telekom_data columns to keep COUNT(*) simple)
    const filters = [];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(td.company_name ILIKE $${i} OR td.license_number ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (status && typeof status === 'string') {
      filters.push(`td.status = $${i}`);
      params.push(status);
      i++;
    }
    if (service_type && typeof service_type === 'string') {
      filters.push(`td.service_type = $${i}`);
      params.push(service_type);
      i++;
    }
    if (province_id && typeof province_id === 'string') {
      filters.push(`td.province_id = $${i}`);
      params.push(province_id);
      i++;
    }
    if (kabupaten_id && typeof kabupaten_id === 'string') {
      filters.push(`td.kabupaten_id = $${i}`);
      params.push(kabupaten_id);
      i++;
    }
    if (date_from && typeof date_from === 'string') {
      filters.push(`td.license_date >= $${i}`);
      params.push(date_from);
      i++;
    }
    if (date_to && typeof date_to === 'string') {
      filters.push(`td.license_date <= $${i}`);
      params.push(date_to);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Total count for pagination
    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data td
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    // Data query
    const dataSql = `
      SELECT td.id, td.company_name, td.status, td.license_date, td.region,
             td.created_at, td.updated_at, td.created_by, td.file_url, td.license_number,
             td.service_type, td.sub_service_type, td.province_id, td.kabupaten_id,
             td.latitude, td.longitude,
             td.sub_service_id as direct_sub_service_id,
             ss.id as sub_service_id, ss.name as sub_service_name,
             s.id as service_id, s.name as service_name, s.code as service_code,
             p.name as province_name,
             k.name as kabupaten_name, k.type as kabupaten_type
      FROM public.telekom_data td
      LEFT JOIN public.sub_services ss ON ss.id = td.sub_service_id
      LEFT JOIN public.services s ON s.id = ss.service_id
      LEFT JOIN public.provinces p ON p.id = td.province_id
      LEFT JOIN public.kabupaten k ON k.id = td.kabupaten_id
      ${whereSql}
      ORDER BY td.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSizeNum, offset];
    const { rows } = await query(dataSql, dataParams);

    const data = rows.map(r => ({
      id: r.id,
      company_name: r.company_name,
      status: r.status,
      license_date: r.license_date,
      region: r.region,
      created_at: r.created_at,
      created_by: r.created_by,
      file_url: r.file_url,
      license_number: r.license_number,
      service_type: r.service_type,
      sub_service_type: r.sub_service_type,
      province_id: r.province_id,
      kabupaten_id: r.kabupaten_id,
      latitude: r.latitude,
      longitude: r.longitude,
      sub_service_id: r.direct_sub_service_id || r.sub_service_id || null,
      service_id: r.service_id || null,
      updated_at: r.updated_at,
      province: r.province_id
        ? { id: r.province_id, name: r.province_name }
        : null,
      kabupaten: r.kabupaten_id
        ? { id: r.kabupaten_id, name: r.kabupaten_name, type: r.kabupaten_type }
        : null,
      sub_service: r.sub_service_id
        ? {
            id: r.sub_service_id,
            name: r.sub_service_name,
            service: r.service_id
              ? {
                  id: r.service_id,
                  name: r.service_name,
                  code: r.service_code,
                }
              : null,
          }
        : null,
    }));

    res.json({ data, page: pageNum, pageSize: pageSizeNum, total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load telekom data' });
 }
});

// Services (simple lookup lists)
app.get('/panel/api/services', requireAuth, async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, code, description FROM public.services ORDER BY name ASC'
    );
    res.json({ services: rows });
  } catch (e) {
    console.error('Failed to load services', e);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Aggregated counts by service (jenis penyelenggara)
// Returns fixed order for UI consistency
app.get('/panel/api/stats/service-counts', requireAuth, async (_req, res) => {
  try {
    const sql = `
      SELECT s.code, s.name, COALESCE(COUNT(td.id), 0)::int AS count
      FROM public.services s
      LEFT JOIN public.sub_services ss ON ss.service_id = s.id
      LEFT JOIN public.telekom_data td ON td.sub_service_id = ss.id
      GROUP BY s.id, s.code, s.name
    `;

    const { rows } = await query(sql);

    // Normalize/alias certain codes for consistency (e.g., DB might store 'telekomunikasi_khusus')
    const alias = (code) => {
      const c = String(code || '').toLowerCase();
      if (c === 'telekomunikasi_khusus') return 'telsus';
      return c;
    };

    // Map to desired codes and order to ensure all present
    const desiredOrder = [
      'jasa',
      'jaringan',
      'penomoran',
      'tarif',
      'telsus',
      'sklo',
      'lko',
      'isr',
    ];

    // Accumulate counts with aliasing
    const acc = new Map();
    for (const r of rows) {
      const code = alias(r.code);
      const prev = acc.get(code) || { code, name: r.name, count: 0 };
      prev.count += Number(r.count || 0);
      acc.set(code, prev);
    }

    const counts = desiredOrder.map(code => {
      const rec = acc.get(code);
      return {
        code,
        name: rec?.name || code.toUpperCase(),
        count: rec?.count ? Number(rec.count) : 0,
      };
    });

    res.json({ counts });
  } catch (e) {
    console.error('Failed to compute service counts', e);
    res.status(500).json({ error: 'Failed to compute service counts', counts: [] });
  }
});


// Public aggregated counts by service (jenis penyelenggara) - no auth
app.get('/panel/api/public/stats/service-counts', async (_req, res) => {
  try {
    const sql = `
      SELECT s.code, s.name, COALESCE(COUNT(td.id), 0)::int AS count
      FROM public.services s
      LEFT JOIN public.sub_services ss ON ss.service_id = s.id
      LEFT JOIN public.telekom_data td ON td.sub_service_id = ss.id
      GROUP BY s.id, s.code, s.name
    `;

    const { rows } = await query(sql);

    const alias = (code) => {
      const c = String(code || '').toLowerCase();
      if (c === 'telekomunikasi_khusus') return 'telsus';
      return c;
    };

    const desiredOrder = [
      'jasa',
      'jaringan',
      'penomoran',
      'tarif',
      'telsus',
      'sklo',
      'lko',
      'isr',
    ];

    const acc = new Map();
    for (const r of rows) {
      const code = alias(r.code);
      const prev = acc.get(code) || { code, name: r.name, count: 0 };
      prev.count += Number(r.count || 0);
      acc.set(code, prev);
    }

    const counts = desiredOrder.map(code => {
      const rec = acc.get(code);
      return {
        code,
        name: rec?.name || code.toUpperCase(),
        count: rec?.count ? Number(rec.count) : 0,
      };
    });

    res.json({ counts });
  } catch (e) {
    console.error('Failed to compute public service counts', e);
    res.status(500).json({ error: 'Failed to compute service counts', counts: [] });
  }
});

// Public dashboard stats - no auth
app.get('/panel/api/public/stats/dashboard', async (_req, res) => {
  try {
    const sql = `
      SELECT
        COALESCE(SUM(CASE WHEN LOWER(status) = 'active' THEN 1 ELSE 0 END), 0)::int AS total_licenses,
        COALESCE(COUNT(DISTINCT CASE WHEN LOWER(status) = 'active' THEN company_name ELSE NULL END), 0)::int AS active_operators,
        COALESCE(COUNT(*), 0)::int AS total_applications,
        COALESCE(SUM(CASE WHEN LOWER(status) IN ('pending','in_review','review','requested','menunggu','waiting','waiting_approval','submitted') THEN 1 ELSE 0 END), 0)::int AS pending_approvals
      FROM public.telekom_data
    `;
    const { rows } = await query(sql);
    const row = rows[0] || {};
    res.json({
      total_licenses: Number(row.total_licenses || 0),
      active_operators: Number(row.active_operators || 0),
      total_applications: Number(row.total_applications || 0),
      pending_approvals: Number(row.pending_approvals || 0),
    });
  } catch (e) {
    console.error('Failed to compute dashboard stats', e);
    res.status(500).json({
      total_licenses: 0,
      active_operators: 0,
      total_applications: 0,
      pending_approvals: 0,
      error: 'Failed to compute dashboard stats',
    });
  }
});

app.get('/panel/api/sub-services', requireAuth, async (_req, res) => {
  try {
    const sql = `SELECT ss.id, ss.service_id, ss.name, ss.code, ss.description,
                        s.id as s_id, s.name as s_name, s.code as s_code, s.description as s_description
                 FROM public.sub_services ss
                 LEFT JOIN public.services s ON s.id = ss.service_id
                 ORDER BY ss.name ASC`;
    const { rows } = await query(sql);
    const sub_services = rows.map(r => ({
      id: r.id,
      service_id: r.service_id,
      name: r.name,
      code: r.code,
      description: r.description,
      service: r.s_id
        ? {
            id: r.s_id,
            name: r.s_name,
            code: r.s_code,
            description: r.s_description,
          }
        : null,
    }));
    res.json({ sub_services });
  } catch (e) {
    console.error('Failed to load sub-services', e);
    res.status(500).json({ error: 'Failed to load sub-services' });
 }
});

// Helper to map a single telekom_data row with joins to the shape used by list endpoint
async function fetchTelekomDataRecord(id) {
  const sql = `
    SELECT td.id, td.company_name, td.status, td.license_date, td.region,
           td.province_id, td.kabupaten_id, td.latitude, td.longitude,
           td.sub_service_id as direct_sub_service_id,
           ss.id as sub_service_id, ss.name as sub_service_name,
           s.id as service_id, s.name as service_name, s.code as service_code,
           p.name as province_name,
           k.name as kabupaten_name, k.type as kabupaten_type,
           td.file_url, td.created_at, td.updated_at, td.created_by
    FROM public.telekom_data td
    LEFT JOIN public.sub_services ss ON ss.id = td.sub_service_id
    LEFT JOIN public.services s ON s.id = ss.service_id
    LEFT JOIN public.provinces p ON p.id = td.province_id
    LEFT JOIN public.kabupaten k ON k.id = td.kabupaten_id
    WHERE td.id = $1
    LIMIT 1`;
  const { rows } = await query(sql, [id]);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    company_name: r.company_name,
    status: r.status,
    license_date: r.license_date,
    region: r.region,
    province_id: r.province_id,
    kabupaten_id: r.kabupaten_id,
    latitude: r.latitude,
    longitude: r.longitude,
    sub_service_id: r.direct_sub_service_id || r.sub_service_id || null,
    service_id: r.service_id || null,
    sub_service: r.sub_service_id
      ? {
          id: r.sub_service_id,
          name: r.sub_service_name,
          service: r.service_id
            ? { id: r.service_id, name: r.service_name, code: r.service_code }
            : null,
        }
      : null,
    file_url: r.file_url || null,
    province: r.province_id
      ? { id: r.province_id, name: r.province_name }
      : null,
    kabupaten: r.kabupaten_id
      ? { id: r.kabupaten_id, name: r.kabupaten_name, type: r.kabupaten_type }
      : null,
    created_at: r.created_at,
    created_by: r.created_by,
  };
}

// Location data (provinces & kabupaten) replacing prior Supabase direct fetches
app.get('/panel/api/provinces', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, code, name, latitude, longitude FROM public.provinces ORDER BY name ASC'
    );
    res.json({ provinces: rows });
  } catch (e) {
    console.error('Failed to load provinces', e);
    res.status(500).json({ error: 'Failed to load provinces' });
  }
});

// ---------------- FAQ PUBLIC ENDPOINTS ----------------

// GET /panel/api/faqs (public): list only active FAQs, optional search and category filter
app.get('/panel/api/faqs', async (req, res) => {
  try {
    const { search, category_id } = req.query;

    const filters = ['is_active = true'];
    const params = [];
    let i = 1;

    if (search && typeof search === 'string') {
      filters.push(`(question ILIKE $${i} OR answer ILIKE $${i})`);
      params.push(`%${search}%`);
      i++;
    }
    if (category_id && typeof category_id === 'string') {
      filters.push(`(category_id = $${i})`);
      params.push(category_id);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const sql = `
      SELECT id, question, answer, category_id, is_active, file_url, created_at, updated_at
      FROM public.faqs
      ${whereSql}
      ORDER BY created_at DESC
    `;
    const { rows } = await query(sql, params);
    res.json({ faqs: rows });
  } catch (e) {
    console.error('Failed to load faqs', e);
    res.status(500).json({ error: 'Failed to load faqs' });
  }
});

// GET /panel/api/faq-categories (public)
app.get('/panel/api/faq-categories', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, description, created_at FROM public.faq_categories ORDER BY name ASC'
    );
    res.json({ categories: rows });
  } catch (e) {
    console.error('Failed to load faq categories', e);
    res.status(500).json({ error: 'Failed to load faq categories' });
  }
});
// Public search endpoint untuk telekom_data (tanpa auth)
app.get('/panel/api/public/telekom-data/search', async (req, res) => {
  try {
    const { q, limit = '20', offset = '0' } = req.query;

    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 50);
    const offsetNum = Math.max(parseInt(String(offset), 10) || 0, 0);

    const filters = [];
    const params = [];
    let i = 1;

    if (q && typeof q === 'string') {
      filters.push(
        `(company_name ILIKE $${i} OR license_number ILIKE $${i} OR region ILIKE $${i})`
      );
      params.push(`%${q}%`);
      i++;
    }

    const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM public.telekom_data
      ${whereSql}
    `;
    const countResult = await query(countSql, params);
    const total = countResult.rows[0]?.count ?? 0;

    const dataSql = `
      SELECT id, company_name, service_type, license_number, region, status, created_at
      FROM public.telekom_data
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, limitNum, offsetNum];
    const { rows } = await query(dataSql, dataParams);

    res.json({ data: rows, total });
 } catch (e) {
    console.error('Public telekom_data search failed', e);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});
// Public detail endpoint untuk telekom_data (tanpa auth)
app.get('/panel/api/public/telekom-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const { rows } = await query(
      'SELECT id, company_name, service_type, license_number, license_date, region, status, sub_service_type, file_url, created_at FROM public.telekom_data WHERE id = $1 LIMIT 1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(rows[0]);
  } catch (e) {
    console.error('Public telekom_data detail failed', e);
    return res.status(500).json({ error: 'Failed to load detail' });
  }
});

app.get('/panel/api/kabupaten', async (_req, res) => {
  try {
    const { rows } = await query(`
      SELECT k.id, k.province_id, k.code, k.name, k.type, k.latitude, k.longitude,
             p.id AS p_id, p.code AS p_code, p.name AS p_name, p.latitude AS p_latitude, p.longitude AS p_longitude
      FROM public.kabupaten k
      LEFT JOIN public.provinces p ON p.id = k.province_id
      ORDER BY k.name ASC`);
    const kabupaten = rows.map(r => ({
      id: r.id,
      province_id: r.province_id,
      code: r.code,
      name: r.name,
      type: r.type,
      latitude: r.latitude,
      longitude: r.longitude,
      province: r.p_id
        ? {
            id: r.p_id,
            code: r.p_code,
            name: r.p_name,
            latitude: r.p_latitude,
            longitude: r.p_longitude,
          }
        : null,
    }));
    res.json({ kabupaten });
  } catch (e) {
    console.error('Failed to load kabupaten', e);
    res.status(500).json({ error: 'Failed to load kabupaten' });
 }
});

// Get kecamatan by kabupaten_id
app.get('/panel/api/kecamatan', async (req, res) => {
  try {
    const { kabupaten_id } = req.query;

    let querySql = `
      SELECT ir.region_id, ir.name, ir.type, ir.parent_id,
             k.id AS kabupaten_id, k.code AS kabupaten_code, k.name AS kabupaten_name
      FROM public.indonesian_regions ir
      LEFT JOIN public.kabupaten k ON k.code = ir.parent_id
      WHERE ir.type IN ('kecamatan', 'district')
    `;
    const params = [];

    if (kabupaten_id && typeof kabupaten_id === 'string') {
      querySql += ` AND k.id = $1`;
      params.push(kabupaten_id);
    }

    querySql += ` ORDER BY ir.name ASC`;

    const { rows } = await query(querySql, params);
    const kecamatan = rows.map(r => ({
      region_id: r.region_id,
      name: r.name,
      type: r.type,
      parent_id: r.parent_id,
      kabupaten: r.kabupaten_id
        ? {
            id: r.kabupaten_id,
            code: r.kabupaten_code,
            name: r.kabupaten_name,
          }
        : null,
    }));

    res.json({ kecamatan });
  } catch (e) {
    console.error('Failed to load kecamatan', e);
    res.status(500).json({ error: 'Failed to load kecamatan' });
 }
});

// Get kelurahan by kecamatan_id
app.get('/panel/api/kelurahan', async (req, res) => {
  try {
    const { kecamatan_id } = req.query;

    let querySql = `
      SELECT ir.region_id, ir.name, ir.type, ir.parent_id,
             k.region_id AS kecamatan_id, k.name AS kecamatan_name
      FROM public.indonesian_regions ir
      LEFT JOIN public.indonesian_regions k ON k.region_id = ir.parent_id
      WHERE ir.type IN ('kelurahan', 'village')
    `;
    const params = [];

    if (kecamatan_id && typeof kecamatan_id === 'string') {
      querySql += ` AND ir.parent_id = $1`;
      params.push(kecamatan_id);
    }

    querySql += ` ORDER BY ir.name ASC`;

    const { rows } = await query(querySql, params);
    const kelurahan = rows.map(r => ({
      region_id: r.region_id,
      name: r.name,
      type: r.type,
      parent_id: r.parent_id,
      kecamatan: r.kecamatan_id
        ? {
            id: r.kecamatan_id,
            name: r.kecamatan_name,
          }
        : null,
    }));

    res.json({ kelurahan });
  } catch (e) {
    console.error('Failed to load kelurahan', e);
    res.status(500).json({ error: 'Failed to load kelurahan' });
  }
});

function isAdminRoleList(roleRows) {
  const roles = roleRows.map(r => r.role);
  return roles.includes('super_admin') || roles.includes('internal_admin');
}

// Middleware: require admin role
async function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    if (!isAdminRoleList(roleRows)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (e) {
    console.error('Admin check failed', e);
    return res.status(500).json({ error: 'Admin check failed' });
  }
}

/**
 * Middleware: requirePermission(moduleCodes, action)
 * action ∈ {'create'|'read'|'update'|'delete'}
 * - Admin ('super_admin'|'internal_admin') bypass by default.
 * - Mendukung satu module code (string) ATAU beberapa module codes (string[]), dengan logika OR.
 */
function requirePermission(moduleCodes, action) {
  const valid = new Set(['create', 'read', 'update', 'delete']);
  if (!valid.has(action)) {
    throw new Error(`Invalid action: ${action}`);
  }
  const actionColumn = {
    create: 'can_create',
    read: 'can_read',
    update: 'can_update',
    delete: 'can_delete',
  }[action];

  // Normalisasi moduleCodes menjadi array of non-empty strings
  const modules = Array.isArray(moduleCodes) ? moduleCodes : [moduleCodes];
  if (modules.length === 0 || modules.some(m => typeof m !== 'string' || m.trim() === '')) {
    throw new Error('requirePermission: moduleCodes must be a non-empty string or string[]');
  }

  return async function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
      // Admin bypass
      const { rows: roleRows } = await query(
        'SELECT role FROM public.user_roles WHERE user_id = $1',
        [req.user.sub]
      );
      if (isAdminRoleList(roleRows)) return next();

      // Cek permission efektif user untuk salah satu module (OR)
      let idx = 1;
      const params = [];
      const orClauses = modules.map(code => {
        params.push(code);
        const clause = `(m.code = $${idx} AND p.${actionColumn} = true)`;
        idx += 1;
        return clause;
      });

      // user id as last param
      params.push(req.user.sub);

      const sql = `
        SELECT 1
          FROM public.permissions p
          LEFT JOIN public.modules m ON m.id = p.module_id
         WHERE (${orClauses.join(' OR ')})
           AND p.role IN (SELECT role FROM public.user_roles WHERE user_id = $${idx})
         LIMIT 1`;
      const { rows } = await query(sql, params);
      if (rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      console.error('[requirePermission] failed', { modules, action, err: e?.message });
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}


// ---------------- FAQ ADMIN ENDPOINTS ----------------

// GET /panel/api/admin/faqs (admin): list all FAQs
app.get('/panel/api/admin/faqs', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, question, answer, category_id, is_active, file_url, created_at, updated_at
       FROM public.faqs
       ORDER BY created_at DESC`
    );
    res.json({ faqs: rows });
  } catch (e) {
    console.error('Failed to load admin faqs', e);
    res.status(500).json({ error: 'Failed to load admin faqs' });
  }
});

// POST /panel/api/faqs (admin): create FAQ
app.post('/panel/api/faqs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { question, answer, category_id, is_active = true, file_url = null } = req.body || {};
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    const catId = category_id && category_id !== 'none' ? category_id : null;

    const insertSql = `
      INSERT INTO public.faqs (id, question, answer, category_id, is_active, file_url, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now(), now())
      RETURNING id`;
    const { rows } = await query(insertSql, [
      question.trim(),
      answer.trim(),
      catId,
      !!is_active,
      file_url || null,
    ]);
    const newId = rows[0]?.id;
    const { rows: fetched } = await query(
      `SELECT id, question, answer, category_id, is_active, file_url, created_at, updated_at
       FROM public.faqs WHERE id = $1 LIMIT 1`,
      [newId]
    );
    res.status(201).json({ data: fetched[0] });
 } catch (e) {
    console.error('Create FAQ failed', e);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

// PATCH /panel/api/faqs/:id (admin): update FAQ
app.patch('/panel/api/faqs/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['question', 'answer', 'category_id', 'is_active', 'file_url'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of allowed) {
      if (field in req.body) {
        if (field === 'category_id' && (req.body[field] === 'none' || req.body[field] === '')) {
          updates.push(`${field} = $${idx}`);
          params.push(null);
        } else if (field === 'question' || field === 'answer') {
          updates.push(`${field} = $${idx}`);
          params.push(String(req.body[field]).trim());
        } else {
          updates.push(`${field} = $${idx}`);
          params.push(req.body[field]);
        }
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    params.push(id);
    const updateSql = `UPDATE public.faqs SET ${updates.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING id`;
    const result = await query(updateSql, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    const { rows } = await query(
      `SELECT id, question, answer, category_id, is_active, file_url, created_at, updated_at
       FROM public.faqs WHERE id = $1 LIMIT 1`,
      [id]
    );
    res.json({ data: rows[0] });
 } catch (e) {
    console.error('Update FAQ failed', e);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

// DELETE /panel/api/faqs/:id (admin): delete FAQ
app.delete('/panel/api/faqs/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const del = await query('DELETE FROM public.faqs WHERE id = $1', [id]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json({ success: true });
  } catch (e) {
    console.error('Delete FAQ failed', e);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// POST /panel/api/faq-categories (admin): create category
app.post('/panel/api/faq-categories', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const insertSql = `
      INSERT INTO public.faq_categories (id, name, description, created_at)
      VALUES (gen_random_uuid(), $1, $2, now())
      RETURNING id`;
    const { rows } = await query(insertSql, [name.trim(), description?.trim() || null]);
    const newId = rows[0]?.id;
    const { rows: fetched } = await query(
      `SELECT id, name, description, created_at FROM public.faq_categories WHERE id = $1 LIMIT 1`,
      [newId]
    );
    res.status(201).json({ data: fetched[0] });
  } catch (e) {
    console.error('Create FAQ category failed', e);
    res.status(500).json({ error: 'Failed to create FAQ category' });
  }
});

// PATCH /panel/api/faq-categories/:id (admin): update category
app.patch('/panel/api/faq-categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'description'];
    const updates = [];
    const params = [];
    let i = 1;

    for (const f of allowed) {
      if (f in req.body) {
        updates.push(`${f} = $${i}`);
        if (f === 'name') {
          params.push(String(req.body[f]).trim());
        } else {
          const v = req.body[f];
          params.push(typeof v === 'string' ? v.trim() : v ?? null);
        }
        i++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    params.push(id);
    const sql = `UPDATE public.faq_categories SET ${updates.join(', ')}, created_at = created_at WHERE id = $${i}`;
    await query(sql, params);

    const { rows } = await query(
      `SELECT id, name, description, created_at FROM public.faq_categories WHERE id = $1 LIMIT 1`,
      [id]
    );
    res.json({ data: rows[0] });
 } catch (e) {
    console.error('Update FAQ category failed', e);
    res.status(500).json({ error: 'Failed to update FAQ category' });
  }
});

// DELETE /panel/api/faq-categories/:id (admin): delete category with relation check
app.delete('/panel/api/faq-categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: cntRows } = await query(
      'SELECT COUNT(*)::int AS c FROM public.faqs WHERE category_id = $1',
      [id]
    );
    const c = cntRows[0]?.c ?? 0;
    if (c > 0) {
      return res
        .status(409)
        .json({ error: `Cannot delete category. It has ${c} associated FAQ(s).` });
    }
    const del = await query('DELETE FROM public.faq_categories WHERE id = $1', [id]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true });
  } catch (e) {
    console.error('Delete FAQ category failed', e);
    res.status(500).json({ error: 'Failed to delete FAQ category' });
  }
});

// Create telekom data
app.post('/panel/api/telekom-data', requireAuth, requirePermission('data_management','create'), async (req, res) => {
  try {
    const {
      company_name,
      sub_service_id,
      status = 'active',
      license_number = null,
      license_date = null,
      province_id = null,
      kabupaten_id = null,
      region = null,
      latitude = null,
      longitude = null,
      file_url = null,
      service_type = null, // legacy/back-compat
      sub_service_type = null, // legacy/back-compat
    } = req.body || {};

    if (!company_name || !sub_service_id) {
      return res
        .status(400)
        .json({ error: 'company_name and sub_service_id are required' });
    }

    const insertSql = `
      INSERT INTO public.telekom_data
        (id, company_name, sub_service_id, status, license_number, license_date, province_id, kabupaten_id, region, latitude, longitude, file_url, service_type, sub_service_type, created_by, created_at, updated_at)
      VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now(), now())
      RETURNING id`;
    const params = [
      company_name,
      sub_service_id,
      status,
      license_number,
      license_date,
      province_id,
      kabupaten_id,
      region,
      latitude,
      longitude,
      file_url,
      service_type,
      sub_service_type,
      req.user.sub,
    ];
    const { rows } = await query(insertSql, params);
    const newId = rows[0]?.id;
    const record = await fetchTelekomDataRecord(newId);
    res.status(201).json({ data: record });
  } catch (e) {
    console.error('Create telekom data failed', e);
    res.status(500).json({ error: 'Failed to create telekom data' });
  }
});

// Update telekom data (owner or admin)
app.patch('/panel/api/telekom-data/:id', requireAuth, requirePermission('data_management','update'), async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch existing for authorization
    const { rows: existingRows } = await query(
      'SELECT id, created_by FROM public.telekom_data WHERE id = $1',
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const existing = existingRows[0];

    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const isAdmin = isAdminRoleList(roleRows);
    if (!isAdmin && existing.created_by !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allowedFields = [
      'company_name',
      'sub_service_id',
      'status',
      'license_number',
      'license_date',
      'province_id',
      'kabupaten_id',
      'region',
      'latitude',
      'longitude',
      'file_url',
      'service_type',
      'sub_service_type',
    ];
    const updates = [];
    const params = [];
    let idx = 1;
    for (const field of allowedFields) {
      if (field in req.body) {
        updates.push(`${field} = $${idx}`);
        params.push(req.body[field]);
        idx++;
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }
    params.push(id); // final param for WHERE
    const updateSql = `UPDATE public.telekom_data SET ${updates.join(
      ', '
    )}, updated_at = now() WHERE id = $${idx}`;
    await query(updateSql, params);
    const record = await fetchTelekomDataRecord(id);
    res.json({ data: record });
  } catch (e) {
    console.error('Update telekom data failed', e);
    res.status(500).json({ error: 'Failed to update telekom data' });
  }
});

// Delete telekom data (owner or admin)
app.delete('/panel/api/telekom-data/:id', requireAuth, requirePermission('data_management','delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: existingRows } = await query(
      'SELECT id, created_by FROM public.telekom_data WHERE id = $1',
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const existing = existingRows[0];
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const isAdmin = isAdminRoleList(roleRows);
    if (!isAdmin && existing.created_by !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await query('DELETE FROM public.telekom_data WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Delete telekom data failed', e);
    res.status(500).json({ error: 'Failed to delete telekom data' });
  }
});

// User
app.get('/panel/api/user/profile', requireAuth, getProfile);

// DevSecOps Monitoring
app.get('/panel/api/devsecops/security-metrics', requireAuth, getSecurityMetrics);
app.get('/panel/api/devsecops/api-metrics', requireAuth, getAPIMetrics);
app.post('/panel/api/devsecops/log-activity', requireAuth, logActivity);
app.post('/panel/api/devsecops/log-api-call', requireAuth, logAPICall);
app.get('/panel/api/devsecops/audit-logs', requireAuth, getAuditLogs);
app.post('/panel/api/devsecops/audit-logs', requireAuth, createAuditLog);

// ---- API Integration Testing (migrated from Supabase Edge Function) ----
// POST /api/integrations/test
// Body accepts either:
//  A) { data: { endpoint, method, parameters }, apiName?, timeout? }
//  B) { endpoint, method, parameters, apiName?, timeout? }
// Security: only allow absolute http(s) URLs to allowed hostnames (env: API_TEST_ALLOWED_HOSTS)
// Logging: writes to public.api_integration_logs and public.activity_logs
app.post('/panel/api/integrations/test', requireAuth, async (req, res) => {
  try {
    const raw = req.body || {};
    const data = (raw && typeof raw.data === 'object') ? raw.data : raw;

    const apiName = (raw.apiName || data.apiName || 'default-api');
    const method = String(data.method || 'GET').toUpperCase();
    const endpoint = String(data.endpoint || '').trim();
    let parameters = data.parameters;

    const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!ALLOWED_METHODS.includes(method)) {
      return res.status(400).json({ success: false, error: `Method not allowed. Allowed: ${ALLOWED_METHODS.join(', ')}` });
    }

    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'endpoint is required' });
    }

    // Ensure parameters is an object; if not, coerce to empty object for safety
    if (parameters == null || typeof parameters !== 'object') {
      parameters = {};
    }

    // Must be an absolute URL (prevent SSRF to internal addresses via relative paths)
    let urlObj;
    try {
      urlObj = new URL(endpoint);
    } catch {
      return res.status(400).json({ success: false, error: 'Endpoint must be a valid absolute URL (http/https)' });
    }

    if (!/^https?:$/.test(urlObj.protocol)) {
      return res.status(400).json({ success: false, error: 'Only http/https protocols are allowed' });
    }

    // Host allowlist
    const envHosts = (process.env.API_TEST_ALLOWED_HOSTS || '')
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(Boolean);
    // Defaults include local dev hosts to simplify testing
    const defaultHosts = ['localhost', '127.0.0.1', 'httpbin.org', 'api.github.com'];
    const allowedHosts = envHosts.length ? envHosts : defaultHosts;

    const hostname = urlObj.hostname.toLowerCase();
    if (!allowedHosts.includes(hostname)) {
      return res.status(403).json({
        success: false,
        error: `Host not allowed. Allowed hosts: ${allowedHosts.join(', ')}`
      });
    }

    // Timeout handling
    const timeoutRaw = raw.timeout ?? data.timeout;
    const timeoutMs = Math.min(Math.max(parseInt(timeoutRaw) || 3000, 1000), 60000);
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

    // Build request
    const requestInit = {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      signal: abortController.signal,
    };

    // Forward Authorization header ONLY for local targets (localhost/127.0.0.1)
    const incomingAuth = req.get('Authorization');
    const shouldForwardAuth = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (incomingAuth && shouldForwardAuth) {
      requestInit.headers.Authorization = incomingAuth;
    }

    // For GET/DELETE, move parameters into querystring
    if (method === 'GET' || method === 'DELETE') {
      const search = new URLSearchParams(urlObj.search);
      try {
        Object.entries(parameters || {}).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (Array.isArray(v)) {
            v.forEach(item => {
              search.append(k, typeof item === 'object' ? JSON.stringify(item) : String(item));
            });
          } else if (typeof v === 'object') {
            search.set(k, JSON.stringify(v));
          } else {
            search.set(k, String(v));
          }
        });
      } catch {
        // ignore query building errors, proceed with original URL
      }
      const qs = search.toString();
      urlObj.search = qs ? `?${qs}` : '';
    } else {
      // For POST/PUT, send parameters as JSON body
      try {
        requestInit.body = JSON.stringify(parameters || {});
      } catch {
        requestInit.body = JSON.stringify({});
      }
    }

    const startedAt = Date.now();

    let success = false;
    let responsePayload = null;
    let errorMessage = null;

    try {
      const resp = await fetch(urlObj.toString(), requestInit);
      const contentType = resp.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          responsePayload = await resp.json();
        } catch {
          // Fallback to text if JSON parse failed
          responsePayload = { contentType, text: await resp.text() };
        }
      } else {
        responsePayload = { contentType, text: await resp.text() };
      }

      success = resp.ok;
      if (!resp.ok) {
        errorMessage = `HTTP ${resp.status}`;
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
        errorMessage = `Request timed out after ${timeoutMs}ms`;
      } else {
        errorMessage = err instanceof Error ? err.message : 'Request failed';
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTimeMs = Date.now() - startedAt;

    // Server-side logging to api_integration_logs
    try {
      await query(
        `INSERT INTO public.api_integration_logs
           (user_id, api_name, status, request_data, response_data, response_time_ms, error_message, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())`,
        [
          req.user?.sub || null,
          apiName,
          success ? 'success' : 'error',
          JSON.stringify({ endpoint, method, parameters }),
          JSON.stringify(responsePayload ?? {}),
          responseTimeMs,
          errorMessage,
        ]
      );
    } catch (e) {
      console.error('Failed to write api_integration_logs:', e?.message || e);
    }

    // Activity log for audit trail
    try {
      await query(
        `INSERT INTO public.activity_logs
           (user_id, action, resource_type, resource_id, details, created_at)
         VALUES ($1, $2, $3, $4, $5, now())`,
        [
          req.user?.sub || null,
          'api_integration_test',
          'integration',
          null,
          JSON.stringify({
            api_name: apiName,
            endpoint,
            method,
            success,
            response_time_ms: responseTimeMs,
            error: errorMessage,
          }),
        ]
      );
    } catch (e) {
      console.error('Failed to write activity_logs:', e?.message || e);
    }

    // Unified response for client
    const result = {
      success,
      data: responsePayload,
      error: errorMessage || undefined,
      apiName,
      timestamp: new Date().toISOString(),
    };

    // Return 200 regardless, client uses "success" flag to render state
    return res.json(result);
  } catch (e) {
    console.error('Error in /api/integrations/test:', e);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});
// Roles & Permissions
// List roles for a user
app.get('/panel/api/roles', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    res.json({ roles: rows.map(r => r.role) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load roles' });
  }
});

// List all users with their roles (admin only)
app.get('/panel/api/admin/users', requireAuth, requirePermission('user_management','read'), async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const userRoles = roleRows.map(r => r.role);
    if (
      !userRoles.includes('super_admin') &&
      !userRoles.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const sql = `SELECT p.id, p.user_id, p.full_name, p.company_name, p.phone, p.is_validated, p.created_at
                 FROM public.profiles p ORDER BY p.created_at DESC LIMIT 1000`;
    const { rows: profiles } = await query(sql);
    const { rows: roles } = await query(
      'SELECT user_id, role FROM public.user_roles'
    );
    const grouped = profiles.map(p => ({
      ...p,
      roles: roles.filter(r => r.user_id === p.user_id).map(r => r.role),
    }));
    res.json({ users: grouped });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// Pending validations count (admin only)
app.get('/panel/api/admin/users/pending-count', requireAuth, async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const roles = roleRows.map(r => r.role);
    const isAdmin =
      roles.includes('super_admin') || roles.includes('internal_admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { rows } = await query(
      `SELECT COUNT(*)::int AS count
         FROM public.profiles
        WHERE is_validated IS NOT TRUE`
    );

    res.json({ pending: rows[0]?.count ?? 0 });
  } catch (e) {
    console.error('Failed to fetch pending validations count', e);
    res.status(500).json({ error: 'Failed to fetch pending validations count', pending: 0 });
  }
});
// Assign role to user (admin) — enforce SINGLE role (replace existing)
app.post('/panel/api/admin/users/:userId/roles', requireAuth, requirePermission('user_management','update'), async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    if (!role) return res.status(400).json({ error: 'role required' });

    // authorize
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // replace: delete all current roles then insert new single role
    await query('BEGIN');
    await query('DELETE FROM public.user_roles WHERE user_id = $1', [userId]);
    await query(
      'INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES (gen_random_uuid(), $1, $2, now())',
      [userId, role]
    );
    await query('COMMIT');

    res.json({ success: true });
  } catch (e) {
    try {
      await query('ROLLBACK');
    } catch {}
    console.error(e);
    res.status(500).json({ error: 'Failed to assign role' });
  }
});

// Remove role from user (admin) — ensure at least 'guest' remains
app.delete(
  '/panel/api/admin/users/:userId/roles/:role',
  requireAuth, requirePermission('user_management','update'),
  async (req, res) => {
    try {
      const { userId, role } = req.params;

      // authorize
      const { rows: roleRows } = await query(
        'SELECT role FROM public.user_roles WHERE user_id = $1',
        [req.user.sub]
      );
      const current = roleRows.map(r => r.role);
      if (
        !current.includes('super_admin') &&
        !current.includes('internal_admin')
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await query('BEGIN');
      await query(
        'DELETE FROM public.user_roles WHERE user_id = $1 AND role = $2',
        [userId, role]
      );

      // Ensure user has at least one role; if none, set to 'guest'
      const { rows: left } = await query(
        'SELECT COUNT(*)::int AS cnt FROM public.user_roles WHERE user_id = $1',
        [userId]
      );
      const cnt = left[0]?.cnt ?? 0;
      if (cnt === 0) {
        await query(
          'INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES (gen_random_uuid(), $1, $2, now())',
          [userId, 'guest']
        );
      }
      await query('COMMIT');

      res.json({ success: true });
    } catch (e) {
      try {
        await query('ROLLBACK');
      } catch {}
      console.error(e);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  }
);

// Module & field permissions listing
app.get('/panel/api/admin/permissions', requireAuth, requirePermission('user_management','read'), async (req, res) => {
  try {
    const { role } = req.query; // optional filter by role
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    let sql = `SELECT id, role, module_id, field_id, can_create, can_read, can_update, can_delete, field_access FROM public.permissions`;
    const params = [];
    if (role) {
      sql += ' WHERE role = $1';
      params.push(role);
    }
    const { rows } = await query(sql, params);
    res.json({ permissions: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load permissions' });
  }
});

// Upsert permissions (bulk)
app.post('/panel/api/admin/permissions/bulk', requireAuth, requirePermission('user_management','update'), async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { modulePermissions = [], fieldPermissions = [] } = req.body || {};

    // Defensive normalization & dedupe
    const normBool = v => v === true;
    const seenModuleKeys = new Set();
    const seenFieldKeys = new Set();

    const normalizedModules = [];
    for (const mp of modulePermissions) {
      if (!mp || !mp.role || !mp.module_id) continue;
      const key = `${mp.role}::${mp.module_id}`;
      if (seenModuleKeys.has(key)) continue; // drop duplicate in payload
      seenModuleKeys.add(key);
      normalizedModules.push({
        role: mp.role,
        module_id: mp.module_id,
        can_create: normBool(mp.can_create),
        can_read: normBool(mp.can_read),
        can_update: normBool(mp.can_update),
        can_delete: normBool(mp.can_delete),
      });
    }

    const normalizedFields = [];
    for (const fp of fieldPermissions) {
      if (!fp || !fp.role || !fp.module_id || !fp.field_id) continue;
      const key = `${fp.role}::${fp.module_id}::${fp.field_id}`;
      if (seenFieldKeys.has(key)) continue;
      seenFieldKeys.add(key);
      normalizedFields.push({
        role: fp.role,
        module_id: fp.module_id,
        field_id: fp.field_id,
        field_access: fp.field_access || 'read_only',
        can_create: normBool(fp.can_create),
        can_read: normBool(fp.can_read),
        can_update: normBool(fp.can_update),
        can_delete: normBool(fp.can_delete),
      });
    }

    // Manual upsert without requiring additional unique partial indexes.
    // Rationale:
    //   Existing unique constraint is only (role, module_id, field_id).
    //   We treat module-level (field_id NULL) as a separate logical entity.
    // Algorithm for module-level:
    //   1. UPDATE ... WHERE role=? AND module_id=? AND field_id IS NULL
    //   2. If rowCount === 0 -> INSERT new row with field_id NULL
    // For field-level (has field_id): we can attempt UPDATE first then INSERT, avoiding reliance on ON CONFLICT (role, field_id)/(role,module_id) which don't exist.

    await query('BEGIN');

    // Module-level upserts
    for (const mp of normalizedModules) {
      try {
        const upd = await query(
          `UPDATE public.permissions
             SET can_create=$3, can_read=$4, can_update=$5, can_delete=$6, updated_at=now()
           WHERE role=$1 AND module_id=$2 AND field_id IS NULL`,
          [
            mp.role,
            mp.module_id,
            mp.can_create,
            mp.can_read,
            mp.can_update,
            mp.can_delete,
          ]
        );
        if (upd.rowCount === 0) {
          await query(
            `INSERT INTO public.permissions
               (id, role, module_id, field_id, can_create, can_read, can_update, can_delete, field_access, created_at, updated_at)
             VALUES (gen_random_uuid(), $1,$2, NULL,$3,$4,$5,$6,'read_only', now(), now())`,
            [
              mp.role,
              mp.module_id,
              mp.can_create,
              mp.can_read,
              mp.can_update,
              mp.can_delete,
            ]
          );
        }
      } catch (err) {
        console.error('[permissions.bulk][module] failed', {
          module: mp.module_id,
          role: mp.role,
          err: err.code,
          detail: err.detail,
        });
        throw err;
      }
    }

    // Field-level upserts
    for (const fp of normalizedFields) {
      try {
        const upd = await query(
          `UPDATE public.permissions
             SET field_access=$4, can_create=$5, can_read=$6, can_update=$7, can_delete=$8, updated_at=now()
           WHERE role=$1 AND module_id=$2 AND field_id=$3`,
          [
            fp.role,
            fp.module_id,
            fp.field_id,
            fp.field_access,
            fp.can_create,
            fp.can_read,
            fp.can_update,
            fp.can_delete,
          ]
        );
        if (upd.rowCount === 0) {
          await query(
            `INSERT INTO public.permissions
               (id, role, module_id, field_id, field_access, can_create, can_read, can_update, can_delete, created_at, updated_at)
             VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8, now(), now())`,
            [
              fp.role,
              fp.module_id,
              fp.field_id,
              fp.field_access,
              fp.can_create,
              fp.can_read,
              fp.can_update,
              fp.can_delete,
            ]
          );
        }
      } catch (err) {
        console.error('[permissions.bulk][field] failed', {
          field: fp.field_id,
          module: fp.module_id,
          role: fp.role,
          err: err.code,
          detail: err.detail,
        });
        throw err;
      }
    }

    await query('COMMIT');
    res.json({
      success: true,
      counts: {
        modules: normalizedModules.length,
        fields: normalizedFields.length,
      },
    });
  } catch (e) {
    console.error(e);
    await query('ROLLBACK');
    res.status(500).json({ error: 'Failed to save permissions' });
  }
});

// Current user effective permissions (for client consumption)
app.get('/panel/api/permissions/effective', requireAuth, async (req, res) => {
  try {
    const sql = `SELECT p.role, p.module_id, p.field_id, p.can_create, p.can_read, p.can_update, p.can_delete, p.field_access,
                        m.code as module_code, m.name as module_name, f.code as field_code, f.name as field_name
                 FROM public.permissions p
                 LEFT JOIN public.modules m ON m.id = p.module_id
                 LEFT JOIN public.fields f ON f.id = p.field_id
                 WHERE p.role IN (SELECT role FROM public.user_roles WHERE user_id = $1)`;
    const { rows } = await query(sql, [req.user.sub]);
    res.json({ permissions: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load user permissions' });
  }
});

// ---- Additional Admin Metadata & User Management Endpoints ----
// List active modules
app.get('/panel/api/admin/metadata/modules', requireAuth, async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { rows } = await query(
      'SELECT id, name, code, description FROM public.modules WHERE is_active = true ORDER BY name'
    );
    res.json({ modules: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load modules' });
  }
});

// List active fields
app.get('/panel/api/admin/metadata/fields', requireAuth, requirePermission('user_management','read'), async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { rows } = await query(
      'SELECT id, name, code, field_type, is_system_field, module_id FROM public.fields WHERE is_active = true ORDER BY name'
    );
    res.json({ fields: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load fields' });
  }
});

// Update user profile
app.patch('/panel/api/admin/users/:userId/profile', requireAuth, requirePermission('user_management','update'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, company_name, phone } = req.body;
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await query(
      'UPDATE public.profiles SET full_name=$2, company_name=$3, phone=$4, updated_at = now() WHERE user_id=$1',
      [userId, full_name, company_name, phone]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Toggle validation status
app.patch(
  '/panel/api/admin/users/:userId/validation',
  requireAuth, requirePermission('user_management','update'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { is_validated } = req.body;
      const { rows: roleRows } = await query(
        'SELECT role FROM public.user_roles WHERE user_id = $1',
        [req.user.sub]
      );
      const current = roleRows.map(r => r.role);
      if (
        !current.includes('super_admin') &&
        !current.includes('internal_admin')
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await query(
        'UPDATE public.profiles SET is_validated=$2, updated_at = now() WHERE user_id=$1',
        [userId, !!is_validated]
      );
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update validation' });
    }
  }
);

// Delete user (hard delete)
app.delete('/panel/api/admin/users/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is trying to delete themselves
    if (userId === req.user.sub) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const current = roleRows.map(r => r.role);
    if (
      !current.includes('super_admin') &&
      !current.includes('internal_admin')
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log(`Attempting to delete user: ${userId}`);

    // Start transaction
    await query('BEGIN');

    try {
      // Check if user exists first
      const { rows: userCheck } = await query(
        'SELECT id FROM auth.users WHERE id=$1',
        [userId]
      );
      if (userCheck.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete from dependent tables first to avoid foreign key constraint violations
      console.log('Deleting from activity_logs...');
      const activityResult = await query(
        'DELETE FROM public.activity_logs WHERE user_id=$1',
        [userId]
      );
      console.log(`Deleted ${activityResult.rowCount} activity logs`);

      console.log('Deleting from audit_logs...');
      const auditResult = await query(
        'DELETE FROM public.audit_logs WHERE user_id=$1',
        [userId]
      );
      console.log(`Deleted ${auditResult.rowCount} audit logs`);

      console.log('Deleting from tickets...');
      const ticketResult = await query(
        'DELETE FROM public.tickets WHERE user_id=$1',
        [userId]
      );
      console.log(`Deleted ${ticketResult.rowCount} tickets`);

      console.log('Deleting from telekom_data...');
      const telekomResult = await query(
        'DELETE FROM public.telekom_data WHERE created_by=$1',
        [userId]
      );
      console.log(`Deleted ${telekomResult.rowCount} telekom data records`);

      console.log('Deleting from user_roles...');
      const rolesResult = await query(
        'DELETE FROM public.user_roles WHERE user_id=$1',
        [userId]
      );
      console.log(`Deleted ${rolesResult.rowCount} user roles`);

      console.log('Deleting from profiles...');
      const profileResult = await query(
        'DELETE FROM public.profiles WHERE user_id=$1',
        [userId]
      );
      console.log(`Deleted ${profileResult.rowCount} profiles`);

      console.log('Deleting from auth.users...');
      const userResult = await query('DELETE FROM auth.users WHERE id=$1', [
        userId,
      ]);
      console.log(`Deleted ${userResult.rowCount} users`);

      // Commit transaction
      await query('COMMIT');
      console.log(`Successfully deleted user: ${userId}`);
      res.json({ success: true });
    } catch (deleteError) {
      console.error('Delete operation failed:', deleteError);
      await query('ROLLBACK');
      throw deleteError;
    }
  } catch (e) {
    console.error('Error deleting user:', e);
    res
      .status(500)
      .json({ error: 'Failed to delete user', details: e.message });
  }
});

// Support ticket stats endpoint
app.get('/panel/api/tickets/stats', requireAuth, async (req, res) => {
  try {
    const { rows: roleRows } = await query(
      'SELECT role FROM public.user_roles WHERE user_id = $1',
      [req.user.sub]
    );
    const roles = roleRows.map(r => r.role);
    const isAdmin =
      roles.includes('super_admin') ||
      roles.includes('internal_admin') ||
      roles.includes('pengolah_data');

    // Total active tickets (open or in_progress)
    let totalSql = `SELECT COUNT(*)::int AS count FROM public.tickets WHERE status IN ('open','in_progress')`;
    let totalParams = [];
    if (!isAdmin) {
      totalSql += ' AND user_id = $1';
      totalParams.push(req.user.sub);
    }
    const totalRes = await query(totalSql, totalParams);
    const total = totalRes.rows[0]?.count ?? 0;

    // High priority active tickets
    let highSql = `SELECT COUNT(*)::int AS count FROM public.tickets WHERE priority IN ('high','urgent') AND status IN ('open','in_progress')`;
    let highParams = [];
    if (!isAdmin) {
      highSql += ' AND user_id = $1';
      highParams.push(req.user.sub);
    }
    const highRes = await query(highSql, highParams);
    const highPriority = highRes.rows[0]?.count ?? 0;

    // Unread messages for this actor
    let unreadSql = '';
    let unreadParams = [];
    if (isAdmin) {
      unreadSql = `
        SELECT COUNT(*)::int AS count
        FROM public.ticket_messages tm
        WHERE tm.is_admin_message = false
          AND tm.is_read = false
      `;
    } else {
      unreadSql = `
        SELECT COUNT(*)::int AS count
        FROM public.ticket_messages tm
        JOIN public.tickets t ON t.id = tm.ticket_id
        WHERE tm.is_admin_message = true
          AND tm.is_read = false
          AND t.user_id = $1
      `;
      unreadParams = [req.user.sub];
    }
    const unreadRes = await query(unreadSql, unreadParams);
    const unread = unreadRes.rows[0]?.count ?? 0;

    res.json({
      counts: {
        unread,
        highPriority,
        total,
        userTickets: isAdmin ? 0 : unread,
        adminTickets: isAdmin ? unread : 0,
      },
    });
 } catch (e) {
    console.error('Failed to compute ticket stats', e);
    res.status(500).json({
      error: 'Failed to compute ticket stats',
      counts: {
        unread: 0,
        highPriority: 0,
        total: 0,
        userTickets: 0,
        adminTickets: 0,
      },
    });
  }
});

// System status endpoint
app.get('/panel/api/system/status', requireAuth, async (_req, res) => {
  try {
    let dbStatus = 'ok';
    let latencyMs = null;
    try {
      const t0 = Date.now();
      await query('SELECT 1');
      latencyMs = Date.now() - t0;
      if (latencyMs < 200) dbStatus = 'ok';
      else if (latencyMs < 1000) dbStatus = 'degraded';
      else dbStatus = 'down';
    } catch (e) {
      dbStatus = 'down';
    }

    // Try to get last backup time from audit_logs if available
    let lastBackupAt = null;
    try {
      const { rows } = await query(
        `SELECT MAX(created_at) AS last_backup_at
         FROM public.audit_logs
         WHERE action ILIKE '%backup%'`
      );
      lastBackupAt = rows[0]?.last_backup_at || null;
    } catch {}

    const uptimeSec = Math.floor(process.uptime());
    const mem = process.memoryUsage();

    res.json({
      api: {
        status: 'ok',
        uptimeSec,
        memory: {
          rss: mem.rss,
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
        },
      },
      db: {
        status: dbStatus,
        latencyMs,
      },
      lastBackupAt,
    });
  } catch (e) {
    console.error('Failed to compute system status', e);
    res.status(500).json({
      api: { status: 'down', uptimeSec: Math.floor(process.uptime()) },
      db: { status: 'down', latencyMs: null },
      lastBackupAt: null,
      error: 'Failed to compute system status',
    });
  }
});
const PORT = process.env.PORT || 4000;
const server = createServer(app);
attachWebSocket(server);
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
