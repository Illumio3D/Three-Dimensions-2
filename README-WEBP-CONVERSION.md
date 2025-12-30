# WebP Image Conversion Guide

This guide will help you convert your PNG/JPEG images to WebP format for better performance.

## Option 1: Using the Shell Script (macOS/Linux)

1. **Install WebP tools:**
   ```bash
   brew install webp
   ```

2. **Make the script executable:**
   ```bash
   chmod +x convert-to-webp.sh
   ```

3. **Run the script:**
   ```bash
   ./convert-to-webp.sh
   ```

## Option 2: Using Node.js Script

1. **Install sharp package:**
   ```bash
   npm install sharp
   ```

2. **Run the script:**
   ```bash
   node convert-to-webp.js
   ```

## Option 3: Online Tools (No Installation Required)

1. **Squoosh** (Recommended):
   - Visit: https://squoosh.app/
   - Upload your images
   - Select WebP format
   - Download the converted files
   - Place them in the same directory as originals

2. **CloudConvert**:
   - Visit: https://cloudconvert.com/png-to-webp
   - Upload and convert
   - Download WebP files

## Option 4: Using ImageMagick

If you have ImageMagick installed:

```bash
for img in *.png; do
  magick "$img" -quality 80 "${img%.png}.webp"
done
```

## Images That Need Conversion

Based on your HTML files, these images need WebP versions:

### index.html
- `Machine-auf-tisch-weiter-rechts.png`
- `Tisch bild wix schräg.png`
- `ExplodedView.png`
- `Lippenstift No1.png`

### Details-durch-3D.html
- `Top plate transparent.png`
- `lüfter view transparent.png`
- `ExplodedView.png`
- `Top plate schräg oben view.png`
- `Heat distribution vor pfeilen.png`
- `Lüfter view lila boden.png`
- `Exploded-View.png`

### Three-Dimensions-Anfrageformular.html
- `Wechat2.png`
- `Linkedin2.png`
- `Instagram2.png`

## Notes

- The HTML is already set up with `<picture>` elements
- Once you create the `.webp` files, browsers will automatically use them
- Original PNG/JPEG files remain as fallbacks for older browsers
- WebP typically reduces file size by 25-35% with the same visual quality



