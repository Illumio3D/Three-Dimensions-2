/**
 * Contact Form Routes
 * Handles submission of contact form inquiries
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const validator = require('validator');
const dataManagement = require('../services/dataManagement');
const emailService = require('../services/emailService');

// Allowed interest values for validation
const ALLOWED_INTERESTS = [
  '3d-modell',
  'ar-optimiert',
  'renderings',
  'animation',
  'other'
];

// Allowed budget values
const ALLOWED_BUDGETS = ['<500', '500-1000', '>1000', ''];

/**
 * Sanitize a string value to prevent XSS
 * @param {string} value - The value to sanitize
 * @returns {string} - Sanitized value
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return validator.escape(validator.trim(value));
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  return validator.isEmail(email, {
    allow_utf8_local_part: false
  });
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
function isValidUrl(url) {
  if (!url || url.trim() === '') return true; // Optional field
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date to validate
 * @returns {boolean} - Whether date is valid
 */
function isValidDate(date) {
  if (!date || date.trim() === '') return true; // Optional field
  return validator.isDate(date, { format: 'YYYY-MM-DD' });
}

/**
 * POST /api/contact
 * Submit a new contact form inquiry
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      interests,
      interestOther,
      website,
      budget,
      deadline,
      message,
      consent
    } = req.body;

    const errors = [];

    // Validate required fields
    if (!company || company.trim() === '') {
      errors.push('Unternehmensname ist erforderlich');
    }

    if (!email || email.trim() === '') {
      errors.push('E-Mail-Adresse ist erforderlich');
    } else if (!isValidEmail(email)) {
      errors.push('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      errors.push('Bitte wählen Sie mindestens ein Interesse aus');
    } else {
      // Validate each interest value
      const invalidInterests = interests.filter(i => !ALLOWED_INTERESTS.includes(i));
      if (invalidInterests.length > 0) {
        errors.push('Ungültige Interessenauswahl');
      }
    }

    if (!message || message.trim() === '') {
      errors.push('Projektbeschreibung ist erforderlich');
    }

    if (consent !== true) {
      errors.push('Bitte stimmen Sie der Datenschutzerklärung zu');
    }

    // Validate optional fields
    if (!isValidUrl(website)) {
      errors.push('Bitte geben Sie eine gültige Website-URL ein');
    }

    if (budget && !ALLOWED_BUDGETS.includes(budget)) {
      errors.push('Ungültige Budget-Auswahl');
    }

    if (!isValidDate(deadline)) {
      errors.push('Bitte geben Sie ein gültiges Datum ein');
    }

    // Return validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join('. ')
      });
    }

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeString(name || ''),
      company: sanitizeString(company),
      email: validator.normalizeEmail(email) || email.toLowerCase().trim(),
      interests: interests.filter(i => ALLOWED_INTERESTS.includes(i)),
      interestOther: interests.includes('other') ? sanitizeString(interestOther || '') : '',
      website: website ? validator.trim(website) : '',
      budget: ALLOWED_BUDGETS.includes(budget) ? budget : '',
      deadline: deadline ? validator.trim(deadline) : '',
      message: sanitizeString(message),
      consent: true,
      consentTimestamp: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      ipHash: hashIP(req.ip || req.connection.remoteAddress || 'unknown')
    };

    // Store the submission securely
    const submissionId = await dataManagement.saveSubmission(sanitizedData);

    // Send email notification
    try {
      await emailService.sendNotification(sanitizedData, submissionId);
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Email notification failed:', emailError.message);
    }

    // Send auto-response to customer (optional)
    if (process.env.SEND_AUTO_RESPONSE === 'true') {
      try {
        await emailService.sendAutoResponse(sanitizedData);
      } catch (autoResponseError) {
        console.error('Auto-response email failed:', autoResponseError.message);
      }
    }

    // Return success
    res.status(200).json({
      success: true,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns bald bei Ihnen.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
});

/**
 * Hash IP address for privacy (GDPR compliance)
 * We only store a hash, not the actual IP
 */
function hashIP(ip) {
  const salt = process.env.IP_HASH_SALT || 'three-dimensions-default-salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').substring(0, 16);
}

module.exports = router;
