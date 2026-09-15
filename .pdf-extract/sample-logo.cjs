const { loadImage, createCanvas } = require('@napi-rs/canvas');

const SRC = 'C:/Users/USER/Desktop/Khan/.pdf-extract/img_42.jpg';

(async () => {
  const img = await loadImage(SRC);
  console.log('src:', img.width, 'x', img.height);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;

  // Logo lockup sits top-center: roughly x 500..760, y 30..190
  const x0 = 460, x1 = 800, y0 = 20, y1 = 200;
  const counts = new Map();
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 232 && g > 232 && b > 232) continue; // skip white bg
      const key = [r & 0xf8, g & 0xf8, b & 0xf8]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16);
  for (const [k, v] of sorted) console.log('#' + k, v);
})();
