const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/components', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Reverse glassmorphism utilities from contrast-base/ back to white/
    content = content.replace(/bg-contrast-base\//g, 'bg-white/');
    content = content.replace(/border-contrast-base\//g, 'border-white/');
    content = content.replace(/divide-contrast-base\//g, 'divide-white/');
    // Just in case hover variants:
    content = content.replace(/hover:bg-contrast-base\//g, 'hover:bg-white/');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Reverted glass in', filePath);
    }
  }
});
