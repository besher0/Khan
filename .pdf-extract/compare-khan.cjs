const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');

// Objective check: does the reference "خان" match a Cairo weight?
// Both the reference crop and a Cairo render are reduced to tight ink masks,
// resampled to a common grid, then scored with IoU. ASCII maps are printed so
// the letterforms can be compared shape-by-shape.

const REF = {
  src: 'C:/Users/USER/Desktop/Khan/.pdf-extract/sb-wordmark.png',
  x: 430,
  y: 80,
  w: 470,
  h: 215,
};

const CAIRO_DIR = 'C:/Users/USER/Desktop/Khan/mobile/node_modules/@expo-google-fonts/cairo';
const WEIGHTS = [
  '200ExtraLight',
  '300Light',
  '400Regular',
  '500Medium',
  '600SemiBold',
  '700Bold',
  '800ExtraBold',
  '900Black',
].map((w) => `Cairo_${w}`);
for (const name of WEIGHTS) {
  GlobalFonts.registerFromPath(`${CAIRO_DIR}/${name.replace('Cairo_', '')}/${name}.ttf`, name);
}

function regionMask(img, { x, y, w, h }, darkInk) {
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(x, y, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0, p = 0; p < w * h; p++, i += 4) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    mask[p] = darkInk ? (l < 128 ? 1 : 0) : l > 128 ? 1 : 0;
  }
  return { w, h, mask };
}

function tight({ w, h, mask }) {
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const tw = x1 - x0 + 1;
  const th = y1 - y0 + 1;
  const out = new Uint8Array(tw * th);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) out[y * tw + x] = mask[(y + y0) * w + (x + x0)];
  }
  return { w: tw, h: th, mask: out, x0, y0, x1, y1 };
}

function resample(src, gw, gh) {
  const out = new Uint8Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    const sy0 = Math.floor((gy * src.h) / gh);
    const sy1 = Math.max(sy0 + 1, Math.floor(((gy + 1) * src.h) / gh));
    for (let gx = 0; gx < gw; gx++) {
      const sx0 = Math.floor((gx * src.w) / gw);
      const sx1 = Math.max(sx0 + 1, Math.floor(((gx + 1) * src.w) / gw));
      let hit = 0;
      let tot = 0;
      for (let y = sy0; y < sy1; y++) {
        for (let x = sx0; x < sx1; x++) {
          tot++;
          if (src.mask[y * src.w + x]) hit++;
        }
      }
      out[gy * gw + gx] = tot && hit / tot > 0.4 ? 1 : 0;
    }
  }
  return out;
}

function iou(a, b) {
  let inter = 0;
  let uni = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) inter++;
    if (a[i] || b[i]) uni++;
  }
  return uni ? inter / uni : 0;
}

function ascii(grid, gw, gh, indent) {
  const lines = [];
  for (let y = 0; y < gh; y++) {
    let line = '';
    for (let x = 0; x < gw; x++) line += grid[y * gw + x] ? '#' : '.';
    lines.push(indent + line);
  }
  return lines;
}

function ruler(gw, indent) {
  let a = indent;
  let b = indent;
  for (let x = 0; x < gw; x++) {
    a += x % 10 === 0 ? String(Math.floor(x / 10) % 10) : ' ';
    b += x % 10 === 0 ? '+' : '-';
  }
  return [a, b];
}

function renderCairo(name, text, size) {
  const canvas = createCanvas(size * 5, size * 3);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${size}px ${name}`;
  ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(text);
  console.log(
    `  [render ${name}] size ${size} measure width ${m.width.toFixed(1)} ascent ${
      m.actualBoundingBoxAscent !== undefined ? m.actualBoundingBoxAscent.toFixed(1) : '?'
    } descent ${m.actualBoundingBoxDescent !== undefined ? m.actualBoundingBoxDescent.toFixed(1) : '?'}`,
  );
  ctx.fillText(text, size * 0.5, size * 2);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const mask = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0, p = 0; p < mask.length; p++, i += 4) {
    mask[p] = data[i] > 128 ? 1 : 0;
  }
  return { w: canvas.width, h: canvas.height, mask };
}

(async () => {
  const GW = 96;
  const img = await loadImage(fs.readFileSync(REF.src));
  const ref = tight(regionMask(img, REF, false));
  console.log(`reference region x${REF.x} y${REF.y} ${REF.w}x${REF.h}`);
  console.log(
    `reference خان bbox (page px): x ${REF.x + ref.x0}..${REF.x + ref.x1}  y ${REF.y + ref.y0}..${REF.y + ref.y1}  (${ref.w}x${ref.h}) aspect ${(
      ref.w / ref.h
    ).toFixed(3)}`,
  );
  const GH = Math.round((GW * ref.h) / ref.w);
  const refGrid = resample(ref, GW, GH);
  const [ra, rb] = ruler(GW, '      ');
  console.log(ra);
  console.log(rb);
  ascii(refGrid, GW, GH, '      ').forEach((l) => console.log(l));

  const results = [];
  for (const name of WEIGHTS) {
    const c = tight(renderCairo(name, '\u062E\u0627\u0646', 260));
    const grid = resample(c, GW, GH);
    results.push({ name, iou: iou(refGrid, grid), grid, w: c.w, h: c.h });
  }
  results.sort((a, b) => b.iou - a.iou);
  console.log('\nIoU per Cairo weight (higher = closer to reference):');
  for (const r of results) {
    console.log(`  ${r.name.padEnd(20)} ${r.iou.toFixed(3)}  bbox ${r.w}x${r.h}  aspect ${(r.w / r.h).toFixed(3)}`);
  }
  console.log(`  reference aspect ${(ref.w / ref.h).toFixed(3)}`);

  for (const r of results.slice(0, 2)) {
    console.log(`\n--- ${r.name} (IoU ${r.iou.toFixed(3)}) Cairo bbox ${r.w}x${r.h} ---`);
    ascii(r.grid, GW, GH, '      ').forEach((l) => console.log(l));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});