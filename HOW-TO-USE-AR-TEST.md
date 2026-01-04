# How to Use the New AR Test Page

Hi! I've created a **minimal AR test page** specifically for you to diagnose the issue with your AR viewer. Here's what you need to know:

## Quick Start

1. **Start your backend server** (as you're already doing):
   ```bash
   cd backend
   node server.js
   ```

2. **Open the test page** in your browser:
   - **Desktop/Laptop**: `http://localhost:3000/ar-test-minimal`
   - **Mobile (same WiFi)**: `http://192.168.x.x:3000/ar-test-minimal` (use your computer's IP)

## What This Page Does

This is a **super simple page** with:
- ✅ ONLY the model-viewer component
- ✅ Clear error messages that tell you exactly what's wrong
- ✅ Status indicators for each potential issue
- ❌ NO complex JavaScript
- ❌ NO fancy styling or animations
- ❌ NO extra features

## What You'll See

### Scenario 1: Everything Works ✅
If the 3D model loads and you can rotate it:
- **Conclusion**: The models and viewer work fine!
- **Next step**: The problem is in your main AR page (`ar-produktvisualisierung.html`), not with the models

### Scenario 2: CDN Blocked ❌
If you see: "Model-Viewer Bibliothek konnte nicht geladen werden"
- **Problem**: Ad-blocker or network is blocking `jsdelivr.net`
- **Solution**: 
  - Disable ad-blocker for localhost
  - Disable privacy extensions
  - Try different browser

### Scenario 3: WebGL Problem ❌
If you see: "WebGL-Problem erkannt"
- **Problem**: Browser WebGL issue (common on Safari)
- **Solutions**:
  - Reload page (Cmd+R)
  - Clear Safari cache
  - Restart Safari
  - Try Chrome instead

### Scenario 4: Model File Not Found ❌
If you see: "Modell konnte nicht geladen werden" with 404 error
- **Problem**: Server can't find the `.glb` file
- **Solution**: Make sure `Maschine.glb` is in the root directory

## Why This Helps

By testing with this minimal page, you can:
1. **Isolate the problem**: Is it the models/viewer or the main page?
2. **Get specific error messages**: Know exactly what's failing
3. **Test easily**: No distractions from other page elements

## Files I Created

1. **`ar-test-minimal.html`** - The test page itself
2. **`AR-TEST-MINIMAL-README.md`** - Full technical documentation
3. Updated **`backend/server.js`** - Added route for the new page

## Next Steps After Testing

1. **Test the minimal page** and see what happens
2. **Look at the status messages** on the page
3. **Based on what you see**, you'll know:
   - If it works → Problem is in main page code
   - If it fails → Problem is with models, CDN, or browser

Let me know what you see when you open `http://localhost:3000/ar-test-minimal`!

---

**Note**: The page works on both desktop and mobile. On mobile, you can also test the AR functionality with the "In AR ansehen" button.
