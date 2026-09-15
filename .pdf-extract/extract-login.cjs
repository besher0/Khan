// Extract embedded JPEGs from the login design PDF + render pages.
const fs = require('fs');
const path = require('path');

const PDF_PATH = 'C:/Users/USER/Desktop/Khan/docs/reference/تسجيل دخول.pdf';
const OUT_DIR = 'C:/Users/USER/Desktop/Khan/.pdf-extract/login';

fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = fs.readFileSync(PDF_PATH);
console.log('PDF size:', buf.length);

const counts = {
  DCTDecode: (buf.toString('latin1').match(/DCTDecode/g) || []).length,
  FlateDecode: (buf.toString('latin1').match(/FlateDecode/g) || []).length,
  JPXDecode: (buf.toString('latin1').match(/JPXDecode/g) || []).length,
  Image: (buf.toString('latin1').match(/\/Subtype\s*\/Image/g) || []).length,
};
console.log('Encodings:', counts);

let jpegs = [];
for (let i = 0; i < buf.length - 3; i++) {
  if (buf[i] === 0xff && buf[i + 1] === 0xd8 && buf[i + 2] === 0xff) {
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
jpegs = jpegs.filter((seg, idx) => jpegs.findIndex(s => s.start === seg.start) === idx);
console.log('JPEG candidates:', jpegs.length);
jpegs.forEach((seg, idx) => {
  const out = path.join(OUT_DIR, `img_${String(idx + 1).padStart(2, '0')}.jpg`);
  fs.writeFileSync(out, buf.slice(seg.start, seg.end));
  console.log('Wrote', out, seg.end - seg.start, 'bytes');
});

// Also extract PNGs by signature scan
let pngs = [];
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (let i = 0; i < buf.length - 12; i++) {
  if (buf[i] === 0x89 && buf.slice(i, i + 8).equals(PNG_SIG)) {
    // find IEND
    for (let j = i + 8; j < buf.length - 8; j++) {
      if (buf[j] === 0x49 && buf[j + 1] === 0x45 && buf[j + 2] === 0x4e && buf[j + 3] === 0x44) {
        const len = j + 8 - i;
        if (len > 2000) pngs.push({ start: i, end: j + 8 });
        i = j + 7;
        break;
      }
    }
  }
}
console.log('PNG candidates:', pngs.length);
pngs.forEach((seg, idx) => {
  const out = path.join(OUT_DIR, `png_${String(idx + 1).padStart(2, '0')}.png`);
  fs.writeFileSync(out, buf.slice(seg.start, seg.end));
  console.log('Wrote', out, seg.end - seg.start, 'bytes');
});
