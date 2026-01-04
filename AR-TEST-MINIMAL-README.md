# AR Minimal Test Page

## Purpose

This is a **minimal, bare-bones test page** created to isolate and diagnose issues with the AR viewer and 3D model loading. It contains **only** the essential model-viewer component without any additional features, styling, or complex JavaScript.

## When to Use This Page

Use this test page when:
- The main AR page (`/ar-produktvisualisierung`) shows error messages
- You want to test if the problem is with the 3D models themselves or with the page implementation
- You need to diagnose WebGL, CDN blocking, or model file loading issues
- You want a simple, clean test environment

## How to Access

### 1. Start the Backend Server

```bash
cd backend
npm install
node server.js
```

The server will start on port 3000.

### 2. Open the Test Page

**On Desktop:**
- Navigate to: `http://localhost:3000/ar-test-minimal`

**On Mobile (same network):**
1. Find your computer's IP address:
   - **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig` (look for IPv4 Address)
2. On your mobile device, open: `http://<your-ip>:3000/ar-test-minimal`
   - Example: `http://192.168.1.100:3000/ar-test-minimal`

## What This Page Tests

The minimal test page checks:

1. ✅ **Model-Viewer Library Loading**
   - Shows if the CDN (jsdelivr.net) is accessible
   - Detects ad-blocker or network blocking

2. ✅ **3D Model File Loading**
   - Tests if `Maschine-Kopie.glb` can be loaded
   - Shows loading progress percentage
   - Displays specific error messages

3. ✅ **WebGL Support**
   - Detects WebGL context issues
   - Provides specific solutions for WebGL problems

4. ✅ **AR Capability**
   - Button to test AR activation on mobile devices

## Understanding the Results

### ✅ Success: Model Loads
If you see:
- Green status message: "3D-Modell erfolgreich geladen!"
- The 3D model appears in the viewer
- You can rotate it with your mouse/touch

**→ The models and model-viewer work fine. Problem is likely in the main page.**

### ❌ Error: CDN Blocked
If you see:
- Red message: "Model-Viewer Bibliothek konnte nicht geladen werden"
- Status shows "❌ Nein - CDN möglicherweise blockiert"

**Solutions:**
- Disable ad-blocker (uBlock Origin, AdBlock Plus, etc.)
- Disable privacy extensions (Privacy Badger, Ghostery)
- Check if CDN domains are blocked in network/firewall
- Try a different network

### ❌ Error: WebGL Problem
If you see:
- Red message: "WebGL-Problem erkannt"

**Solutions:**
- Reload the page (Ctrl+R or Cmd+R)
- Clear browser cache
- Restart the browser
- Try a different browser (Chrome recommended)
- Check if hardware acceleration is enabled in browser settings

### ❌ Error: Model File Not Found
If you see:
- Red message: "Modell konnte nicht geladen werden"
- Error mentions 404 or file not found

**Solutions:**
- Ensure backend server is running (`cd backend && node server.js`)
- Check that `Maschine-Kopie.glb` exists in the root directory
- Verify file permissions

## Comparison with Main AR Page

| Feature | Main AR Page (`/ar-produktvisualisierung`) | Minimal Test Page (`/ar-test-minimal`) |
|---------|-------------------------------------------|---------------------------------------|
| Purpose | Production AR experience | Diagnostic/testing only |
| Styling | Full branding, complex CSS | Minimal, functional styling |
| Features | Video, animations, custom AR button | Basic model viewer only |
| JavaScript | Complex error handling, tracking | Simple status reporting |
| Best for | End users | Debugging issues |

## Next Steps After Testing

### If minimal page works but main page doesn't:
- The issue is in the main page's implementation
- Check JavaScript conflicts
- Review CSS that might hide the model viewer
- Look for console errors specific to the main page

### If minimal page also fails:
- The issue is with model files, CDN access, or browser compatibility
- Follow the specific error message solutions above
- Try on a different device/browser
- Check network/firewall settings

## Files Involved

- **HTML Page**: `/ar-test-minimal.html`
- **Backend Route**: Added to `/backend/server.js` (line ~102)
- **3D Models**: 
  - `/Maschine-Kopie.glb` (GLB format, ~50MB)
  - `/Maschine-Kopie.usdz` (USDZ format for iOS)

## Technical Details

- **Model-Viewer Version**: 3.5.0 (pinned for stability)
- **CDN**: jsdelivr.net
- **AR Modes**: webxr, scene-viewer, quick-look
- **Supported Browsers**: Chrome, Safari (iOS), Edge
- **Mobile AR**: iOS Safari, Android Chrome

---

**Created**: January 4, 2026
**Purpose**: Isolate and diagnose AR viewer issues
