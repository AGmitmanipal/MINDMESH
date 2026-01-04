import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('extension');
const destDir = path.resolve('dist/extension');
const publicDir = path.resolve('public');

const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.js',
];

const assetsToCopy = [
  'favicon.svg',
  'icon.svg',
  'placeholder.svg',
];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

filesToCopy.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/extension`);
  } else {
    console.warn(`Warning: ${file} not found in extension/`);
  }
});

assetsToCopy.forEach(file => {
  const src = path.join(publicDir, file);
  // Copy as both original name and icon.svg for manifest consistency
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} from public/ to dist/extension`);
    
    if (file === 'favicon.svg') {
      fs.copyFileSync(src, path.join(destDir, 'icon.svg'));
      console.log(`Copied ${file} as icon.svg to dist/extension`);
    }
  } else {
    console.warn(`Warning: ${file} not found in public/`);
  }
});
