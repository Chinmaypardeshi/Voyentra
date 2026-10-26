const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { isLive } = require('./config/voyentraDb');
const voyentraRoutes = require('./routes/voyentraRoutes');

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Voyentra Corporate Travel & Expense Management Routes
app.use('/api/voyentra', voyentraRoutes);

// Direct alias routes for cleaner frontend access
app.use('/api/travel', voyentraRoutes);
app.use('/api/approvals', voyentraRoutes);
app.use('/api/trips', voyentraRoutes);
app.use('/api/expenses', voyentraRoutes);
app.use('/api/policies', voyentraRoutes);
app.get('/api/stats', (req, res, next) => {
  const voyentraController = require('./controllers/voyentraController');
  voyentraController.getStats(req, res, next);
});

// Health & System Status Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    platform: 'Voyentra Corporate Travel, Expense & Spend Management Platform (SRS v1.0)',
    is_live_supabase: isLive(),
    database_target: 'Supabase Cloud (xzbmsbayggiazhwnlxri - ap-southeast-1)',
    schema: 'Voyentra Travel Core (13 Tables: organizations, profiles, departments, cost_centers, travel_policies, travel_requests, approvals, trips, bookings, payments, expenses, receipts)',
    message: isLive()
      ? 'Connected directly to live Voyentra Supabase Cloud PostgreSQL'
      : 'Running in high-fidelity Voyentra database engine (100% schema matched)',
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Build if present
const possibleDistPaths = [
  path.resolve(__dirname, '../../voyentra-frontend/dist'),
  path.resolve(process.cwd(), 'voyentra-frontend/dist'),
  path.resolve(__dirname, '../../../voyentra-frontend/dist'),
  path.resolve(__dirname, '../dist')
];

const frontendDist = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (frontendDist) {
  console.log(`[Voyentra Web] Serving production UI from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  console.warn(`[Voyentra Web] Frontend dist not found in searched paths:`, possibleDistPaths);
}

// Central JSON Error Handling Middleware (prevents HTML error pages on API endpoints)
app.use((err, req, res, next) => {
  console.error('[Voyentra API Error]:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal Server Error'
  });
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`Voyentra Corporate Travel & Expense API Server running on port ${port}`);
    console.log(`Supabase Status: ${isLive() ? 'LIVE CLOUD (xzbmsbayggiazhwnlxri)' : 'LOCAL ENGINE (Supabase Schema Matched)'}`);
    console.log(`Health Check: http://localhost:${port}/api/health`);
    console.log(`Voyentra API: http://localhost:${port}/api/voyentra/meta`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, attempting port ${Number(port) + 1}...`);
      startServer(Number(port) + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
