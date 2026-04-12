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

// Register telekom data routes
app.use('/v2/panel/api', skloRoutes);
app.use('/v2/panel/api', telekomDataRoutes);
app.use('/v2/panel/api', tariffRoutes);
app.use('/v2/panel/api', kominfoSyncRoutes); // Kominfo sync routes
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Initialize background job service
backgroundJobService.initialize().catch(error => {
  console.error('Failed to initialize background job service:', error);
});

// User profile (untuk kompatibilitas frontend apiClient.getProfile())
app.get('/v2/panel/api/user/profile', requireAuth, getProfile);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ... rest of the existing code continues here ...

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

const PORT = process.env.PORT || 4000;
const server = createServer(app);
attachWebSocket(server);
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});