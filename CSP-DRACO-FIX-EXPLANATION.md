# CSP Draco Decoder Fix - Explanation

## Problem Summary

The AR viewer on the Three Dimensions website was failing to load 3D models in Safari (and potentially other browsers), showing the error message "Das Modell konnte nicht geladen werden" (The model could not be loaded) almost instantly after page load.

## Root Cause Analysis

### Safari Error Messages (from Dev Console)

```
[Error] Refused to connect to https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js 
because it does not appear in the connect-src directive of the Content Security Policy.

[Error] Refused to connect to https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm 
because it does not appear in the connect-src directive of the Content Security Policy.

[Error] TypeError: Load failed
[Error] model-viewer error event: {type: "loadfailure", sourceError: TypeError: undefined is not an object (evaluating 'this[Xg].scene')}
```

### What is Draco?

Draco is a compression library developed by Google that significantly reduces the size of 3D models. The `@google/model-viewer` library uses Draco to decompress GLB files that have been compressed with Draco encoding.

### Why the Model Failed to Load

1. The Maschine.glb file (~50MB) is likely compressed with Draco encoding
2. Model-viewer attempts to load the Draco decoder from Google's CDN at `https://www.gstatic.com`
3. The Content Security Policy (CSP) configured in `backend/config.js` did **not** include `https://www.gstatic.com` in the allowed sources
4. The browser blocked the Draco decoder from loading due to CSP violation
5. Without the decoder, model-viewer could not decompress the GLB file
6. This resulted in an instant loading failure

## The Fix

### Changed File: `backend/config.js`

Added `https://www.gstatic.com` to two CSP directives:

```javascript
const csp = {
  directives: {
    // ... other directives ...
    scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", 
                "https://ajax.googleapis.com", "https://www.gstatic.com", "blob:"],  // ← Added gstatic.com
    connectSrc: ["'self'", "https://unpkg.com", "https://cdn.jsdelivr.net", 
                 "https://ajax.googleapis.com", "https://www.gstatic.com", "blob:", "data:"],  // ← Added gstatic.com
    // ... other directives ...
  }
};
```

### Why Both Directives?

- **`scriptSrc`**: Allows loading the Draco WASM wrapper JavaScript file (`draco_wasm_wrapper.js`)
- **`connectSrc`**: Allows fetching the Draco decoder WASM binary (`draco_decoder.wasm`)

Both are required for the Draco decoder to function properly.

## Verification

After the fix, the CSP header now includes:

```
Content-Security-Policy: 
  script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net 
             https://ajax.googleapis.com https://www.gstatic.com blob:;
  connect-src 'self' https://unpkg.com https://cdn.jsdelivr.net 
              https://ajax.googleapis.com https://www.gstatic.com blob: data:;
  ...
```

## Testing Instructions

1. **Start the server:**
   ```bash
   cd backend
   npm start
   ```

2. **Open in Safari or Chrome:**
   ```
   http://localhost:3000/ar-produktvisualisierung
   ```

3. **Verify no CSP errors:**
   - Open Developer Tools (Cmd+Option+I on Mac)
   - Check Console tab
   - Should NOT see "Refused to connect to https://www.gstatic.com"

4. **Verify model loads:**
   - The 3D coffee machine model should appear within 5-10 seconds
   - Loading spinner should disappear
   - Model should be interactive (rotate, zoom, etc.)

## Related Issues

### Mandioca Font Files (404 errors)

These are **non-critical** errors that don't affect AR viewer functionality:
- The font files don't exist on the server
- CSS includes fallback fonts (Helvetica, Arial)
- The `@font-face` declaration uses `local('Mandioca')` first, checking for locally installed fonts
- Text displays correctly using fallback fonts

## Impact

This fix resolves the instant model loading failure in Safari and other browsers that strictly enforce CSP policies. Users should now be able to:

1. Load the AR viewer page without CSP errors
2. See the 3D model load successfully
3. Interact with the 3D model (rotate, zoom, pan)
4. Use the AR functionality on mobile devices

## Future Considerations

1. **Model Optimization**: Consider reducing the GLB file size if possible
2. **Font Files**: Either add the Mandioca font files or remove the @font-face declarations
3. **CSP Monitoring**: Monitor browser console for any new CSP violations as the site evolves
4. **Production Testing**: Test on actual iOS and Android devices to verify AR functionality

## References

- [Google Draco 3D Compression](https://google.github.io/draco/)
- [Model-Viewer Documentation](https://modelviewer.dev/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
