/* Builds src/assets/favicon.ico from src/assets/logo.svg (16, 32, 48 and 256 px, PNG-encoded entries).
   Run from the repo root after changing the logo:  bun astro/scripts/favicon.mjs
   Uses sharp from the root project (the photo pipeline already depends on it). */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const here = new URL('../src/assets/', import.meta.url);
const svg = readFileSync(new URL('logo.svg', here));
const sizes = [16, 32, 48, 256];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 72 * (s / 128) * 4 }).resize(s, s).png().toBuffer()));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s === 256 ? 0 : s, 0); // width (0 = 256)
    e.writeUInt8(s === 256 ? 0 : s, 1); // height
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
});
writeFileSync(new URL('favicon.ico', here), Buffer.concat([header, ...entries, ...pngs]));
console.log('favicon.ico', sizes.join('/'), offset, 'bytes');
