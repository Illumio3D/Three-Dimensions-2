# Development Server Setup Guide

This guide explains how to run a local development server to test the Three Dimensions website on your computer and mobile devices (iPhone, iPad, etc.) without merging changes to the main branch.

## Quick Start

### For macOS/Linux Users

1. Open Terminal
2. Navigate to the project directory:
   ```bash
   cd /path/to/Three-Dimensions-2
   ```
3. Make the script executable (first time only):
   ```bash
   chmod +x start-dev-server.sh
   ```
4. Run the server:
   ```bash
   ./start-dev-server.sh
   ```

### For Windows Users

1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```cmd
   cd C:\path\to\Three-Dimensions-2
   ```
3. Run the server:
   ```cmd
   python -m http.server 8000
   ```
   or if you have Python 3:
   ```cmd
   python3 -m http.server 8000
   ```

## Accessing the Website

### On Your Computer
Once the server is running, open your web browser and go to:
- **http://localhost:8000**

### On Your iPhone/iPad (Same WiFi Network)

1. **Find Your Computer's Local IP Address:**
   
   The `start-dev-server.sh` script will display it automatically. It will look something like:
   - `192.168.1.xxx` or `10.0.0.xxx`
   
   Or find it manually:
   - **macOS**: Open Terminal, run `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: Open Command Prompt, run `ipconfig` and look for IPv4 Address
   - **Linux**: Open Terminal, run `hostname -I`

2. **Make Sure Both Devices Are on the Same WiFi Network:**
   - Your computer and iPhone must be connected to the same WiFi

3. **Open Safari on Your iPhone:**
   - Type in the address bar: `http://YOUR_IP_ADDRESS:8000`
   - For example: `http://192.168.1.100:8000`

4. **Test the website:**
   - Navigate through the pages
   - Test the transparent videos on Safari
   - Check video playback behavior
   - Test responsive design on mobile

## Testing Different Scenarios

### Test Safari Video Transparency
1. Navigate to `http://YOUR_IP:8000/3D-Renderings-fuer-Shops.html` on Safari (iPhone)
2. Scroll down to the lipstick color containers
3. Verify that the transparent videos display with a transparent background (not black)

### Test Chrome Video Playback
1. Navigate to `http://YOUR_IP:8000/3D-Renderings-fuer-Shops.html` on Chrome
2. The lipstick videos should NOT play when the page loads
3. Scroll down until the color containers come into view
4. Videos should automatically play when they become visible

### Test AR Features
1. Navigate to `http://YOUR_IP:8000/ar-produktvisualisierung.html`
2. Test the iPhone AR demo video transparency
3. Verify it works correctly on Safari

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Cannot Connect from iPhone

**Issue**: iPhone shows "Cannot connect to server"

**Solutions**:
1. Verify both devices are on the same WiFi network
2. Check if your computer's firewall is blocking port 8000:
   - **macOS**: System Preferences → Security & Privacy → Firewall → Firewall Options
   - **Windows**: Windows Defender Firewall → Allow an app
3. Try using a different port (e.g., 8080):
   ```bash
   python3 -m http.server 8080
   ```

### Server Not Starting

**Issue**: "Address already in use" error

**Solution**: Port 8000 is already in use. Use a different port:
```bash
python3 -m http.server 8080
```

### Videos Not Playing

**Issue**: Videos show a black screen or don't play

**Solution**:
1. Check browser console for errors (Safari: Settings → Advanced → Web Inspector)
2. Verify video files exist in the project directory
3. Check network connection speed (videos may be loading slowly)

## Alternative: Using Node.js (if installed)

If you have Node.js installed, you can use `npx` to run a server:

```bash
npx http-server -p 8000
```

Or install a more feature-rich server:

```bash
npm install -g live-server
live-server --port=8000
```

Live-server has the advantage of auto-reloading when you make changes to files.

## Making Changes While Server Is Running

1. Keep the server running in one terminal window
2. Make changes to HTML, CSS, or JS files in your code editor
3. Refresh the browser to see changes (or use live-server for auto-reload)
4. Test on both desktop and mobile

## Security Note

⚠️ **Important**: This development server is for local testing only and should NOT be exposed to the internet. It's only accessible to devices on your local network.

## Next Steps After Testing

Once you've tested your changes and confirmed they work:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. Push to your branch (not main):
   ```bash
   git push origin your-branch-name
   ```

3. Create a pull request on GitHub

4. After review, merge to main branch

## Additional Resources

- [Python HTTP Server Documentation](https://docs.python.org/3/library/http.server.html)
- [Testing on Real Devices](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)
- [Safari Web Inspector Guide](https://developer.apple.com/safari/tools/)
