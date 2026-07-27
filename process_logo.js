import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));

async function generateAllIcons() {
  console.log('Generating PWA icons...');
  // PWA Icons
  await sharp(logoBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192x192.png'));

  await sharp(logoBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512x512.png'));
    
  // Favicon (32x32)
  console.log('Generating favicon...');
  await sharp(logoBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'favicon.png'));
    
  // Apple Touch Icon (180x180)
  console.log('Generating apple touch icon...');
  await sharp(logoBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));

  console.log('All icons generated successfully!');
}

generateAllIcons();
