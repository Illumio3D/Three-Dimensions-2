/**
 * Three Dimensions Backend Server
 * 
 * Handles contact form submissions with:
 * - Secure data storage (encrypted, 6-month max retention)
 * - Email notifications for new inquiries
 * - GDPR/DSGVO compliance
 * - Rate limiting to prevent spam
 * - Admin panel for viewing submissions
 * 
 * CONFIGURATION:
 * All server settings are centralized in config.js
 * Sensitive data should be set via .env file
 * @see config.js for all available configuration options
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const dataManagement = require('./services/dataManagement');

const app = express();
const PORT = config.server.port;

// Security middleware
// Configure helmet with CSP that allows inline scripts for the static HTML pages.
// Note: 'unsafe-inline' for scripts is a security trade-off required for inline
// event handlers and scripts in the static HTML files. For improved security,
// consider migrating to external scripts and using CSP nonces in future iterations.
// 
// IMPORTANT: Cross-Origin-Resource-Policy is set to 'cross-origin' to allow
// the model-viewer web component to load 3D model files (GLB/USDZ). Without this,
// the browser blocks the model files from loading in the AR viewer.
app.use(helmet({
  contentSecurityPolicy: {
    directives: config.csp.directives
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Parse JSON bodies
app.use(express.json({ limit: config.server.bodyLimit }));

// CORS configuration - uses settings from config.js
// To add/modify allowed domains, update ALLOWED_ORIGINS in .env file
// In development mode, automatically allows local network IPs for mobile testing
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed using the isOriginAllowed function
  if (config.cors.isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', config.cors.allowedMethods);
  res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders);
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate limiting - uses settings from config.js
// Prevents spam by limiting requests per IP
const contactLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: config.rateLimit.message,
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to contact endpoint
app.use('/api/contact', contactLimiter);

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clean URL routing - serves HTML pages without .html extension
// Maps friendly names to actual HTML files
const urlMappings = {
  '/home': '/index.html',
  '/kontakt': '/Three-Dimensions-Anfrageformular.html',
  '/ueber-mich': '/Ueber-Mich.html',
  '/datenschutz': '/Datenschutz.html',
  '/impressum': '/Impressum.html',
  '/admin': '/admin.html',
  '/ar-produktvisualisierung': '/ar-produktvisualisierung.html',
  '/details-durch-3d': '/Details-durch-3D.html',
  '/3d-renderings-fuer-shops': '/3D-Renderings-fuer-Shops.html',
  '/interaktives-ar-umfeld': '/Interaktives-AR-Umfeld.html'
};

// Handle clean URLs - redirect to actual HTML files
app.use((req, res, next) => {
  const cleanPath = req.path.toLowerCase();
  
  // Check if this is a clean URL that needs mapping
  if (urlMappings[cleanPath]) {
    return res.sendFile(path.join(__dirname, '..', urlMappings[cleanPath]));
  }
  
  // Also handle URLs without leading slash variations
  next();
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
// Bind to 0.0.0.0 to allow access from other devices on the network
// This enables mobile device testing via local IP (e.g., http://192.168.x.x:3000)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Three Dimensions Backend running on port ${PORT}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Server accessible at:`);
  console.log(`  - Local: http://localhost:${PORT}`);
  console.log(`  - Network: http://<your-local-ip>:${PORT}`);
  console.log(`For mobile testing, use your computer's local IP address (e.g., http://192.168.1.100:${PORT})`);
  
  // Run data cleanup on startup
  dataManagement.cleanupExpiredData();
  
  // Schedule daily cleanup of expired data (6-month retention policy)
  setInterval(() => {
    dataManagement.cleanupExpiredData();
  }, 24 * 60 * 60 * 1000); // Run daily
});

module.exports = app;
