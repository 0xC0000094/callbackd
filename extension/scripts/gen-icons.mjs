// One-off icon generator. Writes solid-color PNGs to extension/icons/.
// No dependencies — uses only Node built-ins.
// Run from the repo root: node extension/scripts/gen-icons.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(typeStr, data) {
  const type = Buffer.from(typeStr, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([type, data])), 0);
  return Buffer.concat([lenBuf, type, data, crcBuf]);
}

// Make a simple PNG: dark background with a soft inner square highlight.
function makePng(size) {
  const bgR = 24,
    bgG = 24,
    bgB = 27; // zinc-900
  const accentR = 248,
    accentG = 250,
    accentB = 252; // zinc-50
  const pad = Math.round(size * 0.22);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const inAccent =
        x >= pad && x < size - pad && y >= pad && y < size - pad;
      const r = inAccent ? accentR : bgR;
      const g = inAccent ? accentG : bgG;
      const b = inAccent ? accentB : bgB;
      const off = y * rowLen + 1 + x * 3;
      raw[off] = r;
      raw[off + 1] = g;
      raw[off + 2] = b;
    }
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("extension/icons", { recursive: true });
for (const size of [16, 48, 128]) {
  writeFileSync(`extension/icons/icon${size}.png`, makePng(size));
  console.log(`wrote extension/icons/icon${size}.png (${size}x${size})`);
}
