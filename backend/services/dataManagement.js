/**
 * Data Management Service
 * 
 * Handles secure storage and management of form submissions
 * - Encrypted storage using AES-256-GCM
 * - Automatic deletion after 6 months (GDPR/DSGVO compliance)
 * - Audit logging for data access
 * 
 * CONFIGURATION:
 * Storage settings are centralized in config.js
 * @see config.js for data storage configuration options
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Configuration from config.js
const DATA_DIR = path.resolve(__dirname, '..', config.dataStorage.dataDir);
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.enc');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit.log');
const RETENTION_DAYS = config.dataStorage.retentionDays;
const ALGORITHM = config.dataStorage.encryptionAlgorithm;

/**
 * Get encryption key from config or environment
 * Uses security settings from config.js
 */
function getEncryptionKey() {
  const key = config.security.encryptionKey;
  if (!key || key.length < 32) {
    if (config.server.nodeEnv === 'production') {
      throw new Error('ENCRYPTION_KEY must be set to a secure value (minimum 32 characters) in production!');
    }
    console.warn('WARNING: ENCRYPTION_KEY not set or too short. Using default key for development only!');
    // Default key for development only - MUST be changed in production
    return crypto.createHash('sha256').update('three-dimensions-dev-key-change-in-production').digest();
  }
  // Use SHA-256 hash of the key to ensure correct length
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt data using AES-256-GCM
 */
function encrypt(data) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
function decrypt(encryptedObj) {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const authTag = Buffer.from(encryptedObj.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Read all submissions from encrypted storage
 */
async function readSubmissions() {
  try {
    await ensureDataDir();
    const fileContent = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
    const encryptedData = JSON.parse(fileContent);
    return decrypt(encryptedData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // No data yet
    }
    throw error;
  }
}

/**
 * Write all submissions to encrypted storage
 */
async function writeSubmissions(submissions) {
  await ensureDataDir();
  const encrypted = encrypt(submissions);
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(encrypted, null, 2));
}

/**
 * Log audit event for GDPR compliance
 */
async function logAudit(action, details) {
  try {
    await ensureDataDir();
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    await fs.appendFile(AUDIT_LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Save a new submission
 * @param {Object} data - Submission data
 * @returns {string} - Submission ID
 */
async function saveSubmission(data) {
  const id = uuidv4();
  const submission = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  };

  const submissions = await readSubmissions();
  submissions.push(submission);
  await writeSubmissions(submissions);

  // Audit log
  await logAudit('SUBMISSION_CREATED', {
    id,
    company: data.company,
    email: data.email.substring(0, 3) + '***' // Partial email for privacy
  });

  return id;
}

/**
 * Clean up expired submissions (6-month retention policy)
 */
async function cleanupExpiredData() {
  try {
    const submissions = await readSubmissions();
    const now = new Date();
    
    const validSubmissions = submissions.filter(submission => {
      const expiresAt = new Date(submission.expiresAt);
      return expiresAt > now;
    });

    const expiredCount = submissions.length - validSubmissions.length;

    if (expiredCount > 0) {
      await writeSubmissions(validSubmissions);
      await logAudit('DATA_CLEANUP', {
        expiredCount,
        remainingCount: validSubmissions.length
      });
      console.log(`Cleaned up ${expiredCount} expired submissions (6-month retention policy)`);
    }

    return expiredCount;
  } catch (error) {
    console.error('Data cleanup error:', error);
    return 0;
  }
}

/**
 * Get all submissions (for admin use only)
 * @returns {Array} - Array of submissions
 */
async function getAllSubmissions() {
  const submissions = await readSubmissions();
  await logAudit('DATA_ACCESS', { action: 'getAllSubmissions' });
  return submissions;
}

/**
 * Delete a specific submission by ID (for GDPR data deletion requests)
 * @param {string} id - Submission ID
 * @returns {boolean} - Whether deletion was successful
 */
async function deleteSubmission(id) {
  const submissions = await readSubmissions();
  const index = submissions.findIndex(s => s.id === id);
  
  if (index === -1) {
    return false;
  }

  submissions.splice(index, 1);
  await writeSubmissions(submissions);
  
  await logAudit('SUBMISSION_DELETED', { id, reason: 'GDPR request' });
  
  return true;
}

/**
 * Delete all submissions for a specific email (for GDPR data deletion requests)
 * @param {string} email - Email address
 * @returns {number} - Number of deleted submissions
 */
async function deleteByEmail(email) {
  const submissions = await readSubmissions();
  const normalizedEmail = email.toLowerCase().trim();
  
  const remaining = submissions.filter(s => s.email.toLowerCase() !== normalizedEmail);
  const deletedCount = submissions.length - remaining.length;
  
  if (deletedCount > 0) {
    await writeSubmissions(remaining);
    await logAudit('SUBMISSIONS_DELETED_BY_EMAIL', { 
      email: normalizedEmail.substring(0, 3) + '***',
      count: deletedCount,
      reason: 'GDPR request'
    });
  }
  
  return deletedCount;
}

/**
 * Export data for a specific email (for GDPR data portability requests)
 * @param {string} email - Email address
 * @returns {Array} - Array of submissions for that email
 */
async function exportByEmail(email) {
  const submissions = await readSubmissions();
  const normalizedEmail = email.toLowerCase().trim();
  
  const userSubmissions = submissions.filter(s => s.email.toLowerCase() === normalizedEmail);
  
  await logAudit('DATA_EXPORT', { 
    email: normalizedEmail.substring(0, 3) + '***',
    count: userSubmissions.length,
    reason: 'GDPR portability request'
  });
  
  // Remove internal fields for export
  return userSubmissions.map(s => ({
    id: s.id,
    name: s.name,
    company: s.company,
    email: s.email,
    interests: s.interests,
    interestOther: s.interestOther,
    website: s.website,
    budget: s.budget,
    deadline: s.deadline,
    message: s.message,
    submittedAt: s.createdAt
  }));
}

/**
 * Log admin access for security audit
 * @param {string} action - The admin action performed
 * @param {Object} details - Additional details about the action
 */
async function logAdminAccess(action, details) {
  await logAudit(`ADMIN_${action}`, details);
}

module.exports = {
  saveSubmission,
  cleanupExpiredData,
  getAllSubmissions,
  deleteSubmission,
  deleteByEmail,
  exportByEmail,
  logAdminAccess
};
