const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');

// Render "خان" in every locally-available Cairo weight so we can compare the
// reference wordmark against a real font instead of guessing.
const CAIRO_DIR = 'C:/Users/USER/Desktop/Khan/mobile/node_modules/@expo-google-fonts/cairo';
const OPTIONS = [
  ['200ExtraLight', 'Cairo_200ExtraLight'],
  ['300Light', 'Cairo_300Light'],
  ['400Regular', 'Cairo_400Regular'],
  ['500Medium', 'Cairo_500Medium'],
  ['600SemiBold', 'Cairo_600SemiBold'],
  ['700Bold', 'Cairo_700Bold'],
  ['800ExtraBold', 'Cairo_800ExtraBold'],
  ['900Black', 'Cairo_900Black'],
];

for (const [dir, name] of OPTIONS) {
  GlobalFonts.registerFromPath(`${CAIRO_DIR}/${dir}/${name}.ttf`, name);
}
console.log('families:', GlobalFonts.families.filter((f) => /Cairo/i.test(f.family)).map((f) => f.family).join(', '));

const W = 1400;
const H = OPTIONS.length * 220;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#075247';
ctx.fillRect(0, 0, W, H);

const FONT_SIZE = 150;
OPTIONS.forEach(([, name], i) => {
  const top = i * 220;
  ctx.fillStyle = '#2E8F7C';
  ctx.fillRect(0, top, W, 2);
  ctx.fillStyle = '#9BD5C6';
  ctx.font = `24px ${name}`;
  ctx.fillText(`${name}`, 20, top + 36);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${FONT_SIZE}px ${name}`;
  // Arabic must be shaped RTL: خان = khaa + alef + noon
  ctx.fillText('\u062E\u0627\u0646', 30, top + 175);
  ctx.save();
  ctx.font = `40px ${name}`;
  ctx.fillStyle = '#F7B531';
  ctx.fillText('K H A N', 780, top + 130);
  ctx.restore();
});

fs.writeFileSync('C:/Users/USER/Desktop/Khan/.pdf-extract/cairo-weights.png', canvas.toBuffer('image/png'));
console.log('wrote cairo-weights.png', W, H);