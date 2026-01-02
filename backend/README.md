# Three Dimensions Backend

Backend server for the Three Dimensions contact form. This server handles form submissions with:

- ✅ **Secure Data Storage** - AES-256-GCM encrypted storage
- ✅ **6-Month Retention** - Automatic deletion after 6 months (GDPR/DSGVO compliance)
- ✅ **Email Notifications** - Receive emails when new inquiries arrive
- ✅ **Rate Limiting** - Protection against spam (5 requests/hour per IP)
- ✅ **Input Validation** - Server-side validation and sanitization
- ✅ **GDPR Compliance** - Audit logging, data export, and deletion capabilities

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Important settings to configure:**

| Variable | Description | Required |
|----------|-------------|----------|
| `ENCRYPTION_KEY` | Strong encryption key for data storage | Yes |
| `SMTP_HOST` | Your SMTP server hostname | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASS` | SMTP password | Yes |
| `NOTIFICATION_EMAIL` | Where to receive notifications | Yes |
| `ALLOWED_ORIGINS` | Your website domain(s) | Yes |

**Generate a secure encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Server

```bash
# Production
npm start

# Or with process manager (recommended)
pm2 start server.js --name "three-dimensions-backend"
```

The server will start on port 3000 (or the port specified in `.env`).

## Deployment

### Option 1: Direct Server Deployment

1. Upload the `backend` folder to your server
2. Install Node.js 18+ on your server
3. Run `npm install` in the backend folder
4. Configure `.env` with your settings
5. Start with PM2 or systemd for production

### Option 2: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Nginx Configuration

Add this to your Nginx configuration to proxy API requests:

```nginx
server {
    listen 443 ssl;
    server_name three-dimensions.de;

    # SSL configuration...

    # Serve static website files
    root /var/www/three-dimensions;
    index index.html;

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## API Endpoints

### POST `/api/contact`

Submit a new contact form inquiry.

**Request:**
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

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns bald bei Ihnen."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "E-Mail-Adresse ist erforderlich"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## GDPR/DSGVO Compliance

This backend is designed to comply with German data protection laws:

### Data Retention
- All data is automatically deleted after 6 months (configurable via `RETENTION_DAYS`)
- Daily cleanup job removes expired submissions

### Data Security
- All data is encrypted using AES-256-GCM
- IP addresses are hashed, not stored in plain text
- Audit logging for all data access

### Data Subject Rights
The `dataManagement.js` service provides functions for:

- **Right to Access**: `exportByEmail(email)` - Export all data for a user
- **Right to Deletion**: `deleteByEmail(email)` - Delete all data for a user
- **Right to Portability**: Export data in JSON format

To handle GDPR requests, you can use these functions via a secure admin interface or CLI:

```javascript
const dataManagement = require('./services/dataManagement');

// Export user data (GDPR data portability)
const userData = await dataManagement.exportByEmail('user@example.com');

// Delete user data (GDPR right to deletion)
const deletedCount = await dataManagement.deleteByEmail('user@example.com');
```

## Security Considerations

1. **Never commit `.env`** - It contains sensitive credentials
2. **Use HTTPS** - Always deploy behind HTTPS in production
3. **Secure ENCRYPTION_KEY** - Use a strong, random key and keep it safe
4. **Regular Backups** - Back up the `data/` folder (encrypted submissions)
5. **Monitor Audit Logs** - Review `data/audit.log` for suspicious activity

## Troubleshooting

### Email not sending?
1. Check SMTP credentials in `.env`
2. Check firewall allows outbound SMTP (port 587 or 465)
3. Check server logs: `pm2 logs three-dimensions-backend`

### Rate limit hit?
- Default: 5 requests per hour per IP
- Adjust in `server.js` if needed

### Data directory permissions?
```bash
chmod 700 backend/data
chown your-user:your-user backend/data
```

## License

ISC - Three Dimensions
