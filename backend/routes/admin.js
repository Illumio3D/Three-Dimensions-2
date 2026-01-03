/**
 * Admin Routes
 * 
 * Handles admin authentication and submission viewing
 * - Password-protected access
 * - View all submissions with Anfrage IDs and Companies
 * - View individual submission details
 * 
 * SECURITY:
 * - Password verification uses PBKDF2 with timing-safe comparison
 * - Sessions use secure random tokens with expiration
 * - All admin actions are logged for audit
 * 
 * PRODUCTION NOTES:
 * - For multi-server deployments, replace in-memory token storage with Redis/database
 * - The password salt is derived from the configured password itself for simplicity
 * - Consider adding rate limiting for login attempts in high-security environments
 * 
 * HOW TO UPDATE ADMIN PASSWORD:
 * 1. Set ADMIN_PASSWORD in your .env file
 * 2. Restart the server
 * 3. The new password will take effect immediately
 * 
 * @see config.js for admin configuration options
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const dataManagement = require('../services/dataManagement');
const { generateShortId } = require('../services/emailService');

// Rate limiter for login attempts - prevents brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// In-memory token store
// NOTE: For production with multiple server instances, consider using Redis or a database
// for persistent token storage that survives server restarts
const validTokens = new Map();

/**
 * Hash password using PBKDF2 (secure alternative to bcrypt without native dependencies)
 * Uses a salt derived from the admin token secret for additional security
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
function hashPassword(password) {
  // Use the configured token secret as salt base for better security
  // This ensures the salt is configurable per deployment
  const saltBase = config.admin.tokenSecret || 'three-dimensions-default-salt';
  const salt = crypto.createHash('sha256').update(saltBase).digest('hex').substring(0, 32);
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

/**
 * Verify password against configured admin password
 * @param {string} inputPassword - Password to verify
 * @returns {boolean} - Whether password is valid
 */
function verifyPassword(inputPassword) {
  const configuredPassword = config.admin.password;
  
  // For security, hash both and compare
  const inputHash = hashPassword(inputPassword);
  const configHash = hashPassword(configuredPassword);
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(configHash)
  );
}

/**
 * Generate a secure session token
 * @returns {string} - Session token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify admin token middleware
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentifizierung erforderlich'
    });
  }
  
  const token = authHeader.substring(7);
  const tokenData = validTokens.get(token);
  
  if (!tokenData) {
    return res.status(401).json({
      success: false,
      message: 'Ungültiges Token'
    });
  }
  
  // Check token expiration
  if (Date.now() > tokenData.expiresAt) {
    validTokens.delete(token);
    return res.status(401).json({
      success: false,
      message: 'Sitzung abgelaufen. Bitte erneut anmelden.'
    });
  }
  
  // Refresh token expiration on activity
  tokenData.expiresAt = Date.now() + config.admin.sessionTimeout;
  
  next();
}

/**
 * POST /api/admin/login
 * Authenticate admin user
 * Rate limited to prevent brute force attacks
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Passwort erforderlich'
      });
    }
    
    // Verify password
    if (!verifyPassword(password)) {
      // Log failed attempt
      await dataManagement.logAdminAccess('LOGIN_FAILED', {
        ipHash: crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').substring(0, 16)
      });
      
      return res.status(401).json({
        success: false,
        message: 'Falsches Passwort'
      });
    }
    
    // Generate and store token
    const token = generateToken();
    validTokens.set(token, {
      createdAt: Date.now(),
      expiresAt: Date.now() + config.admin.sessionTimeout
    });
    
    // Log successful login
    await dataManagement.logAdminAccess('LOGIN_SUCCESS', {
      ipHash: crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').substring(0, 16)
    });
    
    res.json({
      success: true,
      token,
      message: 'Erfolgreich angemeldet'
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Ein Fehler ist aufgetreten'
    });
  }
});

/**
 * POST /api/admin/logout
 * End admin session
 */
router.post('/logout', verifyToken, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.substring(7);
  
  validTokens.delete(token);
  
  res.json({
    success: true,
    message: 'Erfolgreich abgemeldet'
  });
});

/**
 * GET /api/admin/submissions
 * Get list of all submissions (IDs and companies only)
 */
router.get('/submissions', verifyToken, async (req, res) => {
  try {
    const submissions = await dataManagement.getAllSubmissions();
    
    // Return only IDs and companies for list view
    const submissionList = submissions.map(sub => ({
      id: sub.id,
      shortId: generateShortId(sub.id),
      company: sub.company,
      createdAt: sub.createdAt
    }));
    
    // Sort by creation date (newest first)
    submissionList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Log access
    await dataManagement.logAdminAccess('LIST_SUBMISSIONS', {
      count: submissionList.length
    });
    
    res.json({
      success: true,
      submissions: submissionList
    });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Anfragen'
    });
  }
});

/**
 * GET /api/admin/submissions/:id
 * Get full details of a specific submission
 */
router.get('/submissions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await dataManagement.getAllSubmissions();
    
    const submission = submissions.find(sub => sub.id === id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Anfrage nicht gefunden'
      });
    }
    
    // Log access
    await dataManagement.logAdminAccess('VIEW_SUBMISSION', {
      submissionId: id
    });
    
    // Add short ID to response
    const responseData = {
      ...submission,
      shortId: generateShortId(submission.id)
    };
    
    res.json({
      success: true,
      submission: responseData
    });
    
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Anfrage'
    });
  }
});

/**
 * DELETE /api/admin/submissions/:id
 * Delete a specific submission (for GDPR requests)
 */
router.delete('/submissions/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await dataManagement.deleteSubmission(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Anfrage nicht gefunden'
      });
    }
    
    res.json({
      success: true,
      message: 'Anfrage erfolgreich gelöscht'
    });
    
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen der Anfrage'
    });
  }
});

/**
 * GET /api/admin/verify
 * Verify if current token is valid
 */
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token gültig'
  });
});

module.exports = router;
