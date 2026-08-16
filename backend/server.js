const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

dotenv.config({ path: path.join(__dirname, '.env') });

const nodeMajor = parseInt(process.versions.node.split('.')[0]);
if (nodeMajor < 18) {
  console.error(`FATAL: Node.js 18+ required. You have ${process.versions.node}`);
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION (server continues running):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION (server continues running):', reason);
});

const required = ['MONGODB_URI', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('WARNING: Missing .env variables:', missing.join(', '));
}

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

app.get('/ping', (req, res) => res.json({ pong: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.versions.node,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    firebaseInit: require('firebase-admin').apps.length > 0,
    geminiKeyPrefix: (process.env.GEMINI_API_KEY || 'MISSING').slice(0, 8),
    openrouterKeyPresent: !!process.env.OPENROUTER_API_KEY
  });
});

const sessionRoutes = require('./src/routes/session.routes');
const reportRoutes = require('./src/routes/report.routes');
const userRoutes = require('./src/routes/user.routes');
const errorHandler = require('./src/middleware/errorHandler');

app.use('/api/sessions', sessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB failed:', err.message));

const server = http.createServer(app);
server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('✓ Server on http://localhost:' + PORT);
  console.log('✓ Health: http://localhost:' + PORT + '/health');
});
