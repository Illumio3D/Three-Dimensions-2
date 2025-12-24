// Simple script to sync header and footer from index.html to all other pages.
// Run this script whenever you update the header or footer in index.html.
// Usage: node sync-header-footer.js
//
// NOTE: After running this script, you can delete it if you want - 
// the website will work fine without it. You only need this script 
// when you want to update the header/footer in the future.

const fs = require('fs');

// Read index.html as the source
const indexContent = fs.readFileSync('index.html', 'utf8');

// Extract header (from <header> to </header>)
const headerMatch = indexContent.match(/<header>[\s\S]*?<\/header>/);
if (!headerMatch) {
  console.error('Error: Could not find <header> in index.html');
  process.exit(1);
}
const header = headerMatch[0];

// Extract footer (from <footer> to </footer> plus WeChat modal)
// Match footer, then skip any script tags, then match WeChat modal
const footerMatch = indexContent.match(/<footer>[\s\S]*?<\/footer>[\s\S]*?<!-- WeChat QR Code Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/body>/);
if (!footerMatch) {
  console.error('Error: Could not find <footer> in index.html');
  process.exit(1);
}
// Remove the </body> tag from the match
const footer = footerMatch[0].replace(/<\/body>$/, '');

// List of HTML files to update (excluding index.html itself)
const htmlFiles = [
  'Details-durch-3D.html',
  'ar-produktvisualisierung.html',
  '3D-Renderings-fuer-Shops.html',
  'Three-Dimensions-Anfrageformular.html',
  'Ueber-Mich.html',
  'Impressum.html',
  'Datenschutz.html',
  'Interaktives-AR-Umfeld.html'
];

let updatedCount = 0;

htmlFiles.forEach(filename => {
  if (!fs.existsSync(filename)) {
    console.log(`Skipping ${filename} - file not found`);
    return;
  }

  let content = fs.readFileSync(filename, 'utf8');

  // Replace header (match any existing header)
  content = content.replace(/<header>[\s\S]*?<\/header>/, header);

  // Replace footer (match footer, skip script tags, then match WeChat modal)
  content = content.replace(/<footer>[\s\S]*?<\/footer>[\s\S]*?<!-- WeChat QR Code Modal -->[\s\S]*?<\/div>\s*<\/div>\s*(?=<\/body>)/, footer);

  // Also replace placeholder divs if they exist
  content = content.replace(/<div id="header-placeholder"><\/div>/, header);
  content = content.replace(/<div id="footer-placeholder"><\/div>[\s\S]*?<script src="load-header-footer\.js"><\/script>/, footer);

  fs.writeFileSync(filename, content, 'utf8');
  updatedCount++;
  console.log(`✓ Updated ${filename}`);
});

console.log(`\nDone! Updated ${updatedCount} files.`);
console.log('\nTo use: Edit header/footer in index.html, then run: node sync-header-footer.js');
console.log('Note: You can delete this script after final updates - the website works without it!');

