/**
 * Three Dimensions Backend Server
 * 
 * Handles contact form submissions with:
 * - Secure data storage (encrypted, 6-month max retention)
 * - Email notifications for new inquiries
 * - GDPR/DSGVO compliance
 * - Rate limiting to prevent spam
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const contactRoutes = require('./routes/contact');
const dataManagement = require('./services/dataManagement');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Parse JSON bodies
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000']; // TEMPORARY DEV MILO
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate limiting - 5 submissions per hour per IP (GDPR-friendly)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to contact endpoint
app.use('/api/contact', contactLimiter);

// Routes
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from parent directory (the website)
app.use(express.static(path.join(__dirname, '..')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint nicht gefunden.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Ein Serverfehler ist aufgetreten.' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Three Dimensions Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Run data cleanup on startup
  dataManagement.cleanupExpiredData();
  
  // Schedule daily cleanup of expired data (6-month retention policy)
  setInterval(() => {
    dataManagement.cleanupExpiredData();
  }, 24 * 60 * 60 * 1000); // Run daily
});

module.exports = app;
