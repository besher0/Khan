const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

// Locate the dark-green sidebar strip in a page render and report the bands that
// contain it, so the sidebar lockup can be cropped at native resolution.
// Usage: node find-sidebar.cjs <src> [bands] [minPct]
(async () => {
  const [, , SRC, BANDS_ARG, MIN_ARG] = process.argv;
  const img = await loadImage(fs.readFileSync(SRC));
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  const bands = +BANDS_ARG || 64;
  const minPct = MIN_ARG === undefined ? 0.2 : +MIN_ARG;
  const bandW = img.width / bands;

  const isGreenDark = (i) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return g > r + 20 && g > b + 10 && g < 140 && r < 90;
  };

  const lines = [`src ${SRC} ${img.width}x${img.height} bands ${bands} (${bandW.toFixed(0)}px each)`];
  for (let b = 0; b < bands; b++) {
    let hit = 0;
    let tot = 0;
    const x0 = Math.floor(b * bandW);
    const x1 = Math.min(img.width, Math.floor((b + 1) * bandW));
    for (let y = 0; y < img.height; y += 4) {
      for (let x = x0; x < x1; x += 4) {
        tot++;
        if (isGreenDark((y * img.width + x) * 4)) hit++;
      }
    }
    const pct = tot ? hit / tot : 0;
    if (pct >= minPct) {
      lines.push(`band ${b} x${x0}..${x1} greenDark ${(pct * 100).toFixed(1)}%`);
    }
  }
  lines.push('done');
  console.log(lines.join('\n'));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});