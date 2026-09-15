const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/USER/Desktop/Khan/.pdf-extract/page-1.png';
const OUT = 'C:/Users/USER/Desktop/Khan/.pdf-extract';
const N = 5;

(async () => {
  const img = await loadImage(SRC);
  console.log('source:', img.width, 'x', img.height);
  const sliceW = Math.ceil(img.width / N);
  for (let i = 0; i < N; i++) {
    const x = i * sliceW;
    const w = Math.min(sliceW + 60, img.width - x); // small overlap
    const canvas = createCanvas(w, img.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, img.height);
    ctx.drawImage(img, x, 0, w, img.height, 0, 0, w, img.height);
    const out = path.join(OUT, `slice-${i + 1}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png'));
    console.log('wrote', out, w + 'x' + img.height);
  }
})();
