import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// pdfjs-dist nests its own @napi-rs/canvas copy — use exactly that instance
// so Path2D/DOMMatrix classes match what pdfjs creates internally.
const pdfjsRequire = createRequire(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'));
const { createCanvas, Path2D, DOMMatrix, ImageData } = pdfjsRequire('@napi-rs/canvas');

globalThis.Path2D = Path2D;
globalThis.DOMMatrix = DOMMatrix;
globalThis.ImageData = ImageData;

const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

import fs from 'fs';
import path from 'path';
import url from 'url';

const PDF_PATH = 'C:/Users/USER/Downloads/حسابي.pdf';
const OUT = 'C:/Users/USER/Desktop/Khan/.pdf-extract';
const data = new Uint8Array(fs.readFileSync(PDF_PATH));
const stdFonts = path.join(OUT, 'node_modules', 'pdfjs-dist', 'standard_fonts');

const doc = await getDocument({
  data,
  standardFontDataUrl: url.pathToFileURL(stdFonts).href + '/',
  isEvalSupported: false,
  useSystemFonts: true,
}).promise;

console.log('pages:', doc.numPages);
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const out = path.join(OUT, `page-${p}.png`);
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  console.log('wrote', out, canvas.width + 'x' + canvas.height);
}
