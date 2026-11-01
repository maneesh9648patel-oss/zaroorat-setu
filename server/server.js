/**
 * ZarooratSetu - Combined Full-Stack Server
 * Serves both REST API (/api/*) and React Frontend Client (SPA)
 * HackFest 3.0 - Open Innovation / Civic Tech · Pilot: REC Banda
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import verifierRoutes from './routes/verifierRoutes.js';
import borrowRoutes from './routes/borrowRoutes.js';
import matchingRoutes from './routes/matchingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import offlineRoutes from './routes/offlineRoutes.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (configured for SPA serving)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General API Rate Limiting
app.use('/api/', apiRateLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    app: "ZarooratSetu Unified Full-Stack Server",
    version: "1.0.0",
    hackathon: "HackFest 3.0 (Open Innovation)",
    pilot: "REC Banda & nearby areas",
    time: new Date().toISOString()
  });
});

// Mount All Backend REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/offline', offlineRoutes);

// Serve Frontend Client Static Assets (from client/dist)
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Client-Side Routing (SPA): Return index.html for any non-API route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ Warning: client/dist not found at ${clientDistPath}. Run 'npm run build' in client.`);
  app.get('/', (req, res) => {
    res.send(`<h1>ZarooratSetu API Server</h1><p>Client build not found. Please build the client using 'npm run build' in /client.</p>`);
  });
}

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API Endpoint not found: ${req.method} ${req.url}`,
    code: "NOT_FOUND"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR"
  });
});

// Only listen if executed directly
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================================`);
  console.log(`🌿 ZarooratSetu Combined Full-Stack Website & API Running!`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`🔌 API Health:  http://localhost:${PORT}/api/health`);
  console.log(`📍 Pilot Area:  REC Banda & nearby areas (HackFest 3.0)`);
  console.log(`🔐 Phone OTP:   Mock Code 123456 (Demo mode active)`);
  console.log(`=============================================================`);
});

export default app;
