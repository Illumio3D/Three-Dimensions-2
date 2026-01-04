# Setup and Testing Guide for AR Viewer

This guide will help you set up the Three Dimensions website with AR viewer functionality and test it on both desktop and mobile devices.

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- A mobile device with AR support (iOS 12+ or Android 7.0+)
- Both devices connected to the same WiFi network (for mobile testing)

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment Configuration

Copy the example environment file and configure it:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your preferred settings. For local development and testing, the default values work fine:

```bash
NODE_ENV=development
PORT=3000
ENCRYPTION_KEY=your-secure-encryption-key-change-this
ADMIN_PASSWORD=your-secure-admin-password
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important:** Generate a secure encryption key for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Server

```bash
cd backend
npm start
```

You should see output like:
```
Three Dimensions Backend running on port 3000
Environment: development
Server accessible at:
  - Local: http://localhost:3000
  - Network: http://<your-local-ip>:3000
For mobile testing, use your computer's local IP address (e.g., http://192.168.1.100:3000)
```

## Testing on Desktop

### Basic Test

1. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

2. You should see the Three Dimensions homepage

3. Navigate to the AR viewer page:
   ```
   http://localhost:3000/ar-produktvisualisierung
   ```

### Verify 3D Model Loading

1. Open browser Developer Tools (F12)
2. Go to the Console tab
3. Navigate to the AR viewer page
4. Check for any error messages
5. The 3D model should load within a few seconds
6. You should see the coffee machine model in 3D

### Test Model File Access

1. Try accessing the 3D model file directly:
   ```
   http://localhost:3000/Maschine-Kopie.glb
   ```
2. Your browser should either display binary content or prompt you to download the file
3. This confirms static file serving is working correctly

### Common Desktop Issues

**Issue: Model not loading**
- Check if ad blocker is enabled → Disable for localhost
- Check browser console for errors
- Verify the model-viewer library loaded from unpkg.com

**Issue: "Failed to load resource: 404"**
- Check that model files exist in the root directory
- Verify file names are correct (no spaces)

## Testing on Mobile Device

### Step 1: Find Your Computer's Local IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Common local IP patterns:**
- 192.168.x.x (most home networks)
- 10.x.x.x (some routers and corporate networks)
- 172.16-31.x.x (less common)

### Step 2: Configure Firewall (if needed)

**macOS:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Allow incoming connections for Node.js or your terminal app

**Windows:**
1. Windows Defender Firewall → Allow an app
2. Add Node.js to the allowed apps list

**Linux:**
```bash
sudo ufw allow 3000
```

### Step 3: Access from Mobile Device

1. Ensure your mobile device is on the **same WiFi network** as your computer

2. Open the mobile browser (Safari on iOS, Chrome on Android)

3. Navigate to:
   ```
   http://<your-ip-address>:3000/ar-produktvisualisierung
   ```
   
   Example: `http://192.168.1.100:3000/ar-produktvisualisierung`

4. The AR viewer page should load just like on desktop

### Step 4: Test AR Functionality

1. Wait for the 3D model to load (you should see the coffee machine)

2. Tap the "In AR ansehen" (View in AR) button

3. **On iOS:**
   - AR Quick Look should launch
   - You'll be prompted to grant camera access (allow it)
   - Point your camera at a flat surface
   - The AR model should appear in your space

4. **On Android:**
   - ARCore should launch
   - Grant camera permissions if prompted
   - Point camera at a flat surface
   - The model should appear in AR

### Common Mobile Issues

**Issue: Cannot connect to http://192.168.x.x:3000**

Possible causes:
1. **Wrong IP address** → Verify IP with `ifconfig` or `ipconfig`
2. **Different WiFi networks** → Ensure both devices on same network
3. **Firewall blocking** → Configure firewall as described above
4. **Server not running** → Check server is still running on desktop
5. **Corporate/Public WiFi** → Some networks block device-to-device communication

**Issue: AR button doesn't work**

1. Check if your device supports AR:
   - iOS: iPhone 6s or later with iOS 12+
   - Android: ARCore-compatible device with Android 7.0+
2. Check browser console for errors
3. Grant camera permissions when prompted

**Issue: CORS errors on mobile**

This should be fixed automatically in development mode, but if you see CORS errors:
1. Verify `NODE_ENV=development` in your `.env` file
2. Restart the server
3. Check server logs to confirm development mode is active

## Debugging Checklist

Use this checklist to systematically debug issues:

### Server Issues
- [ ] Server is running (`npm start` in backend directory)
- [ ] No errors in server console
- [ ] Server shows "running on port 3000" message
- [ ] PORT 3000 is not already in use

### Network Issues
- [ ] Correct local IP address identified
- [ ] Both devices on same WiFi network
- [ ] Firewall allows port 3000
- [ ] Can ping computer from mobile device

### File Access Issues
- [ ] Model files exist in root directory
- [ ] Model files accessible at http://localhost:3000/Maschine-Kopie.glb
- [ ] No 404 errors in browser console
- [ ] Static file serving configured correctly

### Browser Issues
- [ ] Ad blockers disabled for the site
- [ ] JavaScript enabled
- [ ] Browser supports WebGL (for 3D rendering)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful file downloads

### AR Issues (Mobile)
- [ ] Device supports ARKit (iOS) or ARCore (Android)
- [ ] Camera permissions granted
- [ ] AR mode is "scene-viewer" (Android) or "quick-look" (iOS)
- [ ] Good lighting conditions for AR tracking

## Advanced Testing

### Test CORS Headers

```bash
# Should return Access-Control-Allow-Origin header
curl -H "Origin: http://192.168.1.100:3000" -I http://localhost:3000/Maschine-Kopie.glb
```

### Test from Different Network

If you need to test from a different network (e.g., mobile data), you'll need:
1. A public domain or IP address
2. Port forwarding on your router
3. HTTPS (required for AR on most devices)

This is beyond the scope of local testing and typically requires deployment to a production server.

### Test with QR Code

On desktop:
1. Click the "In AR ansehen" button
2. A QR code should appear
3. Scan it with your mobile device
4. Should open the AR viewer page on mobile

## Environment Modes

### Development Mode (`NODE_ENV=development`)
- Automatically allows all local network IPs (192.168.x.x, 10.x.x.x, etc.)
- More permissive CORS settings
- Enhanced logging
- Perfect for local testing

### Production Mode (`NODE_ENV=production`)
- Only allows explicitly configured origins in `ALLOWED_ORIGINS`
- Stricter security settings
- Use when deploying to a live server

## Troubleshooting Resources

1. **AR Viewer Troubleshooting Guide**: See `AR-VIEWER-TROUBLESHOOTING.md` for detailed troubleshooting steps

2. **Server Deployment Guide**: See `backend/SERVER-DEPLOYMENT-GUIDE.md` for production deployment

3. **Browser Console**: Always check F12 Developer Tools → Console for error messages

4. **Server Logs**: Check terminal where `npm start` is running for server-side errors

5. **Network Tab**: Browser Developer Tools → Network tab shows all file requests and their status

## Performance Tips

### Optimize 3D Models
- Use compressed .glb files (already done)
- Provide both .glb (Android) and .usdz (iOS) formats
- Keep model size under 10MB for faster loading

### Network Performance
- Use WiFi for testing (not mobile data)
- Ensure stable internet connection for CDN resources (model-viewer library)
- Test in good lighting conditions for AR

### Browser Performance
- Close other tabs to free up memory
- Clear browser cache if model doesn't update
- Test in latest browser versions

## Next Steps

After successful testing:

1. **Deploy to Production**:
   - Set `NODE_ENV=production` in production environment
   - Configure `ALLOWED_ORIGINS` with your actual domain
   - Use HTTPS (required for AR on many devices)
   - Follow `backend/SERVER-DEPLOYMENT-GUIDE.md`

2. **Add More Models**:
   - Place .glb and .usdz files in root directory
   - Update HTML to reference new models
   - Test loading and AR functionality

3. **Customize AR Experience**:
   - Modify model-viewer attributes in HTML
   - Adjust camera settings, lighting, and shadows
   - Add interaction buttons or annotations

## Getting Help

If you encounter issues not covered in this guide:

1. Check `AR-VIEWER-TROUBLESHOOTING.md` for detailed troubleshooting
2. Review browser console errors
3. Check server logs
4. Contact: kontakt@three-dimensions.de

## Summary of Changes Made

This guide reflects the following improvements to enable AR viewer functionality:

1. **Server Binding**: Server now binds to `0.0.0.0` (listens on all network interfaces)
2. **CORS Configuration**: Automatically allows local network IPs in development mode
3. **Static File Serving**: Already properly configured with `express.static`
4. **Documentation**: Comprehensive setup and troubleshooting guides

All changes are minimal and focused on enabling network access for mobile testing while maintaining security in production mode.
