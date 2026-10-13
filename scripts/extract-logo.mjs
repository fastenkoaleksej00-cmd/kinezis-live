// Temporary logo extraction from the KINEZIS site's raster logo.
// Keys the beige background out, recolours the mark to brand ink (or white),
// crops the spine mark and the wordmark, and builds PWA icons.
// Usage: node scripts/extract-logo.mjs <path-to-logo.png>
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const src = process.argv[2];
if (!src) {
  console.error("Pass the source logo path");
  process.exit(1);
}
const out = new URL("../public/brand/", import.meta.url).pathname;
await mkdir(out, { recursive: true });

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Background luminance from the four corners
const lum = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
const corner = (x, y) => lum((y * width + x) * channels);
const bg = (corner(4, 4) + corner(width - 5, 4) + corner(4, height - 5) + corner(width - 5, height - 5)) / 4;
const dark = 40; // luminance treated as fully opaque ink
const softEdge = 18; // keeps the keyed edge smooth

function recolour(rgb) {
  const buf = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const l = lum(i);
    let a = (bg - softEdge - l) / (bg - softEdge - dark);
    a = Math.max(0, Math.min(1, a));
    buf[p * 4] = rgb[0];
    buf[p * 4 + 1] = rgb[1];
    buf[p * 4 + 2] = rgb[2];
    buf[p * 4 + 3] = Math.round(a * 255);
  }
  return sharp(buf, { raw: { width, height, channels: 4 } });
}

const ink = [16, 36, 43];
const white = [255, 255, 255];

// Regions in the 1536x1024 source: spine mark on the left, wordmark to the right
const markBox = { left: 220, top: 190, width: 240, height: 640 };
const wordBox = { left: 470, top: 380, width: 870, height: 170 };

async function cut(rgb, box, file) {
  // sharp applies trim before extract in one pipeline, so run them as two steps
  const cropped = await recolour(rgb).extract(box).png().toBuffer();
  await sharp(cropped).trim({ threshold: 10 }).png().toFile(`${out}${file}`);
}

await cut(ink, markBox, "logo-mark.png");
await cut(white, markBox, "logo-mark-white.png");
await cut(ink, wordBox, "logo-word.png");
await cut(white, wordBox, "logo-word-white.png");

// App icons: white mark on petrol
async function icon(size, padRatio, file) {
  const markH = Math.round(size * (1 - padRatio * 2));
  const mark = await sharp(`${out}logo-mark-white.png`).resize({ height: markH }).png().toBuffer();
  const meta = await sharp(mark).metadata();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 16, g: 36, b: 43, alpha: 1 } },
  })
    .composite([{ input: mark, left: Math.round((size - meta.width) / 2), top: Math.round((size - markH) / 2) }])
    .png()
    .toFile(`${out}${file}`);
}

await icon(512, 0.18, "icon-512.png");
await icon(192, 0.18, "icon-192.png");
await icon(512, 0.28, "icon-512-maskable.png");

for (const f of ["logo-mark.png", "logo-word.png"]) {
  const m = await sharp(`${out}${f}`).metadata();
  console.log(f, m.width, "x", m.height);
}
console.log("done");
