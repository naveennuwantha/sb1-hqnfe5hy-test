const fs = require('fs');
const { createCanvas } = require('canvas');

// Create favicon.png
const faviconCanvas = createCanvas(32, 32);
const faviconCtx = faviconCanvas.getContext('2d');

// Draw background
faviconCtx.fillStyle = '#0066cc';
faviconCtx.fillRect(0, 0, 32, 32);

// Draw text
faviconCtx.fillStyle = '#ffffff';
faviconCtx.font = 'bold 16px Arial';
faviconCtx.textAlign = 'center';
faviconCtx.textBaseline = 'middle';
faviconCtx.fillText('SH', 16, 16);

// Save favicon
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/favicon.png', faviconBuffer);

// Create icon.png (512x512)
const iconCanvas = createCanvas(512, 512);
const iconCtx = iconCanvas.getContext('2d');

// Draw background
iconCtx.fillStyle = '#0066cc';
iconCtx.fillRect(0, 0, 512, 512);

// Draw text
iconCtx.fillStyle = '#ffffff';
iconCtx.font = 'bold 200px Arial';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('SH', 256, 256);

// Save icon
const iconBuffer = iconCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/icon.png', iconBuffer);

// Create splash.png (1242x2436)
const splashCanvas = createCanvas(1242, 2436);
const splashCtx = splashCanvas.getContext('2d');

// Draw white background
splashCtx.fillStyle = '#ffffff';
splashCtx.fillRect(0, 0, 1242, 2436);

// Draw logo
splashCtx.fillStyle = '#0066cc';
splashCtx.font = 'bold 120px Arial';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('SkillHub', 621, 1218);

// Save splash
const splashBuffer = splashCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/splash.png', splashBuffer);

// Create adaptive-icon.png (108x108)
const adaptiveCanvas = createCanvas(108, 108);
const adaptiveCtx = adaptiveCanvas.getContext('2d');

// Draw background
adaptiveCtx.fillStyle = '#0066cc';
adaptiveCtx.fillRect(0, 0, 108, 108);

// Draw text
adaptiveCtx.fillStyle = '#ffffff';
adaptiveCtx.font = 'bold 54px Arial';
adaptiveCtx.textAlign = 'center';
adaptiveCtx.textBaseline = 'middle';
adaptiveCtx.fillText('SH', 54, 54);

// Save adaptive icon
const adaptiveBuffer = adaptiveCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/adaptive-icon.png', adaptiveBuffer); 