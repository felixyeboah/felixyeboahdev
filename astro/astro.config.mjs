// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import cloudflareStatic from './integrations/cloudflare-static.mjs';

const repo = fileURLToPath(new URL('..', import.meta.url));

/* Static site, served as plain files by Cloudflare (no adapter, no Worker code).
   Content, data and images are shared with the Next app in the repo root until the switch-over:
     @/…          -> repo root (lib/site/*.ts)
     ./content    -> symlink to ../content (lib/site/posts.ts reads content/blog from the working directory)
     publicDir    -> ../public (covers, case-study images, processed photos) */
export default defineConfig({
    site: 'https://felixyeboah.dev',
    output: 'static',
    publicDir: '../public',
    /* about.html, work/reevit.html: with html_handling "drop-trailing-slash" in wrangler.jsonc these are
       served at /about and /work/reevit, the URLs the live site uses today */
    build: { format: 'file' },
    trailingSlash: 'never',
    vite: { resolve: { alias: { '@': repo.replace(/\/$/, '') } } },
    integrations: [cloudflareStatic()],
});
