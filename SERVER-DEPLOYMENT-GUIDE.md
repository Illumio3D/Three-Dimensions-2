# Server Deployment Guide

Complete guide for deploying Three Dimensions to your own Linux server with wildcard SSL certificate.

## Table of Contents

1. [Link Behavior Analysis](#link-behavior-analysis)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Post-Deployment Steps](#post-deployment-steps)
4. [Configuration Reference](#configuration-reference)
5. [Admin Panel Setup](#admin-panel-setup)
6. [Security Confirmations](#security-confirmations)

---

## Link Behavior Analysis

### ✅ Automatic/Dynamic Links (No Changes Needed)

All **internal navigation links** use relative paths and will work automatically on any domain:

| Link Type | Example | Status |
|-----------|---------|--------|
| Navigation | `href="index.html"` | ✅ Works |
| Page links | `href="Three-Dimensions-Anfrageformular.html"` | ✅ Works |
| Form action | `POST /api/contact` | ✅ Works |
| CSS/JS | `href="responsive.css"` | ✅ Works |
| Images | `src="Machine-auf-tisch.webp"` | ✅ Works |

### ⚠️ SEO Metadata (Requires Manual Update)

The following hardcoded URLs in HTML `<head>` sections should be updated to your domain for proper SEO:

| Metadata Type | Current Value | Update To |
|---------------|---------------|-----------|
| Canonical URL | `https://three-dimensions.de/...` | `https://yourdomain.com/...` |
| Open Graph URL | `https://three-dimensions.de/...` | `https://yourdomain.com/...` |
| Open Graph Image | `https://three-dimensions.de/image.png` | `https://yourdomain.com/image.png` |
| Twitter Card URL | `https://three-dimensions.de/...` | `https://yourdomain.com/...` |
| Twitter Card Image | `https://three-dimensions.de/image.png` | `https://yourdomain.com/image.png` |

**Files that need updates:**
- `index.html`
- `ar-produktvisualisierung.html`
- `Details-durch-3D.html`
- `3D-Renderings-fuer-Shops.html`
- `Three-Dimensions-Anfrageformular.html`
- `Ueber-Mich.html`
- `Datenschutz.html`
- `Impressum.html`
- `Interaktives-AR-Umfeld.html`

**Note:** These updates are optional for basic functionality but important for SEO and social media sharing.

---

## Pre-Deployment Checklist

### Step 1: Create Environment File

```bash
cd backend
cp .env.example .env
```

### Step 2: Configure Required Settings

Edit `backend/.env` with your values:

```env
# ===========================================
# REQUIRED SETTINGS - Must be configured
# ===========================================

# Your domain(s) - comma-separated for wildcard
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://*.yourdomain.com

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-64-character-hex-key-here

# Your admin password (enter in plaintext - auto-hashed internally)
ADMIN_PASSWORD=YourSecurePassword123!

# ===========================================
# SMTP SETTINGS - For email notifications
# ===========================================
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@yourdomain.com
NOTIFICATION_EMAIL=where-notifications-go@yourdomain.com

# ===========================================
# OPTIONAL SETTINGS
# ===========================================

# Server port (default: 3000)
PORT=3000

# Environment mode
NODE_ENV=production

# Enable auto-response emails to customers
SEND_AUTO_RESPONSE=true

# Data retention in days (default: 180 for GDPR)
RETENTION_DAYS=180
```

### Step 3: Generate Security Keys

Run these commands to generate secure keys:

```bash
# Generate ENCRYPTION_KEY
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate IP_HASH_SALT
node -e "console.log('IP_HASH_SALT=' + require('crypto').randomBytes(16).toString('hex'))"

# Generate ADMIN_TOKEN_SECRET (optional)
node -e "console.log('ADMIN_TOKEN_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Update SEO URLs (Optional)

Search and replace in all HTML files:
- Find: `https://three-dimensions.de`
- Replace: `https://yourdomain.com`

---

## Post-Deployment Steps

### Step 1: Upload Files

Upload all files to your server:
```bash
# Example using rsync
rsync -avz --exclude '.git' --exclude 'node_modules' ./ user@server:/var/www/three-dimensions/
```

### Step 2: Install Dependencies

```bash
cd /var/www/three-dimensions/backend
npm install --production
```

### Step 3: Create Data Directory

```bash
mkdir -p /var/www/three-dimensions/backend/data
chmod 700 /var/www/three-dimensions/backend/data
```

### Step 4: Start Backend Server

**Option A: Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
cd /var/www/three-dimensions/backend
pm2 start server.js --name "three-dimensions"

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

**Option B: Using systemd**
```bash
# Create service file
sudo nano /etc/systemd/system/three-dimensions.service
```

```ini
[Unit]
Description=Three Dimensions Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/three-dimensions/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable three-dimensions
sudo systemctl start three-dimensions
```

### Step 5: Configure Web Server

**Nginx Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (wildcard certificate)
    ssl_certificate /path/to/your/wildcard.crt;
    ssl_certificate_key /path/to/your/wildcard.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Document root
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
        try_files $uri $uri.html $uri/ =404;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|webp|gif|ico|css|js|woff|woff2|mp4|webm|glb|usdz)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 6: Test Deployment

```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-04T..."}
```

---

## Configuration Reference

### Where to Change Settings

| Setting | Location | Description |
|---------|----------|-------------|
| **Admin Password** | `backend/.env` → `ADMIN_PASSWORD` | Enter plaintext, auto-hashed internally |
| **Allowed Origins** | `backend/.env` → `ALLOWED_ORIGINS` | Your domain(s), comma-separated |
| **SMTP Settings** | `backend/.env` → `SMTP_*` | Email server configuration |
| **Server Port** | `backend/.env` → `PORT` | Default: 3000 |
| **Data Retention** | `backend/.env` → `RETENTION_DAYS` | Default: 180 (6 months) |

### Default Fallback Values

If not set in `.env`, these defaults apply (from `backend/config.js`):

| Setting | Default Value |
|---------|---------------|
| Admin Password | `ThreeD2026!` |
| Port | `3000` |
| Retention Days | `180` |
| Allowed Origins | `localhost:3000, 127.0.0.1:3000` |

---

## Admin Panel Setup

### Accessing the Admin Panel

URL: `https://yourdomain.com/admin.html` (or `/admin`)

### Setting Admin Password

1. **Set in `.env` file:**
   ```env
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

2. **Restart the server:**
   ```bash
   pm2 restart three-dimensions
   # or
   sudo systemctl restart three-dimensions
   ```

3. **Password is automatically hashed** using PBKDF2 internally - you enter plaintext in `.env`

### Password Security Notes

- Password is **never stored in plaintext** - hashed on every verification
- Timing-safe comparison prevents timing attacks
- Rate limiting: 5 login attempts per 15 minutes per IP
- Sessions expire after 1 hour of inactivity

---

## Security Confirmations

### ✅ Admin Page is NOINDEX

Confirmed in `admin.html` lines 8-10:
```html
<!-- NOINDEX: Prevent search engines from indexing this page -->
<meta name="robots" content="noindex, nofollow">
<meta name="googlebot" content="noindex, nofollow">
```

Search engines will:
- **NOT** index the admin page
- **NOT** follow any links from the admin page

### ✅ CORS Protection

API only responds to domains listed in `ALLOWED_ORIGINS`:
```env
# Only these domains can make API requests
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### ✅ Rate Limiting

- Contact form: 5 submissions per hour per IP
- Admin login: 5 attempts per 15 minutes per IP

### ✅ Data Encryption

- All form submissions encrypted with AES-256-GCM
- IP addresses hashed, not stored in plaintext
- Automatic deletion after retention period (default: 180 days)

---

## Quick Reference Commands

```bash
# View server logs
pm2 logs three-dimensions

# Restart server
pm2 restart three-dimensions

# Check server status
pm2 status

# Test API health
curl https://yourdomain.com/api/health

# View data directory
ls -la /var/www/three-dimensions/backend/data/
```

---

## Troubleshooting

### Backend not responding?
1. Check if Node.js is running: `pm2 status`
2. Check logs: `pm2 logs three-dimensions`
3. Verify port is correct in nginx and `.env`

### Emails not sending?
1. Verify SMTP credentials in `.env`
2. Check firewall allows outbound port 587 or 465
3. Try with `SMTP_SECURE=true` for port 465

### Admin login failing?
1. Verify `ADMIN_PASSWORD` is set in `.env`
2. Check for rate limiting (wait 15 minutes)
3. Restart server after password change

### CORS errors?
1. Add your domain to `ALLOWED_ORIGINS` in `.env`
2. Include both with and without `www`
3. Restart server after changes

---

## Summary Checklist

### Before Upload
- [ ] Created `backend/.env` from `.env.example`
- [ ] Set `ADMIN_PASSWORD` to your secure password
- [ ] Generated and set `ENCRYPTION_KEY`
- [ ] Set `ALLOWED_ORIGINS` to your domain(s)
- [ ] Configured SMTP settings for email
- [ ] (Optional) Updated SEO canonical URLs

### After Upload
- [ ] Ran `npm install` in backend folder
- [ ] Created data directory with proper permissions
- [ ] Started backend server (PM2 or systemd)
- [ ] Configured web server (nginx) reverse proxy
- [ ] SSL/HTTPS is working
- [ ] Tested `/api/health` endpoint
- [ ] Tested contact form submission
- [ ] Tested admin login at `/admin.html`
- [ ] Verified admin page is not in Google (noindex working)
