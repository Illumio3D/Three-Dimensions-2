/**
 * Email Service
 * 
 * Handles email notifications for new contact form submissions
 * - Sends notification to business owner
 * - Optionally sends auto-response to customer
 */

const nodemailer = require('nodemailer');

/**
 * Get email transporter configuration
 */
function getTransporter() {
  // Check if email is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
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
 * Send notification email to business owner
 */
async function sendNotification(data, submissionId) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('Email notification skipped (not configured)');
    return;
  }

  const recipientEmail = process.env.NOTIFICATION_EMAIL || 'kontakt@three-dimensions.de';
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const emailContent = `
Neue Projektanfrage von Three Dimensions Website
================================================

Anfrage-ID: ${submissionId}
Eingegangen am: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}

KONTAKTDATEN
------------
Name: ${data.name || 'Nicht angegeben'}
Unternehmen: ${data.company}
E-Mail: ${data.email}
Website: ${data.website || 'Nicht angegeben'}

PROJEKTDETAILS
--------------
Interessen: ${formatInterests(data.interests, data.interestOther)}
Budget: ${formatBudget(data.budget)}
Deadline: ${data.deadline || 'Nicht angegeben'}

PROJEKTBESCHREIBUNG
-------------------
${data.message}

---
Datenschutzeinwilligung: Erteilt am ${data.consentTimestamp}
Diese Anfrage wird gemäß DSGVO für maximal 6 Monate gespeichert.
`;

  await transporter.sendMail({
    from: `"Three Dimensions Website" <${senderEmail}>`,
    to: recipientEmail,
    replyTo: data.email,
    subject: `Neue Projektanfrage: ${data.company}`,
    text: emailContent
  });

  console.log(`Notification email sent to ${recipientEmail}`);
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

  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

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
    from: `"Three Dimensions" <${senderEmail}>`,
    to: data.email,
    subject: 'Ihre Anfrage bei Three Dimensions wurde empfangen',
    text: emailContent
  });

  console.log(`Auto-response email sent to ${data.email}`);
}

module.exports = {
  sendNotification,
  sendAutoResponse
};
