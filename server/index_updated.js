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
import kominfoSyncRoutes from './routes/kominfo-sync.js';
import backgroundJobService from './services/backgroundJobService.js';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean)) || ['http://localhost:5173', 'http://localhost:8080', 'https://dev-etelekomunikasi.komdigi.go.id'];
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));

// Register routes
app.use('/panel/api', skloRoutes);
app.use('/panel/api', telekomDataRoutes);
app.use('/panel/api', tariffRoutes);
app.use('/panel/api', kominfoSyncRoutes); // Kominfo sync routes
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Initialize background job service
backgroundJobService.initialize().catch(error => {
  console.error('Failed to initialize background job service:', error);
});

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
  windowMs: 15 * 60 * 100, // 15 minutes
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

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await backgroundJobService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await backgroundJobService.shutdown();
  process.exit(0);
});

// ... rest of the existing code continues here ...
// (Including all the existing routes, middleware, and server setup)

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

// ... continue with all other existing routes ...

const PORT = process.env.PORT || 4000;
const server = createServer(app);
attachWebSocket(server);
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});