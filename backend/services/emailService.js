/**
 * Email Service
 * 
 * Handles email notifications for new contact form submissions
 * - Sends simplified notification to business owner (Anfrage ID + date only)
 * - Optionally sends auto-response to customer
 * 
 * CONFIGURATION:
 * SMTP settings are centralized in config.js
 * Set credentials via .env file for security
 * @see config.js for SMTP configuration options
 */

const nodemailer = require('nodemailer');
const config = require('../config');

/**
 * Get email transporter configuration
 * Uses SMTP settings from config.js
 */
function getTransporter() {
  // Check if email is configured using config
  if (!config.smtp.isConfigured()) {
    console.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env file.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.auth
  });
}

/**
 * Generate a shortened 5-digit numeric ID from UUID
 * Uses the UUID to generate a deterministic numeric code
 * @param {string} uuid - The full UUID
 * @returns {string} - 5-digit numeric ID
 */
function generateShortId(uuid) {
  // Remove hyphens and convert to a number using base conversion
  const cleanUuid = uuid.replace(/-/g, '');
  // Use first 10 characters and convert from hex to decimal, then take last 5 digits
  const numericValue = parseInt(cleanUuid.substring(0, 10), 16);
  // Ensure it's always 5 digits (10000-99999 range)
  const shortId = (numericValue % 90000) + 10000;
  return shortId.toString();
}

/**
 * Format interests for display
 */
function formatInterests(interests, interestOther) {
  const interestLabels = {
    '3d-modell': '3D Modell erstellen',
    'ar-optimiert': 'Für AR optimiertes 3D Modell erstellen',
    'renderings': 'Einfache Produkt-Renderings',
    'animation': '3D Animation',
    'other': 'Etwas anderes'
  };

  const formatted = interests.map(i => interestLabels[i] || i).join(', ');
  
  if (interests.includes('other') && interestOther) {
    return `${formatted}\n   → Details: ${interestOther}`;
  }
  
  return formatted;
}

/**
 * Format budget for display
 */
function formatBudget(budget) {
  const budgetLabels = {
    '<500': 'Unter 500€',
    '500-1000': '500€ - 1.000€',
    '>1000': 'Über 1.000€'
  };
  return budgetLabels[budget] || 'Nicht angegeben';
}

/**
 * Send simplified notification email to business owner
 * Contains only Anfrage ID and date - full details viewable in admin panel
 */
async function sendNotification(data, submissionId) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('Email notification skipped (not configured)');
    return;
  }

  const shortId = generateShortId(submissionId);
  const dateStr = new Date().toLocaleString('de-DE', { 
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Simplified email content - only ID and date
  // Full details are available in the admin panel at /admin
  const emailContent = `
Neue Projektanfrage bei Three Dimensions
========================================

Anfrage-ID: ${shortId}
Eingegangen am: ${dateStr}

---
Vollständige Details zu dieser Anfrage können im Admin-Panel eingesehen werden.
Admin-Panel: https://three-dimensions.de/admin.html

Diese E-Mail wurde automatisch generiert.
`;

  await transporter.sendMail({
    from: `"Three Dimensions Website" <${config.smtp.fromAddress}>`,
    to: config.smtp.notificationEmail,
    replyTo: data.email,
    subject: `Neue Projektanfrage - ID: ${shortId}`,
    text: emailContent
  });

  console.log(`Notification email sent to ${config.smtp.notificationEmail} (ID: ${shortId})`);
}

/**
 * Send auto-response email to customer
 */
async function sendAutoResponse(data) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('Auto-response email skipped (not configured)');
    return;
  }

  const emailContent = `
Hallo ${data.name || 'Interessent/in'},

vielen Dank für Ihre Anfrage bei Three Dimensions!

Wir haben Ihre Nachricht erhalten und werden uns in Kürze bei Ihnen melden.

Ihre Anfrage im Überblick:
--------------------------
Unternehmen: ${data.company}
Interessen: ${formatInterests(data.interests, data.interestOther)}
Budget: ${formatBudget(data.budget)}
Gewünschter Fertigstellungstermin: ${data.deadline || 'Nicht angegeben'}

Mit freundlichen Grüßen
Milo Boettger
Three Dimensions

---
kontakt@three-dimensions.de
https://three-dimensions.de

Hinweis: Diese E-Mail wurde automatisch generiert. 
Ihre Daten werden gemäß unserer Datenschutzerklärung behandelt 
und nach spätestens 6 Monaten gelöscht.
`;

  await transporter.sendMail({
    from: `"Three Dimensions" <${config.smtp.fromAddress}>`,
    to: data.email,
    subject: 'Ihre Anfrage bei Three Dimensions wurde empfangen',
    text: emailContent
  });

  console.log(`Auto-response email sent to ${data.email}`);
}

module.exports = {
  sendNotification,
  sendAutoResponse,
  generateShortId
};
