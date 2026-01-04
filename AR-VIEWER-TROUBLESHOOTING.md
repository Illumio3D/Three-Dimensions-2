# AR Viewer Troubleshooting Guide

This document provides troubleshooting steps for common issues with the AR viewer on the Three Dimensions website.

## Quick Start for Testing AR Viewer

### Desktop Testing (localhost)
```bash
cd backend
npm install
npm start
# Access at: http://localhost:3000/ar-produktvisualisierung
```

### Mobile Testing (Local Network)
1. Start the server (it automatically binds to 0.0.0.0 for network access)
2. Find your computer's local IP address:
   - **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig` (look for IPv4 Address)
3. On your mobile device, connect to the same WiFi network
4. Open browser and navigate to: `http://<your-ip>:3000/ar-produktvisualisierung`
   - Example: `http://192.168.1.100:3000/ar-produktvisualisierung`

## Common Issues and Solutions

### Issue 1: 3D Model Not Loading (Shows "🔄 Wird geladen..." indefinitely)

**Symptoms:**
- Page shows loading spinner forever
- Model never appears
- Console shows no specific errors

**Possible Causes:**

1. **Server Not Running**
   - Make sure the backend server is started: `cd backend && npm start`
   - Check console output for "Three Dimensions Backend running on port 3000"

2. **File Path Issues**
   - Model files must be accessible from the server root
   - Files are currently at: `Maschine-Kopie.glb` and `Maschine-Kopie.usdz` (root directory)
   - The server serves static files from the parent directory

3. **Model-Viewer Library Not Loading**
   - The model-viewer library from unpkg.com may be blocked
   - Common causes:
     - Ad blockers (uBlock Origin, AdBlock Plus, etc.)
     - Privacy extensions (Privacy Badger, Ghostery, etc.)
     - Corporate firewalls blocking CDN content
     - Network issues or CDN unavailability
   - **Solution:** Disable ad blockers for this site, or check network settings

4. **CORS Issues** (Fixed in this update)
   - Server now allows local network IPs automatically in development mode
   - CORS headers properly set for all static files

### Issue 2: Cannot Access from Mobile Device

**Symptoms:**
- Can access `http://localhost:3000` on desktop
- Cannot access `http://192.168.x.x:3000` from mobile device
- Connection timeout or refused errors

**Solutions:**

1. **Verify Server Binding** (Fixed in this update)
   - Server now binds to `0.0.0.0` automatically
   - Check server logs on startup for confirmation

2. **Check Firewall Settings**
   - Ensure port 3000 is allowed in your firewall
   - **macOS**: System Preferences → Security & Privacy → Firewall
   - **Windows**: Windows Defender Firewall → Allow an app
   - **Linux**: `sudo ufw allow 3000`

3. **Verify Same Network**
   - Both devices must be on the same WiFi network
   - Corporate/public WiFi may block device-to-device communication

4. **Check IP Address**
   - Make sure you're using the correct local IP address
   - The IP should start with 192.168.x.x or 10.x.x.x

### Issue 3: Error Message "Das 3D-Modell konnte nicht geladen werden"

**Common causes:**
1. **Cross-Origin-Resource-Policy header misconfiguration** (FIXED as of Jan 4, 2026)
   - Helmet's default `same-origin` setting blocked model-viewer from loading files
   - Now configured as `cross-origin` in server.js
2. Ad blockers are active and blocking unpkg.com or jsdelivr.net
3. Network/firewall restrictions prevent CDN access
4. The CDN is temporarily unavailable
5. Model files cannot be loaded from the server

**To resolve:**
1. **If you just updated the code**: Restart the backend server to apply the fix
2. Disable ad blocker extensions for this website
3. Check browser console (F12 or Cmd+Option+I on Mac) for specific error messages
4. Verify network connectivity
5. Try accessing https://unpkg.com directly to check if it's blocked
6. Verify model files exist and are accessible:
   - Try accessing `http://localhost:3000/Maschine-Kopie.glb` directly
   - Should show download dialog or binary content
7. Check the `Cross-Origin-Resource-Policy` header:
   - Run: `curl -I http://localhost:3000/Maschine-Kopie.glb | grep Cross-Origin-Resource-Policy`
   - Should show: `Cross-Origin-Resource-Policy: cross-origin`
   - If it shows `same-origin`, update your code to the latest version

### Issue 3a: Safari-Specific Issues on macOS

Safari has stricter security policies that can cause model-viewer issues on localhost.

**Symptoms:**
- Works in Chrome/Firefox but not Safari
- Error message appears after loading spinner
- Console shows CORS-related errors

**Solutions:**

1. **Disable CORS for Development (Temporary)**
   - Go to Safari > Settings > Advanced
   - Enable "Show features for web developers"
   - In the Develop menu, enable "Disable cross-origin restrictions"
   - **Note:** Re-enable this after testing for security!

2. **Use IP Address Instead of 'localhost'**
   - Safari sometimes has issues with 'localhost'
   - Try `http://127.0.0.1:3000` instead
   - Or use your actual local IP: `http://192.168.x.x:3000`
   - Find your IP with: `ifconfig | grep "inet " | grep -v 127.0.0.1`

3. **Clear Safari Cache**
   - Safari > Settings > Privacy > Manage Website Data
   - Remove data for localhost
   - Or try a Private Window (Cmd+Shift+N)

4. **Ensure Using Node.js Server (Port 3000)**
   - Make sure you're running: `cd backend && npm start`
   - Access via `http://localhost:3000` (NOT port 8000)
   - The Python server (port 8000) doesn't set required headers

### Issue 4: Videos Not Playing

**Possible Causes:**
1. Video files have spaces in names (FIXED in previous PR)
2. Browser doesn't support the video codec
3. Video files missing or path incorrect

**Files that were renamed:**
- `Hero shot kafeemaschine0001-0349.mp4` → `Hero-shot-kafeemaschine0001-0349.mp4`
- `Iphone fbegining-HEVC.mov` → `Iphone-fbegining-HEVC.mov`
- `Iphone fbegining00086400.webm` → `Iphone-fbegining00086400.webm`

### Issue 5: Mixed Content Errors

**Symptoms:**
- Browser console shows "Mixed Content" warnings
- Resources fail to load on HTTPS pages

**Solution:**
- Ensure all resources (models, scripts, images) use HTTPS in production
- For local development, use HTTP consistently (not mixing HTTP/HTTPS)

## Server Configuration Changes (This Update)

### What Changed:

1. **Cross-Origin-Resource-Policy Header (January 4, 2026 - CRITICAL FIX)**
   - Changed from `same-origin` to `cross-origin` in Helmet configuration
   - **Why this matters:** The model-viewer web component needs to fetch 3D model files (GLB/USDZ)
   - Without this fix, browsers block the model files from loading
   - **Symptom:** AR viewer shows "Das 3D-Modell konnte nicht geladen werden"
   - **Technical details:** Helmet's default `same-origin` policy prevented the shadow DOM's fetch requests

2. **Network Binding**
   - Server now binds to `0.0.0.0` instead of localhost only
   - Enables access from other devices on the local network

3. **CORS Configuration**
   - Development mode automatically allows:
     - `localhost` and `127.0.0.1`
     - Local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
   - Production mode requires explicit ALLOWED_ORIGINS in .env

4. **Static File Serving**
   - Already configured correctly with `express.static`
   - Serves all files from root directory including 3D models

### Configuration Files:

1. **backend/config.js**
   - Added `isOriginAllowed()` function for flexible CORS
   - Automatically handles local network IPs in development

2. **backend/server.js**
   - **NEW:** Added `crossOriginResourcePolicy: { policy: 'cross-origin' }` to Helmet config
   - Updated to bind to `0.0.0.0`
   - Enhanced logging to show network URLs
   - Updated CORS middleware to use `isOriginAllowed()`

3. **backend/.env.example**
   - Updated with clearer documentation
   - Added notes about development vs production mode

## Testing Checklist

When testing AR viewer functionality:

1. ✅ Start backend server: `cd backend && npm start`
2. ✅ Check server logs for successful startup and network URL
3. ✅ Open browser console (F12)
4. ✅ Navigate to AR viewer page: `http://localhost:3000/ar-produktvisualisierung`
5. ✅ Check for error messages in console
6. ✅ Verify model files are accessible:
   - Try accessing `http://localhost:3000/Maschine-Kopie.glb` directly
   - Should show download dialog or binary content
7. ✅ Check network tab for failed requests
8. ✅ Test with ad blockers disabled
9. ✅ For mobile testing:
   - Find your local IP address
   - Access `http://<your-ip>:3000/ar-produktvisualisierung` from mobile
   - Test AR functionality with "In AR ansehen" button

## Development Server Setup

### Using the Node.js Backend Server (Recommended)

```bash
cd backend
npm install
npm start
```

This starts the Express server with:
- Static file serving for all website files
- CORS configured for local development
- Network access enabled (0.0.0.0 binding)
- Proper handling of clean URLs

### Alternative: Python Simple Server (For static HTML only)

```bash
./start-dev-server.sh
```

This starts a Python HTTP server on port 8000. Note: This won't include backend API functionality.

## File Naming Best Practices

**DO:**
- Use hyphens for spaces: `my-file.glb`
- Use lowercase when possible
- Keep names descriptive but concise

**DON'T:**
- Use spaces: `my file.glb` ❌
- Use special characters: `my_file!.glb` ❌
- Use non-ASCII characters when possible

## Browser Compatibility

### Model Viewer Library
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Requires JavaScript enabled

### AR Features
- **iOS:** Requires iOS 12+ with ARKit support
- **Android:** Requires ARCore support (Android 7.0+)
- **Desktop:** Shows QR code to scan with mobile device

## Error Messages Explained

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "model-viewer library failed to load from CDN" | unpkg.com is blocked | Disable ad blocker |
| "Das 3D-Modell konnte nicht geladen werden" | Model file or library failed | Check console for details |
| "Failed to load resource: 404" | File not found | Verify file exists and path is correct |
| "ERR_BLOCKED_BY_CLIENT" | Browser extension blocking | Disable blocking extension |
| "Connection refused" or "Cannot connect" | Server not running or wrong IP | Check server is running and use correct IP |
| "CORS error" | Origin not allowed | Fixed in this update for development mode |

## Debugging Steps

### 1. Check if Server is Running
```bash
# Should see "Three Dimensions Backend running on port 3000"
cd backend && npm start
```

### 2. Test Static File Access
```bash
# Should download the file
curl -I http://localhost:3000/Maschine-Kopie.glb
# or open in browser:
# http://localhost:3000/Maschine-Kopie.glb
```

### 3. Check CORS Headers
```bash
# Should show Access-Control-Allow-Origin header
curl -H "Origin: http://192.168.1.100:3000" -I http://localhost:3000/Maschine-Kopie.glb
```

### 4. Test from Mobile
- Use browser's network inspector on mobile
- Check if requests reach the server
- Verify correct IP and port

## Recent Fixes

### January 4, 2026 - Pinned model-viewer Version Fix
- ✅ **Fixed AR viewer loadfailure issue** - Pinned model-viewer to stable version 3.5.0
- ✅ Previously used unpinned CDN URLs which could load breaking versions
- ✅ Changed primary CDN from unpkg to jsdelivr (more reliable)
- ✅ Added fallback CDN (Google's ajax.googleapis.com)
- ✅ Added WebGL context loss detection for Safari users
- ✅ Enhanced error messages with browser-specific guidance
- ✅ Updated CSP to allow all required CDN domains

### January 4, 2026 - Cross-Origin-Resource-Policy Fix
- ✅ **Fixed AR viewer loading issue** - Changed `Cross-Origin-Resource-Policy` header from `same-origin` to `cross-origin`
- ✅ This allows the model-viewer web component to properly load GLB/USDZ files
- ✅ Without this fix, the AR viewer shows "Das 3D-Modell konnte nicht geladen werden"
- ✅ This was the root cause of the sudden AR viewer failure

### January 2026 - AR Viewer and Network Access
- ✅ Server binds to 0.0.0.0 for network access
- ✅ CORS allows local network IPs in development mode
- ✅ Enhanced server logging with network URLs
- ✅ Updated documentation for mobile testing
- ✅ Verified static file serving for 3D models

### Previous - Filename Issues
- ✅ Renamed all model files to remove spaces from filenames
- ✅ Renamed video files to remove spaces
- ✅ Added comprehensive error handling for CDN failures
- ✅ Added user-friendly error messages in German
- ✅ Improved code quality (extracted magic numbers, added comments)

## Model-Viewer Version Management

The AR viewer uses the `@google/model-viewer` web component. **Always use a pinned version** to avoid unexpected issues from breaking changes in new releases.

Current pinned version: **3.5.0** (most stable v3.x release)

To update the version:
1. Edit `ar-produktvisualisierung.html`
2. Change the `MODEL_VIEWER_VERSION` variable
3. Test thoroughly before deploying

## Environment Variables

Create a `.env` file in the `backend` directory with:

```bash
# Development mode for local testing
NODE_ENV=development
PORT=3000

# CORS will automatically allow local IPs in development mode
# For production, set explicit domains:
# ALLOWED_ORIGINS=https://three-dimensions.de,https://www.three-dimensions.de

# Other required settings (see .env.example for complete list)
ENCRYPTION_KEY=your-secure-key
ADMIN_PASSWORD=your-admin-password
```

## Contact

For further assistance, contact: kontakt@three-dimensions.de
