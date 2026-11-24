/* Builds small versions of the project covers for the lists (landing and Work), where a 1600px JPG was
   being downloaded to fill a 160px thumbnail.
     public/assets/covers/<name>.jpg  ->  public/assets/covers/thumbs/<name>-<width>.webp
   Run from the repo root after adding or changing a cover:  bun astro/scripts/covers.mjs
   Widths are listed in astro/src/lib/covers.ts; keep the two in step. */
import { mkdirSync, readdirSync } from 'node:fs';
import sharp from 'sharp';

const WIDTHS = [320, 640, 960];
const dir = new URL('../../public/assets/covers/', import.meta.url);
const out = new URL('thumbs/', dir);
mkdirSync(out, { recursive: true });
let bytes = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.jpg'))) {
    for (const w of WIDTHS) {
        const info = await sharp(new URL(file, dir).pathname).resize({ width: w }).webp({ quality: 78 }).toFile(new URL(`${file.replace(/\.jpg$/, '')}-${w}.webp`, out).pathname);
        bytes += info.size;
    }
}
console.log('thumbs written,', Math.round(bytes / 1024), 'KB in total');
