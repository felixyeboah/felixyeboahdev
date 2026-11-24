import type { APIRoute } from 'astro';
import manifest from '@/lib/site/cache/photos.json';

/* The photo manifest for the photobook scripts (src/photobook/shared.js reads window.PHOTO_DATA).
   Built from the same file the photo pipeline writes (`bun run photos` in the repo root). */
export const GET: APIRoute = () =>
    new Response('window.PHOTO_DATA=' + JSON.stringify({ sets: manifest.sets, photos: manifest.photos }) + ';', {
        headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
    });
