const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

const SRC = 'C:/Users/USER/Downloads/حسابي.png';
const DIR = 'C:/Users/USER/Desktop/Khan/.pdf-extract';
const OUT_ASSET = 'C:/Users/USER/Desktop/Khan/mobile/assets/guest-mascot.png';

// Banner green sampled from the design
const REF = [15, 74, 63]; // #0F4A3F
const dist = (r, g, b) => Math.sqrt((r - REF[0]) ** 2 + (g - REF[1]) ** 2 + (b - REF[2]) ** 2);

(async () => {
  const img = await loadImage(SRC);

  // Mascot region inside the banner (original image coords), bottom = banner edge
  const cx = 984, cy = 185, cw = 195, ch = 208;
  const canvas = createCanvas(cw, ch);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
  const imageData = ctx.getImageData(0, 0, cw, ch);
  const d = imageData.data;

  const removed = new Uint8Array(cw * ch);
  const idx = (x, y) => y * cw + x;

  // Pass 1: BFS flood fill from borders, strict tolerance
  const TOL1 = 48;
  const queue = [];
  const trySeed = (x, y) => {
    const i = idx(x, y) * 4;
    if (!removed[idx(x, y)] && dist(d[i], d[i + 1], d[i + 2]) < TOL1) {
      removed[idx(x, y)] = 1;
      queue.push([x, y]);
    }
  };
  for (let x = 0; x < cw; x++) { trySeed(x, 0); trySeed(x, ch - 1); }
  for (let y = 0; y < ch; y++) { trySeed(0, y); trySeed(cw - 1, y); }
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= cw || ny >= ch || removed[idx(nx, ny)]) continue;
      const i = idx(nx, ny) * 4;
      if (dist(d[i], d[i + 1], d[i + 2]) < TOL1) {
        removed[idx(nx, ny)] = 1;
        queue.push([nx, ny]);
      }
    }
  }

  // Pass 2: iteratively remove faint pattern-icon pixels touching removed bg (wider tolerance)
  const TOL2 = 72;
  for (let pass = 0; pass < 8; pass++) {
    let changed = 0;
    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const p = idx(x, y);
        if (removed[p]) continue;
        const i = p * 4;
        if (dist(d[i], d[i + 1], d[i + 2]) >= TOL2) continue;
        if (removed[p - 1] || removed[p + 1] || removed[p - cw] || removed[p + cw]) {
          removed[p] = 1;
          changed++;
        }
      }
    }
    if (!changed) break;
  }

  // Apply transparency + 1px feather on boundary
  let minX = cw, maxX = 0, minY = ch, maxY = 0;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const p = idx(x, y);
      const i = p * 4;
      if (removed[p]) {
        d[i + 3] = 0;
      } else {
        const touchesBg = x === 0 || y === 0 || x === cw - 1 || y === ch - 1 ||
          removed[p - 1] || removed[p + 1] || removed[p - cw] || removed[p + cw];
        if (touchesBg) d[i + 3] = 140; // soft edge
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Trim to content bbox (keep bottom flush: mascot is clipped by banner edge in design)
  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(cw - 1, maxX + pad);
  maxY = ch - 1; // keep bottom at banner edge
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const out = createCanvas(tw, th);
  out.getContext('2d').drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th);
  fs.writeFileSync(OUT_ASSET, out.toBuffer('image/png'));
  console.log('asset:', OUT_ASSET, tw + 'x' + th);

  // Preview composited on banner green to verify the cutout
  const prev = createCanvas(tw + 40, th + 40);
  const pctx = prev.getContext('2d');
  pctx.fillStyle = '#0F4A3F';
  pctx.fillRect(0, 0, tw + 40, th + 40);
  pctx.drawImage(out, 20, 20);
  fs.writeFileSync(DIR + '/guest-mascot-preview.png', prev.toBuffer('image/png'));
  console.log('preview saved');
})();
