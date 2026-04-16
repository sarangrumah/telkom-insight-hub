import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
import registrationRoutes from './routes/registration.js';
import adminVerificationRoutes from './routes/adminVerification.js';
import certificateSubmissionRoutes from './routes/certificateSubmission.js';
import bpsRoutes from './routes/bps.js';

// Use routes
app.use('/v2/panel/api/auth', registrationRoutes);
app.use('/v2/panel/api/admin', adminVerificationRoutes);
app.use('/v2/panel/api/certificates', certificateSubmissionRoutes);
app.use('/v2/panel/api/bps', bpsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;