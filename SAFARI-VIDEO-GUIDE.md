# Safari Transparent Video Support (Alpha) – Solutions & Recommendations

## 1) Safari’s Alpha-Transparency Support (What Works / What Doesn’t)
- Safari (macOS + iOS) **does not render WebM VP9 alpha** – it falls back to opaque playback, producing the black background you’re seeing.
- Safari **does render HEVC/H.265 with alpha** when the file is properly encoded:
  - Container: `.mov` or `.mp4` with the **`hvc1`** tag
  - Pixel format: **`yuva420p`** (or `yuva444p10le` for higher quality)
  - Hardware support exists on **iOS 13+ / iPadOS 13+ / macOS 11+ (Safari 14+)**. Older Safari versions will ignore the alpha channel.
- ProRes 4444 retains alpha but is huge and may not play efficiently on the web; prefer HEVC with alpha for Safari.

## 2) Recommended Codec, Container & Encoding Settings for Safari
Use HEVC with alpha and make sure the `hvc1` brand is present (Finder’s HEVC export often omits this tag, which breaks Safari). Re-encode your ProRes 4444 master with FFmpeg:

```bash
# HEVC with alpha (Safari-ready)
ffmpeg -i "input_prores_4444.mov" \
  -c:v hevc -tag:v hvc1 \               # hvc1 ensures Safari picks the HEVC track
  -pix_fmt yuva420p \                   # 8-bit with alpha; use yuva444p10le for higher fidelity
  -alpha_quality 0.75 \                 # tunes alpha compression; lower = higher quality
  -b:v 2.5M \                           # adjust to balance quality/file size
  "output-hevc-alpha.mov"
```

**Browser source order recommendation**
1. WebM VP9 with alpha (Chrome/Firefox/Edge)
2. HEVC with alpha (`hvc1`) for Safari
3. (Optional) Plain MP4/H.264 fallback without alpha, or a PNG/WebP poster

## 3) Cross-Browser HTML/CSS Example

```html
<style>
  .transparent-video {
    width: 100%;
    height: auto;
    background: transparent;
    mix-blend-mode: normal;
    isolation: isolate;
    display: block;
  }
</style>

<video class="transparent-video" muted playsinline preload="metadata" aria-label="Transparent product video">
  <!-- Chrome / Firefox / Edge -->
  <source src="product.webm" type='video/webm; codecs="vp9,alpha"'>
  <!-- Safari (alpha supported on iOS 13+ / macOS 11+) -->
  <source src="product-hevc.mov" type='video/mp4; codecs="hvc1"'>
  <!-- Optional opaque fallback -->
  <source src="product.mp4" type="video/mp4">
  Sorry, your browser does not support embedded videos.
</video>
```

Key points:
- Use `muted playsinline` for iOS autoplay eligibility.
- Explicit codec strings (`vp9,alpha` and `hvc1`) help Safari pick the correct track.
- Keep the WebM source first so Chromium browsers choose it; Safari will skip it and load the HEVC source.

## 4) Workarounds if Native Transparency Fails
- **WebM + HEVC fallback (recommended path):** Current site structure already does this; ensure HEVC is properly tagged (`hvc1`) and encoded with alpha.
- **PNG/APNG sequence:** Universal transparency but larger; use when alpha must be guaranteed on very old Safari.
- **Animated WebP:** Good compression; Safari 14+ only.
- **Canvas rendering of PNG sequence:** Maximum control; heavier on CPU but works everywhere.
- **Static PNG fallback:** Provide a poster image if both alpha-capable formats fail.

## 5) Safari Version Limitations & Graceful Handling
- Alpha in HEVC requires **iOS/iPadOS 13+** and **macOS 11+/Safari 14+**. Older Safari will display opaque video.
- Provide a graceful fallback: keep an opaque MP4 or a transparent PNG/APNG poster. Example:

```html
<video ... poster="product.png">
  <source src="product.webm" type='video/webm; codecs="vp9,alpha"'>
  <source src="product-hevc.mov" type='video/mp4; codecs="hvc1"'>
</video>
<noscript><img src="product.png" alt="Product preview"></noscript>
```

---

## The Problem (Current Site)

Safari browser does not fully support WebM videos with alpha channel (transparency), which are currently used on the Three Dimensions website. These transparent videos work perfectly in Chrome but fail to display transparency in Safari.

### Affected Videos
1. `Rot transparent.webm` (3D-Renderings-fuer-Shops.html)
2. `Hellrot transparent.webm` (3D-Renderings-fuer-Shops.html)
3. `Pinktransparent.webm` (3D-Renderings-fuer-Shops.html)
4. `Iphone fbegining00086400.webm` (ar-produktvisualisierung.html)

## Browser Support Overview

| Format | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| WebM (VP9) with Alpha | ✅ | ✅ | ❌ | ✅ |
| HEVC (H.265) with Alpha | ❌ | ❌ | ✅ (iOS 13+, macOS 11+) | ❌ |
| PNG Sequence | ✅ | ✅ | ✅ | ✅ |

## Implemented Temporary Solution

### What We Did
1. **Added Safari Detection**: JavaScript now detects Safari browser and handles video errors gracefully
2. **Updated Video Sources**: Added proper codec specification (`video/webm; codecs=vp9`)
3. **Error Handling**: Videos that fail to load are hidden to prevent broken displays
4. **Placeholder Comments**: Added HTML comments showing where HEVC alternatives should be placed

### Code Changes
- Updated video `<source>` tags with explicit codec declarations
- Added Safari-specific error handling in JavaScript
- Videos that can't play are hidden instead of showing broken/corrupted displays

## Recommended Long-Term Solutions

### Option 1: HEVC with Alpha Channel (BEST for Quality)

**Pros:**
- Native Safari support
- High quality
- Good compression
- Hardware acceleration on Apple devices

**Cons:**
- Not supported in Chrome/Firefox
- Requires license for encoding (included in macOS/iOS)
- Need to maintain two video versions

**How to Create:**
1. Export videos with alpha channel from your 3D software as ProRes 4444 or PNG sequence
2. Convert to HEVC with alpha using **FFmpeg** or **Apple Compressor**:

```bash
# Using FFmpeg (with HEVC encoder)
ffmpeg -i "input_with_alpha.mov" -c:v hevc -tag:v hvc1 -pix_fmt yuva420p -alpha_quality 0.75 "output_hevc.mov"

# Using Apple Compressor (macOS only)
# 1. Import your ProRes 4444 file
# 2. Choose "HEVC with Alpha" preset
# 3. Export with .mov extension
```

3. Update HTML to include both formats:
```html
<video muted playsinline preload="metadata">
  <source src="Rot transparent.webm" type="video/webm; codecs=vp9">
  <source src="Rot transparent.mov" type="video/quicktime">
</video>
```

### Option 2: Animated PNG (APNG) - Medium Quality

**Pros:**
- Universal browser support
- Transparency works everywhere
- Simple to create

**Cons:**
- Larger file sizes
- Lower compression efficiency
- May not be as smooth

**How to Create:**
```bash
# Using FFmpeg
ffmpeg -i "input_with_alpha.mov" -plays 0 "output.apng"
```

### Option 3: Animated WebP with Fallback

**Pros:**
- Good compression
- Transparency support
- Smaller than APNG

**Cons:**
- Limited Safari support (iOS 14+)
- Still need fallback

**How to Create:**
```bash
# Using FFmpeg
ffmpeg -i "input_with_alpha.mov" -c:v libwebp -quality 80 -loop 0 "output.webp"
```

### Option 4: HTML5 Canvas Animation (ADVANCED)

Use JavaScript to render PNG sequences on canvas element.

**Pros:**
- Complete control
- Universal support
- Can add interactive effects

**Cons:**
- More complex
- Higher initial load time
- Requires JavaScript

## Recommended Implementation Strategy

### For Your Website: Dual-Format Approach

**Step 1:** Convert all 4 transparent videos to HEVC with alpha channel
- Use the FFmpeg command above or Apple Compressor on macOS
- Name files same as WebM but with `.mov` extension

**Step 2:** Uncomment the Safari fallback lines in HTML files
The code already has placeholders:
```html
<!-- <source src="Rot transparent.mov" type="video/quicktime"> -->
```

Just remove the `<!--` and `-->` after creating the files.

**Step 3:** Test on Safari
- Test on Safari macOS
- Test on Safari iOS
- Verify transparency displays correctly
- Verify videos play without errors

**Step 4:** Monitor File Sizes
HEVC files should be similar or smaller than WebM files. If they're much larger, adjust quality settings.

### File Size Optimization

Current WebM file sizes:
- `Hellrot transparent.webm`: 289KB
- `Pinktransparent.webm`: 280KB
- `Rot transparent.webm`: 289KB
- `Iphone fbegining00086400.webm`: 1.7MB

Target HEVC sizes should be similar (± 50KB difference is acceptable).

## Video Conversion Commands Reference

### From ProRes 4444 to HEVC with Alpha
```bash
ffmpeg -i "source.mov" \
  -c:v hevc \
  -tag:v hvc1 \
  -pix_fmt yuva420p \
  -alpha_quality 0.75 \
  -b:v 2M \
  "output_hevc.mov"
```

### From PNG Sequence to WebM (VP9 with Alpha)
```bash
ffmpeg -framerate 30 -i "frame_%04d.png" \
  -c:v libvpx-vp9 \
  -pix_fmt yuva420p \
  -b:v 1M \
  "output.webm"
```

### From PNG Sequence to HEVC with Alpha
```bash
ffmpeg -framerate 30 -i "frame_%04d.png" \
  -c:v hevc \
  -tag:v hvc1 \
  -pix_fmt yuva420p \
  -alpha_quality 0.75 \
  -b:v 2M \
  "output_hevc.mov"
```

## Testing Checklist

After implementing HEVC videos:

- [ ] Test on Chrome (should use WebM)
- [ ] Test on Firefox (should use WebM)
- [ ] Test on Safari macOS (should use HEVC)
- [ ] Test on Safari iOS (should use HEVC)
- [ ] Test on Edge (should use WebM)
- [ ] Verify transparency displays correctly on all browsers
- [ ] Verify videos autoplay where expected
- [ ] Verify hover interactions work (3D-Renderings page)
- [ ] Check file sizes are acceptable
- [ ] Test on slow connections (preload behavior)

## Alternative: CSS-Based Approach

If video conversion is not feasible, you can create a CSS-only solution using static images:

```css
.color-container video {
  /* Hide on Safari */
}

@supports not ((-webkit-mask-image: url()) or (mask-image: url())) {
  /* Safari-specific fallback */
  .color-container {
    background: url('static-image-with-transparency.png');
  }
}
```

## Current Implementation Status

✅ Safari detection added to JavaScript  
✅ Video error handling implemented  
✅ HTML prepared with commented fallback sources  
✅ Proper video codec declarations added  
❌ HEVC videos with alpha channel (need to be created and uploaded)  
❌ Testing on Safari browsers  

## Next Steps

1. **Create HEVC videos** using FFmpeg or Apple Compressor
2. **Upload HEVC .mov files** to repository root
3. **Uncomment fallback source lines** in HTML files
4. **Test on Safari** (macOS and iOS)
5. **Optimize** quality vs. file size if needed

## Need Help?

If you need assistance with video conversion:
1. Provide the original source files (ProRes, After Effects project, or high-quality PNG sequences)
2. Use online converters like CloudConvert (supports HEVC with alpha)
3. Or reach out to a video specialist familiar with HEVC encoding

The website will work on Safari with the current error handling, but videos won't display. For the best user experience, implementing HEVC alternatives is highly recommended.
