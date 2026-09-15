const { createCanvas, Path2D } = require('@napi-rs/canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
const p = new Path2D();
p.rect(10, 10, 100, 100);
try {
  ctx.clip(p);
  console.log('clip OK');
} catch (e) {
  console.log('clip FAIL:', e.message);
}
try {
  ctx.fill(p);
  console.log('fill OK');
} catch (e) {
  console.log('fill FAIL:', e.message);
}
console.log('same module check:', Path2D === globalThis.Path2D);
