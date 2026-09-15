const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');

// Approximate the SVG with canvas to eyeball the geometry (strokes + emblem path).
// The Path string is SVG arc/bezier based; @napi-rs/canvas supports Path2D with SVG strings.
const { Path2D } = require('@napi-rs/canvas');

const W = 900, H = 480, SCALE = 3; // viewBox 0 0 300 160 scaled x3
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// dark green sidebar bg
ctx.fillStyle = '#075247';
ctx.fillRect(0, 0, W, H);

ctx.save();
ctx.scale(SCALE, SCALE);

const stroke = '#FFFFFF';
ctx.strokeStyle = stroke;
ctx.lineWidth = 9;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// خ
ctx.beginPath();
ctx.moveTo(150, 118);
ctx.lineTo(150, 46);
ctx.quadraticCurveTo(150, 38, 142, 38);
ctx.lineTo(128, 38);
ctx.stroke();

// ا
ctx.beginPath();
ctx.moveTo(104, 118);
ctx.lineTo(104, 34);
ctx.stroke();

// ن
ctx.beginPath();
ctx.moveTo(78, 92);
ctx.quadraticCurveTo(78, 118, 52, 118);
ctx.lineTo(40, 118);
ctx.quadraticCurveTo(20, 118, 20, 98);
ctx.lineTo(20, 84);
ctx.stroke();

// KHAN text
ctx.fillStyle = '#FFFFFF';
ctx.font = '300 21px Arial';
ctx.textAlign = 'center';
// canvas has no letterSpacing in this lib; draw spaced manually
const letters = 'KHAN'.split('');
const spacing = 24;
let lx = 86 - ((letters.length - 1) * spacing) / 2;
for (const ch of letters) {
  ctx.fillText(ch, lx, 150);
  lx += spacing;
}

// divider
ctx.fillStyle = 'rgba(255,255,255,0.5)';
ctx.fillRect(188, 34, 1.6, 98);

// emblem
const emb = new Path2D(
  'M53 68c15-34 48-46 78-27 11 7 21 10 33 13 14 4 19 17 13 31-3 8-9 12-18 14-31 5-58 10-78 27-19 16-18 46 1 60 22 17 60 10 81-10 12-11 22-28 29-25 8 4-13 47-43 65-38 22-91 11-115-25-23-36-12-78 25-101 13-8 29-13 47-15 8-1 11-4 8-7-9-8-35-7-61 2-13 5-24 11-30 5-7-7-3-23 0-27Z'
);
ctx.save();
ctx.translate(214, 34);
ctx.scale(0.42, 0.42);
ctx.fillStyle = '#FFFFFF';
ctx.fill(emb);
ctx.restore();

// emblem dots
function dot(cx, cy, r, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
dot(214 + 82 * 0.42, 34 + 22 * 0.42, 12 * 0.42, '#179B7D');
dot(214 + 154 * 0.42, 34 + 78 * 0.42, 9 * 0.42, '#F7B531');

ctx.restore();
fs.writeFileSync('C:/Users/USER/Desktop/Khan/.pdf-extract/logo-preview.png', canvas.toBuffer('image/png'));
console.log('wrote logo-preview.png', W, H);
