const { createCanvas, loadImage } = require('@napi-rs/canvas');
(async () => {
  const img = await loadImage('C:/Users/USER/Downloads/حسابي.png');
  const W = img.width;
  const c = createCanvas(W, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, W, img.height).data;
  const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  for (const y of [500, 700, 60]) {
    const transitions = [];
    let prev = null;
    for (let x = 880; x <= 1620; x++) {
      const [r, g, b] = px(x, y);
      const kind = (r < 80 && g < 80 && b < 80) ? 'dark' : (r > 200 && g > 200 && b > 200) ? 'light' : 'mid';
      if (kind !== prev) { transitions.push(`${x}:${kind}`); prev = kind; }
    }
    console.log(`y=${y}`, transitions.join(' '));
  }
})();
