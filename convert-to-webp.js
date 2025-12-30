#!/usr/bin/env node

/**
 * Node.js script to convert PNG/JPEG images to WebP format
 * Requires: sharp package (install via: npm install sharp)
 * 
 * Usage: node convert-to-webp.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp package is not installed.');
  console.log('\nInstall it with: npm install sharp');
  console.log('Or use the shell script: ./convert-to-webp.sh');
  process.exit(1);
}

const quality = 80; // Quality setting (0-100)
let converted = 0;
let skipped = 0;
let failed = 0;

async function convertToWebP(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);
  const webpPath = path.join(path.dirname(filePath), `${baseName}.webp`);

  // Skip if WebP already exists
  if (fs.existsSync(webpPath)) {
    console.log(`⏭️  Skipping: ${path.basename(filePath)} (WebP already exists)`);
    skipped++;
    return;
  }

  try {
    await sharp(filePath)
      .webp({ quality })
      .toFile(webpPath);
    
    console.log(`✅ Converted: ${path.basename(filePath)} → ${baseName}.webp`);
    converted++;
  } catch (error) {
    console.error(`❌ Failed: ${path.basename(filePath)} - ${error.message}`);
    failed++;
  }
}

async function main() {
  console.log('🚀 Starting WebP conversion...\n');

  const files = fs.readdirSync('.');
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log('No PNG/JPEG images found in current directory.');
    return;
  }

  // Convert all images
  for (const file of imageFiles) {
    await convertToWebP(file);
  }

  console.log('\n✨ Conversion complete!');
  console.log(`   Converted: ${converted} files`);
  console.log(`   Skipped: ${skipped} files`);
  if (failed > 0) {
    console.log(`   Failed: ${failed} files`);
  }
}

main().catch(console.error);



