/**
 * Three Dimensions Backend Configuration
 * 
 * This file centralizes all server configuration settings for easy management.
 * 
 * HOW TO UPDATE SETTINGS:
 * -----------------------
 * 1. For sensitive data (passwords, keys): Use environment variables via .env file
 * 2. For non-sensitive defaults: Modify the values in this file directly
 * 
 * IMPORTANT SETTINGS:
 * - ADMIN_PASSWORD: Change this in .env file (ADMIN_PASSWORD=your-secure-password)
 * - SMTP credentials: Set via .env file for security
 * - ALLOWED_ORIGINS: Add your domains to .env (comma-separated)
 * 
 * @see .env.example for all available environment variables
 */

require('dotenv').config();

/**
 * Server Configuration
 * --------------------
 * Basic server settings including port and environment
 */
const server = {
  // Server port - override with PORT environment variable
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Environment mode: 'development' or 'production'
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Request body size limit for security
  bodyLimit: '10kb'
};

/**
 * CORS Configuration
 * ------------------
 * Controls which domains can access the API
 * 
 * TO ADD NEW DOMAINS:
 * Set ALLOWED_ORIGINS in .env file as comma-separated list:
 * ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
 */
const cors = {
  // Allowed origins for CORS requests
  // Default: localhost for development
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  
  // Allowed HTTP methods (includes DELETE for admin panel)
  allowedMethods: 'POST, GET, DELETE, OPTIONS',
  
  // Allowed request headers
  allowedHeaders: 'Content-Type, Authorization'
};

/**
 * Rate Limiting Configuration
 * ---------------------------
 * Prevents spam and abuse by limiting requests per IP
 */
const rateLimit = {
  // Time window in milliseconds (1 hour)
  windowMs: 60 * 60 * 1000,
  
  // Maximum requests per window per IP
  maxRequests: 5,
  
  // Error message when limit exceeded (German)
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut.'
  }
};

/**
 * SMTP Email Configuration
 * ------------------------
 * Email server settings for notifications and auto-responses
 * 
 * TO CONFIGURE SMTP:
 * Set these values in your .env file:
 * - SMTP_HOST: Your email provider's SMTP server
 * - SMTP_PORT: Usually 587 (TLS) or 465 (SSL)
 * - SMTP_SECURE: 'true' for port 465, 'false' for port 587
 * - SMTP_USER: Your email address
 * - SMTP_PASS: Your email password or app password
 * - SMTP_FROM: Sender email address for outgoing mail
 * 
 * SECURITY TIP: Use app-specific passwords instead of your main password
 */
const smtp = {
  // SMTP server hostname
  host: process.env.SMTP_HOST || '',
  
  // SMTP server port (587 for TLS, 465 for SSL)
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  
  // Use SSL/TLS (set to true for port 465)
  secure: process.env.SMTP_SECURE === 'true',
  
  // SMTP authentication credentials
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  
  // Sender email address for outgoing mail
  fromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@three-dimensions.de',
  
  // Recipient for admin notifications
  notificationEmail: process.env.NOTIFICATION_EMAIL || 'kontakt@three-dimensions.de',
  
  // Check if SMTP is properly configured
  isConfigured: function() {
    return !!(this.host && this.auth.user && this.auth.pass);
  }
};

/**
 * Email Feature Flags
 * -------------------
 * Control email-related features
 */
const emailFeatures = {
  // Send automatic confirmation email to customers
  // Set SEND_AUTO_RESPONSE=true in .env to enable
  sendAutoResponse: process.env.SEND_AUTO_RESPONSE === 'true'
};

/**
 * Security Configuration
 * ----------------------
 * Encryption keys and security-related settings
 * 
 * IMPORTANT: Generate secure keys for production!
 * Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
const security = {
  // Encryption key for data storage (minimum 32 characters)
  // CRITICAL: Set ENCRYPTION_KEY in .env for production!
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  
  // Salt for hashing IP addresses (GDPR compliance)
  ipHashSalt: process.env.IP_HASH_SALT || 'three-dimensions-default-salt'
};

/**
 * Data Storage Configuration
 * --------------------------
 * Settings for data retention and storage location
 */
const dataStorage = {
  // Directory for storing encrypted submission data
  // Default: ./data (relative to backend folder)
  dataDir: process.env.DATA_DIR || './data',
  
  // Data retention period in days (GDPR: 6 months max recommended)
  retentionDays: parseInt(process.env.RETENTION_DAYS, 10) || 180,
  
  // Encryption algorithm for stored data
  encryptionAlgorithm: 'aes-256-gcm'
};

/**
 * Admin Panel Configuration
 * -------------------------
 * Settings for the admin dashboard at /admin
 * 
 * TO SET ADMIN PASSWORD:
 * 1. Set ADMIN_PASSWORD in your .env file with your desired password
 * 2. The password will be hashed automatically on first use
 * 3. To change password, update ADMIN_PASSWORD in .env and restart server
 * 
 * SECURITY NOTE: The password is stored hashed (bcrypt) for security.
 * Never commit plaintext passwords to source control.
 */
const admin = {
  // Admin password - SET THIS IN .env FILE!
  // ADMIN_PASSWORD=your-secure-admin-password
  // TEMPORARY TEST PASSWORD: ThreeD2026! (change this in production!)
  password: process.env.ADMIN_PASSWORD || 'ThreeD2026!',
  
  // Session timeout in milliseconds (1 hour)
  sessionTimeout: 60 * 60 * 1000,
  
  // Token secret for admin sessions
  // Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  tokenSecret: process.env.ADMIN_TOKEN_SECRET || process.env.ENCRYPTION_KEY || 'admin-token-secret-change-in-production'
};

/**
 * Content Security Policy Configuration
 * -------------------------------------
 * Controls which resources can be loaded by browsers
 * 
 * NOTE: The HTML pages use inline event handlers (onclick) and external resources,
 * so we need permissive settings for:
 * - 'unsafe-inline' for scripts (inline event handlers)
 * - External image sources for QR code generation
 * - External script sources for model-viewer library
 * - External connect sources for API calls
 */
const csp = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net", "blob:"],
    scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick, etc.)
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    imgSrc: ["'self'", "data:", "blob:", "https://api.qrserver.com", "https:"],
    connectSrc: ["'self'", "https://unpkg.com", "https://cdn.jsdelivr.net", "blob:", "data:"],
    mediaSrc: ["'self'", "blob:", "data:"],
    workerSrc: ["'self'", "blob:"],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

// Export all configuration modules
module.exports = {
  server,
  cors,
  rateLimit,
  smtp,
  emailFeatures,
  security,
  dataStorage,
  admin,
  csp
};
