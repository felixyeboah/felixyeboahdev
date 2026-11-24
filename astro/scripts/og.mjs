/* Builds src/assets/og.png, the 1200x630 card shown when a link to the site is shared.
   Run from the repo root after changing the logo or the wording:  bun astro/scripts/og.mjs
   Text is drawn with a system sans (the web font is not available to the renderer). */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const INK = '#171717', MUTED = '#6F6F6B', PAGE = '#FCFCFA', HAIR = '#E8E7E2';
const FONT = `font-family="Helvetica Neue, Helvetica, Arial, sans-serif"`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAGE}"/>
  <g transform="translate(96 84) scale(0.75)" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="26" width="108" height="76" rx="13"/>
    <path d="M 31 51 L 46 64 L 31 77 M 62 67 C 68 75 80 75 86 67"/>
  </g>
  <text x="96" y="356" ${FONT} font-size="84" font-weight="700" letter-spacing="-2.5" fill="${INK}">Felix Yeboah</text>
  <text x="96" y="440" ${FONT} font-size="52" font-weight="500" letter-spacing="-1.2" fill="${MUTED}">Software engineer &amp; UI/UX designer</text>
  <rect x="96" y="498" width="1008" height="2" fill="${HAIR}"/>
  <text x="96" y="552" font-family="Menlo, Monaco, monospace" font-size="26" fill="${MUTED}">felixyeboah.dev</text>
  <text x="1104" y="552" text-anchor="end" font-family="Menlo, Monaco, monospace" font-size="26" fill="${MUTED}">Accra, Ghana</text>
</svg>`;
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(new URL('../src/assets/og.png', import.meta.url), png);
console.log('og.png', png.length, 'bytes');
