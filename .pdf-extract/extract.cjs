// Extract embedded images + text hints from a PDF (no deps).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PDF_PATH = 'C:/Users/USER/Downloads/حسابي.pdf';
const OUT_DIR = 'C:/Users/USER/Desktop/Khan/.pdf-extract';

fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = fs.readFileSync(PDF_PATH);
console.log('PDF size:', buf.length);

// --- Stats about image encodings ---
const counts = {
  DCTDecode: (buf.toString('latin1').match(/DCTDecode/g) || []).length,
  FlateDecode: (buf.toString('latin1').match(/FlateDecode/g) || []).length,
  JPXDecode: (buf.toString('latin1').match(/JPXDecode/g) || []).length,
  Image: (buf.toString('latin1').match(/\/Subtype\s*\/Image/g) || []).length,
};
console.log('Encodings:', counts);

// --- Extract JPEGs by marker scan ---
let jpegs = [];
for (let i = 0; i < buf.length - 3; i++) {
  if (buf[i] === 0xff && buf[i + 1] === 0xd8 && buf[i + 2] === 0xff) {
    // find EOI
    for (let j = i + 3; j < buf.length - 1; j++) {
      if (buf[j] === 0xff && buf[j + 1] === 0xd9) {
        const len = j + 2 - i;
        if (len > 2000) jpegs.push({ start: i, end: j + 2 });
        i = j + 1;
        break;
      }
    }
  }
}
// de-dup overlaps
jpegs = jpegs.filter((seg, idx) => jpegs.findIndex(s => s.start === seg.start) === idx);
console.log('JPEG candidates:', jpegs.length);
jpegs.forEach((seg, idx) => {
  const out = path.join(OUT_DIR, `img_${String(idx + 1).padStart(2, '0')}.jpg`);
  fs.writeFileSync(out, buf.slice(seg.start, seg.end));
  console.log('Wrote', out, seg.end - seg.start, 'bytes');
});

// --- Try to inflate Flate streams and pull out readable text ---
const latin = buf.toString('latin1');
let textChunks = [];
const streamRe = /stream\r?\n/g;
let m;
let inflated = 0;
while ((m = streamRe.exec(latin)) !== null) {
  const start = m.index + m[0].length;
  const end = latin.indexOf('endstream', start);
  if (end === -1) continue;
  const slice = buf.slice(start, end);
  try {
    const out = zlib.inflateSync(slice);
    const str = out.toString('latin1');
    inflated++;
    // find text show operators
    const shows = str.match(/\((?:[^()\\]|\\.){1,80}\)\s*Tj|\[((?:[^\]\\]|\\.)*)\]\s*TJ/g) || [];
    for (const s of shows) textChunks.push(s);
  } catch (e) {
    // raw deflate attempt
    try {
      const out = zlib.inflateRawSync(slice);
      inflated++;
    } catch (e2) { /* skip */ }
  }
}
console.log('Inflated streams:', inflated, '| text-show operators:', textChunks.length);
const uniqText = [...new Set(textChunks)].slice(0, 120);
console.log('--- SAMPLE TEXT OPS ---');
console.log(uniqText.join('\n').slice(0, 6000));
