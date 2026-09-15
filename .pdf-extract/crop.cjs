const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

const SRC = 'C:/Users/USER/Desktop/Khan/.pdf-extract/img_42.jpg';
const OUT = 'C:/Users/USER/Desktop/Khan/mobile/assets/empty-basket.jpg';
const PREVIEW = 'C:/Users/USER/Desktop/Khan/.pdf-extract/empty-basket-preview.png';

(async () => {
  const img = await loadImage(SRC);
  console.log('src:', img.width, 'x', img.height);
  // Mascot + basket cluster sits in the middle of the composed banner;
  // crop out the logo header and the baked-in text/button at the bottom.
  const x = Math.round(img.width * 0.155);
  const w = Math.round(img.width * 0.69);
  const y = Math.round(img.height * 0.135);
  const h = Math.round(img.height * 0.545);
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  fs.writeFileSync(PREVIEW, canvas.toBuffer('image/png'));
  fs.writeFileSync(OUT, canvas.toBuffer('image/jpeg', 0.9));
  console.log('wrote', OUT, w + 'x' + h);
})();
