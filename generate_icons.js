import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'favicon.svg'));

async function generate() {
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-192x192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), 'public', 'icon-512x512.png'));
    
  console.log('Icons generated successfully.');
}

generate();
