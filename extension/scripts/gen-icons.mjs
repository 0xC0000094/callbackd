// One-off icon generator. Writes a bold "C" mark on a zinc-900 rounded
// square at all the sizes we need.
//
// Output:
//   extension/icons/icon{16,48,128}.png   <- browser extension
//   public/favicon-{32,192,512}.png       <- web favicons
//   public/apple-touch-icon.png (180x180) <- iOS home screen
//
// No dependencies. Uses only Node built-ins (fs, zlib). PNG bytes are
// constructed by hand: signature + IHDR + IDAT (deflated RGBA) + IEND.
//
// Run from the repo root:
//   node extension/scripts/gen-icons.mjs

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

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

// Alpha mask for the rounded-square outline. Returns 1 inside, 0 outside,
// smooth on the edge so corners anti-alias.
function roundedSquareAlpha(x, y, size, r) {
  let cx = null,
    cy = null;
  if (x < r && y < r) {
    cx = r - 1;
    cy = r - 1;
  } else if (x > size - 1 - r && y < r) {
    cx = size - r;
    cy = r - 1;
  } else if (x < r && y > size - 1 - r) {
    cx = r - 1;
    cy = size - r;
  } else if (x > size - 1 - r && y > size - 1 - r) {
    cx = size - r;
    cy = size - r;
  }
  if (cx === null) return 1;
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  return 1 - smoothstep(r - 0.5, r + 0.5, d);
}

function drawIcon(size) {
  const bg = [24, 24, 27]; // zinc-900
  const fg = [250, 250, 252]; // near-white (zinc-50)
  const cornerR = Math.max(2, Math.round(size * 0.22));

  // C geometry: thick ring with a mouth on the right.
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const outerR = size * 0.4;
  const innerR = size * 0.24;
  // ~36deg half-mouth means a ~72deg opening on the right.
  const mouthHalfAngle = Math.PI / 5;

  const rowLen = 1 + size * 4; // 1 filter byte + RGBA per pixel
  const raw = Buffer.alloc(rowLen * size);

  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // PNG filter type: none
    for (let x = 0; x < size; x++) {
      const sqAlpha = roundedSquareAlpha(x, y, size, cornerR);

      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Pixel is on the ring if it's between innerR and outerR.
      const outerEdge = 1 - smoothstep(outerR - 0.5, outerR + 0.5, r);
      const innerEdge = smoothstep(innerR - 0.5, innerR + 0.5, r);
      let ringAlpha = outerEdge * innerEdge;

      // Cut out the mouth.
      const mouthMask =
        1 - smoothstep(mouthHalfAngle - 0.08, mouthHalfAngle + 0.08, Math.abs(angle));
      ringAlpha *= 1 - mouthMask;

      const outR = Math.round(bg[0] + (fg[0] - bg[0]) * ringAlpha);
      const outG = Math.round(bg[1] + (fg[1] - bg[1]) * ringAlpha);
      const outB = Math.round(bg[2] + (fg[2] - bg[2]) * ringAlpha);
      const outA = Math.round(255 * sqAlpha);

      const off = y * rowLen + 1 + x * 4;
      raw[off] = outR;
      raw[off + 1] = outG;
      raw[off + 2] = outB;
      raw[off + 3] = outA;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth per channel
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

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
  writeFileSync(`extension/icons/icon${size}.png`, drawIcon(size));
  console.log(`wrote extension/icons/icon${size}.png (${size}x${size})`);
}

mkdirSync("public", { recursive: true });
for (const size of [32, 192, 512]) {
  writeFileSync(`public/favicon-${size}.png`, drawIcon(size));
  console.log(`wrote public/favicon-${size}.png (${size}x${size})`);
}
writeFileSync("public/apple-touch-icon.png", drawIcon(180));
console.log("wrote public/apple-touch-icon.png (180x180)");
