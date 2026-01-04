# AR Viewer Troubleshooting Guide

This document provides troubleshooting steps for common issues with the AR viewer on the Three Dimensions website.

## Common Issues and Solutions

### Issue 1: 3D Model Not Loading (Shows "🔄 Wird geladen..." indefinitely)

**Symptoms:**
- Page shows loading spinner forever
- Model never appears
- Console shows no specific errors

**Possible Causes:**

1. **File Names with Spaces (FIXED in this PR)**
   - Previously, model files had spaces in their names (`Maschine Kopie.glb`)
   - Spaces in filenames cause issues with some web servers, especially Python's SimpleHTTPServer
   - **Solution:** Files have been renamed to use hyphens instead (`Maschine-Kopie.glb`)

2. **Model-Viewer Library Not Loading**
   - The model-viewer library from unpkg.com may be blocked
   - Common causes:
     - Ad blockers (uBlock Origin, AdBlock Plus, etc.)
     - Privacy extensions (Privacy Badger, Ghostery, etc.)
     - Corporate firewalls blocking CDN content
     - Network issues or CDN unavailability
   - **Solution:** Disable ad blockers for this site, or check network settings

### Issue 2: Error Message "Das 3D-Modell konnte nicht geladen werden"

**This is expected behavior when:**
- Ad blockers are active and blocking unpkg.com
- Network/firewall restrictions prevent CDN access
- The CDN is temporarily unavailable

**To resolve:**
1. Disable ad blocker extensions for this website
2. Check browser console for specific error messages
3. Verify network connectivity
4. Try accessing https://unpkg.com directly to check if it's blocked

### Issue 3: Videos Not Playing

**Possible Causes:**
1. Video files have spaces in names (FIXED in this PR)
2. Browser doesn't support the video codec
3. Video files missing or path incorrect

**Files that were renamed:**
- `Hero shot kafeemaschine0001-0349.mp4` → `Hero-shot-kafeemaschine0001-0349.mp4`
- `Iphone fbegining-HEVC.mov` → `Iphone-fbegining-HEVC.mov`
- `Iphone fbegining00086400.webm` → `Iphone-fbegining00086400.webm`

### Issue 4: Fonts Not Loading Correctly

**Symptoms:**
- Text appears in system fonts instead of Mandioca font
- Console shows 404 errors for font files

**Cause:**
Font files (`Mandioca.woff2`, `Mandioca.woff`) are referenced but not present in repository

**Impact:**
- Non-critical: System fonts are used as fallback
- Visual appearance may differ slightly from design

**Solution:**
- Add font files to repository, or
- Remove font-face declaration and use system fonts explicitly

## Testing Checklist

When testing AR viewer functionality:

1. ✅ Open browser console (F12)
2. ✅ Navigate to AR viewer page
3. ✅ Check for error messages in console
4. ✅ Verify model files are accessible:
   - Try accessing `http://localhost:8000/Maschine-Kopie.glb` directly
   - Should show download dialog or binary content
5. ✅ Check network tab for failed requests
6. ✅ Test with ad blockers disabled
7. ✅ Test on mobile device for AR functionality

## Development Server Setup

Use the provided development server script:

```bash
./start-dev-server.sh
```

This starts a Python HTTP server on port 8000 that serves all files correctly.

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

## Recent Fixes (January 2026)

- ✅ Renamed all model files to remove spaces from filenames
- ✅ Renamed video files to remove spaces
- ✅ Added comprehensive error handling for CDN failures
- ✅ Added user-friendly error messages in German
- ✅ Improved code quality (extracted magic numbers, added comments)

## Contact

For further assistance, contact: kontakt@three-dimensions.de
