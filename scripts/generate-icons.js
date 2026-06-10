#!/usr/bin/env node
/**
 * Generates PNG icon files for the CryptoLens extension.
 * Usage: node scripts/generate-icons.js
 * No npm dependencies — uses only Node.js built-ins.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.allocUnsafe(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(width, height, rgba) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.allocUnsafe(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row[1 + x * 4]     = rgba[i];
      row[1 + x * 4 + 1] = rgba[i + 1];
      row[1 + x * 4 + 2] = rgba[i + 2];
      row[1 + x * 4 + 3] = rgba[i + 3];
    }
    rows.push(row);
  }
  const raw = zlib.deflateSync(Buffer.concat(rows), { level: 9 });
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', raw),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function setPixel(buf, x, y, size, r, g, b, a) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = r; buf[i+1] = g; buf[i+2] = b; buf[i+3] = a;
}

function fillRect(buf, x, y, w, h, size, r, g, b, a) {
  for (let py = y; py < Math.min(y + h, size); py++)
    for (let px = x; px < Math.min(x + w, size); px++)
      setPixel(buf, px, py, size, r, g, b, a);
}

function roundRect(buf, x, y, w, h, rad, size, r, g, b, a) {
  for (let py = y; py < Math.min(y + h, size); py++) {
    for (let px = x; px < Math.min(x + w, size); px++) {
      const dx = Math.min(px - x, x + w - 1 - px);
      const dy = Math.min(py - y, y + h - 1 - py);
      if (dx >= rad || dy >= rad ||
          Math.sqrt((rad - dx - 1) ** 2 + (rad - dy - 1) ** 2) < rad)
        setPixel(buf, px, py, size, r, g, b, a);
    }
  }
}

function vline(buf, x, y1, y2, size, r, g, b, a) {
  for (let y = y1; y <= y2; y++) setPixel(buf, x, y, size, r, g, b, a);
}

function drawIcon(size) {
  const buf = new Uint8Array(size * size * 4);
  const s = size / 128;
  const rnd = Math.max(1, Math.round(22 * s));

  // Background
  roundRect(buf, 0, 0, size, size, rnd, size, 10, 14, 26, 255);

  // Candle 1 (red/bearish)
  const c1x = Math.round(22 * s), c1cx = Math.round(32 * s);
  const c1bw = Math.round(20 * s), c1by = Math.round(44 * s), c1bh = Math.round(30 * s);
  vline(buf, c1cx, Math.round(22 * s), c1by - 1, size, 239, 68, 68, 255);
  fillRect(buf, c1x, c1by, c1bw, c1bh, size, 239, 68, 68, 255);
  vline(buf, c1cx, c1by + c1bh, Math.round(92 * s), size, 239, 68, 68, 255);

  // Candle 2 (green/bullish)
  const c2x = Math.round(54 * s), c2cx = Math.round(64 * s);
  const c2bw = Math.round(20 * s), c2by = Math.round(38 * s), c2bh = Math.round(36 * s);
  vline(buf, c2cx, Math.round(18 * s), c2by - 1, size, 34, 197, 94, 255);
  fillRect(buf, c2x, c2by, c2bw, c2bh, size, 34, 197, 94, 255);
  vline(buf, c2cx, c2by + c2bh, Math.round(96 * s), size, 34, 197, 94, 255);

  // Candle 3 (orange/bullish)
  const c3x = Math.round(86 * s), c3cx = Math.round(96 * s);
  const c3bw = Math.round(20 * s), c3by = Math.round(30 * s), c3bh = Math.round(42 * s);
  vline(buf, c3cx, Math.round(14 * s), c3by - 1, size, 247, 147, 26, 255);
  fillRect(buf, c3x, c3by, c3bw, c3bh, size, 247, 147, 26, 255);
  vline(buf, c3cx, c3by + c3bh, Math.round(90 * s), size, 247, 147, 26, 255);

  return buf;
}

const outDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const buf = drawIcon(size);
  const png = makePNG(size, size, buf);
  const file = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(file, png);
  process.stdout.write(`✓ icons/icon${size}.png\n`);
}

process.stdout.write('\nAll icons generated. Load the extension in chrome://extensions\n');
