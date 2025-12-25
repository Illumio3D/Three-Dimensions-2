# Backend Requirements for Three Dimensions Website

## Overview
This document outlines the backend API requirements for the contact form on the Three Dimensions website.

## Contact Form API Endpoint

### Endpoint: `/api/contact`
**Method:** POST  
**Content-Type:** application/json

### Request Body Schema

```json
{
  "name": "string (optional)",
  "company": "string (required)",
  "email": "string (required, valid email format)",
  "interests": ["array of strings (required, at least one)"],
  "interestOther": "string (optional, only if 'other' is selected)",
  "website": "string (optional, URL format)",
  "budget": "string (optional, one of: '<500', '500-1000', '>1000')",
  "deadline": "string (optional, date format YYYY-MM-DD)",
  "message": "string (required)",
  "consent": true
}
```

### Example Request

```json
{
  "name": "Max Mustermann",
  "company": "Musterfirma GmbH",
  "email": "max@musterfirma.de",
  "interests": ["3d-modell", "animation"],
  "interestOther": "",
  "website": "https://musterfirma.de",
  "budget": "500-1000",
  "deadline": "2024-03-15",
  "message": "Wir benötigen ein 3D-Modell für unsere neue Produktlinie.",
  "consent": true
}
```

### Success Response

**Status Code:** 200 OK

```json
{
  "success": true,
  "message": "Ihre Anfrage wurde erfolgreich übermittelt."
}
```

### Error Responses

**Status Code:** 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

**Status Code:** 500 Internal Server Error
```json
{
  "success": false,
  "message": "Ein Serverfehler ist aufgetreten."
}
```

## Backend Implementation Requirements

### 1. Validation
- Validate all required fields are present
- Validate email format
- Validate interests array has at least one selection
- Validate consent is true
- Validate URL format if website is provided
- Validate date format if deadline is provided

### 2. Data Processing
- Sanitize all input to prevent XSS attacks
- Store form submissions in a database or send via email
- Log all submissions for tracking purposes

### 3. Email Notification
Send an email notification to `kontakt@three-dimensions.de` with the following information:

**Email Template:**
```
Neue Projektanfrage von Three Dimensions Website

Von: [name]
Unternehmen: [company]
E-Mail: [email]

Interessen: [interests as comma-separated list]
[If "other" selected: Weitere Details: interestOther]

Website: [website]
Budget: [budget]
Deadline: [deadline]

Projektbeschreibung:
[message]

---
Datenschutzeinwilligung: Erteilt am [timestamp]
```

### 4. Auto-Response Email (Optional)
Send an auto-response email to the customer confirming receipt:

**Subject:** Ihre Anfrage bei Three Dimensions wurde empfangen

**Body:**
```
Hallo [name],

vielen Dank für Ihre Anfrage bei Three Dimensions!

Wir haben Ihre Nachricht erhalten und werden uns in Kürze bei Ihnen melden.

Ihre Anfrage im Überblick:
- Unternehmen: [company]
- Interessen: [interests]
- Budget: [budget]
- Gewünschter Fertigstellungstermin: [deadline]

Mit freundlichen Grüßen
Milo Boettger
Three Dimensions

---
kontakt@three-dimensions.de
https://three-dimensions.de
```

### 5. Data Privacy & GDPR Compliance
- Store consent timestamp
- Implement data retention policy (delete data after processing unless legally required)
- Provide mechanism to delete user data upon request
- Ensure encrypted transmission (HTTPS)
- Document all data processing activities

### 6. Rate Limiting
Implement rate limiting to prevent spam:
- Max 5 submissions per IP address per hour
- Return 429 Too Many Requests if limit exceeded

### 7. CORS Configuration
If API is on a different domain, configure CORS headers:
```
Access-Control-Allow-Origin: https://three-dimensions.de
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## Current Implementation Status

✅ Frontend form with validation  
✅ JavaScript for form submission  
✅ Error handling and user feedback  
❌ Backend API endpoint (needs to be implemented)  
❌ Email sending functionality  
❌ Database storage  

## Technology Recommendations

### Option 1: Serverless (Recommended for GitHub Pages)
- **Netlify Forms** or **Formspree**: Simple integration, handles email notifications
- **AWS Lambda + API Gateway**: Custom serverless function
- **Vercel Serverless Functions**: Easy to deploy

### Option 2: Traditional Server
- **Node.js + Express**: Simple REST API
- **PHP**: For traditional hosting environments
- **Python Flask/Django**: Good for data processing

### Option 3: Third-Party Services
- **Formspree**: `https://formspree.io` - Simple form backend
- **EmailJS**: Client-side email sending (less secure)
- **Netlify Forms**: Built-in form handling for Netlify deployments

## Quick Setup with Netlify Forms (Easiest)

If hosting on Netlify, simply add `netlify` attribute to the form:

```html
<form name="contact" method="POST" data-netlify="true" action="/thank-you">
  <!-- form fields -->
</form>
```

Netlify will automatically handle form submissions and email notifications.

## Next Steps

1. Choose a backend solution based on hosting environment
2. Implement the API endpoint with proper validation
3. Set up email notifications
4. Test the form submission end-to-end
5. Monitor submissions and add analytics if needed
