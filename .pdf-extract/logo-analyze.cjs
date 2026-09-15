const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

// Crop a region from a source image, optionally upscale, and sample dominant colors.
// node logo-analyze.cjs <src> <out> <x> <y> <w> <h> <scale> [sample]
(async () => {
  const [, , SRC, OUT, X, Y, W, H, SCALE, SAMPLE] = process.argv;
  const x = +X, y = +Y, w = +W, h = +H, scale = +(SCALE || 1);
  const img = await loadImage(fs.readFileSync(SRC));
  console.log('src:', img.width, 'x', img.height);

  const canvas = createCanvas(w * scale, h * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x, y, w, h, 0, 0, w * scale, h * scale);
  fs.writeFileSync(OUT, canvas.toBuffer('image/png'));
  console.log('wrote', OUT, (w * scale) + 'x' + (h * scale));

  if (SAMPLE) {
    const c2 = createCanvas(w, h);
    const cx = c2.getContext('2d');
    cx.drawImage(img, x, y, w, h, 0, 0, w, h);
    const data = cx.getImageData(0, 0, w, h).data;
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 200) continue;
      const key = [r & 0xf0, g & 0xf0, b & 0xf0]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a2, b2) => b2[1] - a2[1]).slice(0, 14);
    for (const [k, v] of sorted) console.log('#' + k, v);
  }
})().catch((e) => { console.error(e); process.exit(1); });
