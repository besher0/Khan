// Preview of the KHAN lockup exactly as mobile/src/components/KhanLogo.jsx draws it.
// Same path data / stroke widths / layout constants, stroked with canvas so the
// result can be eyeballed against docs/reference/الصفحة الرئيسية.jpg.
const { createCanvas, Path2D } = require('@napi-rs/canvas');
const fs = require('fs');

const ARABIC_STROKES = [
  'M12 70 V104 Q12 124 57 124 Q102 124 102 104 V70',
  'M146 12 V124',
  'M312 59 H344 Q368 59 368 83 V124 H146',
];
const ARABIC_DOTS = [
  { cx: 57, cy: 34 },
  { cx: 352, cy: 20 },
];
const LATIN_STROKES = [
  'M4.5 0 V63',
  'M55.5 0 L4.5 31.5',
  'M4.5 31.5 L55.5 63',
  'M114.5 0 V63',
  'M165.5 0 V63',
  'M114.5 31.5 H165.5',
  'M224.5 63 L250 4.5 L275.5 63',
  'M334.5 0 V63',
  'M385.5 0 V63',
  'M334.5 0 L385.5 63',
];
const EMBLEM = new Path2D(
  'M53 68c15-34 48-46 78-27 11 7 21 10 33 13 14 4 19 17 13 31-3 8-9 12-18 14-31 5-58 10-78 27-19 16-18 46 1 60 22 17 60 10 81-10 12-11 22-28 29-25 8 4-13 47-43 65-38 22-91 11-115-25-23-36-12-78 25-101 13-8 29-13 47-15 8-1 11-4 8-7-9-8-35-7-61 2-13 5-24 11-30 5-7-7-3-23 0-27Z'
);

const LOCKUP = { width: 787, height: 288, arabicTop: 25, latinTop: 213, emblemX: 497, emblemSize: 288 };
const ARABIC_SCALE = LOCKUP.width / 390;
const EMBLEM_SCALE = LOCKUP.emblemSize / 180;

function fillCircle(ctx, cx, cy, r, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLockup(ctx, scale, ox, oy, c) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // خان
  ctx.save();
  ctx.translate(0, LOCKUP.arabicTop);
  ctx.scale(ARABIC_SCALE, ARABIC_SCALE);
  ctx.strokeStyle = c.words;
  ctx.lineWidth = 24;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ARABIC_STROKES.forEach((d) => ctx.stroke(new Path2D(d)));
  ARABIC_DOTS.forEach((dot) => fillCircle(ctx, dot.cx, dot.cy, 12.5, c.words));
  ctx.restore();

  // K H A N
  ctx.save();
  ctx.translate(0, LOCKUP.latinTop);
  ctx.scale(ARABIC_SCALE, ARABIC_SCALE);
  ctx.strokeStyle = c.latin;
  ctx.lineWidth = 9;
  ctx.lineCap = 'butt';
  LATIN_STROKES.forEach((d, index) => {
    ctx.lineJoin = index === 6 ? 'round' : 'miter';
    ctx.stroke(new Path2D(d));
  });
  ctx.restore();

  // divider
  ctx.globalAlpha = c.dividerAlpha;
  ctx.fillStyle = c.divider;
  ctx.fillRect(426, 0, 3, 280);
  ctx.globalAlpha = 1;

  // emblem + dots
  ctx.save();
  ctx.translate(LOCKUP.emblemX, 0);
  ctx.scale(EMBLEM_SCALE, EMBLEM_SCALE);
  ctx.fillStyle = c.emblem;
  ctx.fill(EMBLEM);
  fillCircle(ctx, 82, 22, 12, c.greenDot);
  fillCircle(ctx, 154, 78, 9, c.goldDot);
  ctx.restore();

  ctx.restore();
}

const W = 1660;
const PANEL = 620;
const canvas = createCanvas(W, PANEL * 2);
const ctx = canvas.getContext('2d');

// mono (dashboard sidebar: white on brand green)
ctx.fillStyle = '#075247';
ctx.fillRect(0, 0, W, PANEL);
drawLockup(ctx, 1.9, 40, 22, {
  words: '#FFFFFF',
  latin: '#FFFFFF',
  emblem: '#FFFFFF',
  greenDot: '#FFFFFF',
  goldDot: '#FFFFFF',
  divider: '#FFFFFF',
  dividerAlpha: 0.4,
});

// brand (splash: ink wordmark, green emblem, green + gold dots on white)
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, PANEL, W, PANEL);
drawLockup(ctx, 1.9, 40, PANEL + 22, {
  words: '#1E252B',
  latin: '#1E252B',
  emblem: '#179B7D',
  greenDot: '#179B7D',
  goldDot: '#F7B531',
  divider: '#1E252B',
  dividerAlpha: 0.35,
});

fs.writeFileSync(
  'C:/Users/USER/Desktop/Khan/.pdf-extract/lockup-preview.png',
  canvas.toBuffer('image/png')
);
console.log('wrote lockup-preview.png', W, PANEL * 2);
