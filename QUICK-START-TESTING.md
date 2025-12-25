# Quick Start Guide - Testing Your Video Fixes

## 🎯 What Was Fixed

1. ✅ **Safari transparent videos** - Already working (HEVC files properly implemented)
2. ✅ **Chrome video autoplay** - Videos now play only when scrolled into view
3. ✅ **Development server** - Easy local testing on any device

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Development Server

**On Mac/Linux:**
```bash
cd /path/to/Three-Dimensions-2
./start-dev-server.sh
```

**On Windows:**
```bash
cd C:\path\to\Three-Dimensions-2
python -m http.server 8000
```

You'll see output like:
```
Starting HTTP server on port 8000...
Access the website from:
  Local:    http://localhost:8000
  Network:  http://192.168.1.100:8000    <- Use this on your iPhone
```

### Step 2: Test on Chrome (Desktop)

1. Open Chrome: `http://localhost:8000/3D-Renderings-fuer-Shops.html`
2. **Watch for**: Videos should NOT play when page loads ✓
3. **Scroll down** to the lipstick containers
4. **Watch for**: Videos should automatically play when visible ✓

### Step 3: Test on Safari (iPhone)

1. **Connect iPhone** to the same WiFi as your computer
2. **Open Safari** on iPhone
3. **Type this URL**: `http://192.168.1.100:8000/3D-Renderings-fuer-Shops.html`
   *(Replace `192.168.1.100` with the IP shown in your terminal)*
4. **Scroll to lipstick videos**
5. **Watch for**: Videos should have **transparent backgrounds** (not black) ✓

## 📱 If You Can't Connect from iPhone

1. **Check WiFi**: Make sure both devices are on the SAME WiFi network
2. **Check IP**: Use the exact IP address shown in the terminal
3. **Try different port**: If port 8000 is blocked, try 8080:
   ```bash
   python3 -m http.server 8080
   ```

## 🧪 Advanced Testing (Optional)

Use the test page for easier verification:
```
http://localhost:8000/test-video-scroll.html
```

This shows:
- All 3 videos with status indicators
- Real-time playback status
- Browser compatibility info

## ✅ What Success Looks Like

### Chrome Desktop:
- ❌ Videos DO NOT play on page load
- ✅ Videos DO play when scrolled into view
- ✅ Videos play smoothly in sequence

### Safari iPhone:
- ✅ Videos show transparent backgrounds (not black)
- ✅ Smooth edges with no black box around video
- ✅ Background shows through the video

## 📚 Need More Help?

See these detailed guides:
- **`DEV-SERVER-GUIDE.md`** - Comprehensive server setup guide
- **`IMPLEMENTATION-SUMMARY-VIDEO-FIXES.md`** - Full technical details
- **`SAFARI-VIDEO-GUIDE.md`** - Safari video troubleshooting

## 🐛 Troubleshooting Quick Fixes

**Videos still play on page load (Chrome)?**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache

**Videos still black on Safari (iPhone)?**
- Check Safari version (need iOS 13+ or macOS 10.15+)
- Verify HEVC files are in the same folder
- Check browser console for errors

**Can't connect from iPhone?**
- Different WiFi networks? Connect to same network
- Firewall blocking? Temporarily disable or allow port 8000
- Wrong IP address? Double-check the IP shown in terminal

## 🎉 When Everything Works

1. **Stop the server**: Press `Ctrl+C` in the terminal
2. **Commit your changes**: Already done! ✓
3. **Test on staging**: If you have one
4. **Merge to main**: When ready for production
5. **Deploy**: Push to your hosting service

## ⚡ One-Line Commands

**Start server (Mac/Linux):**
```bash
./start-dev-server.sh
```

**Start server (Windows):**
```bash
python -m http.server 8000
```

**Stop server:**
```
Ctrl+C
```

---

**Questions?** Check the detailed guides or open an issue on GitHub.

**Everything working?** Merge the `copilot/fix-video-background-issues` branch to `main`!
