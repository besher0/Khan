const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

// Usage:
//   node measure.cjs <src> <cols> [x y w h] [--light|--dark]
// Prints an ASCII occupancy map of the "ink" pixels in a region so glyph
// geometry can be measured numerically instead of by eye.
(async () => {
  const argv = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
  const [SRC, COLS_ARG, X, Y, W, H] = argv;
  const img = await loadImage(fs.readFileSync(SRC));
  const hasRegion = X !== undefined;
  const x = hasRegion ? +X : 0;
  const y = hasRegion ? +Y : 0;
  const w = hasRegion ? +W : img.width;
  const h = hasRegion ? +H : img.height;

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(x, y, w, h).data;

  const cols = +COLS_ARG || 80;
  const cell = w / cols;
  const rows = Math.max(1, Math.round(h / cell));
  const cellH = h / rows;

  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  let minL = 255;
  let maxL = 0;
  for (let i = 0; i < data.length; i += 4) {
    const l = lum(i);
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }
  const thr = (minL + maxL) / 2;
  let above = 0;
  for (let i = 0; i < data.length; i += 4) if (lum(i) > thr) above++;
  const darkOnLight = flags.includes('--light')
    ? true
    : flags.includes('--dark')
      ? false
      : above / (data.length / 4) > 0.5;
  const ink = darkOnLight ? (i) => lum(i) < thr : (i) => lum(i) > thr;
  console.log(`src ${SRC} ${img.width}x${img.height}  region x${x} y${y} ${w}x${h}`);
  console.log(
    `luminance ${minL.toFixed(0)}..${maxL.toFixed(0)} thr ${thr.toFixed(0)}  polarity: ${
      darkOnLight ? 'dark ink on light bg' : 'light ink on dark bg'
    }`,
  );

  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -1;
  let by1 = -1;
  const colCov = new Array(cols).fill(0);
  const rowCov = new Array(rows).fill(0);
  const grid = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  const gridTot = new Array(rows).fill(0).map(() => new Array(cols).fill(0));

  for (let py = 0; py < h; py++) {
    const ry = Math.min(rows - 1, Math.floor(py / cellH));
    for (let px = 0; px < w; px++) {
      const i = (py * w + px) * 4;
      const cx = Math.min(cols - 1, Math.floor(px / cell));
      gridTot[ry][cx]++;
      if (!ink(i)) continue;
      if (px < bx0) bx0 = px;
      if (px > bx1) bx1 = px;
      if (py < by0) by0 = py;
      if (py > by1) by1 = py;
      colCov[cx]++;
      rowCov[ry]++;
      grid[ry][cx]++;
    }
  }

  console.log(`ink bbox (region-relative): x ${bx0}..${bx1} (w ${bx1 - bx0 + 1})  y ${by0}..${by1} (h ${by1 - by0 + 1})`);
  console.log(`aspect w/h ${((bx1 - bx0 + 1) / (by1 - by0 + 1)).toFixed(3)}`);
  console.log(`cell ${cell.toFixed(2)}x${cellH.toFixed(2)} px`);
  console.log('col profile (ink px per column):');
  console.log(colCov.join(' '));
  console.log('row profile (ink px per row):');
  console.log(rowCov.join(' '));

  console.log('\nmap:');
  let header = '     ';
  for (let c = 0; c < cols; c++) header += c % 10 === 0 ? String(Math.floor(c / 10) % 10) : ' ';
  console.log(header);
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      const ratio = gridTot[r][c] ? grid[r][c] / gridTot[r][c] : 0;
      line += ratio > 0.6 ? '#' : ratio > 0.25 ? '+' : ratio > 0.05 ? '.' : ' ';
    }
    console.log(String(r).padStart(3, ' ') + '  ' + line);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});