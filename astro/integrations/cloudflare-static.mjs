import { copyFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* Writes what Cloudflare needs next to the built pages:
   - _headers: the RSS content type for the feed
   - _redirects: every redirect the Next app defines in next.config.ts, with the same status codes
   - favicon.svg: the logo (src/assets/logo.svg). The public folder is shared with the Next app, so it is written here.
   - favicon.ico: the same logo for browsers without SVG icons (made by scripts/favicon.mjs) */

/* old case-study slugs -> current /work slugs (same table as next.config.ts) */
const RENAMED = {
    'miss-cookie': 'miss-cookie-spices',
    dnaweds: 'desmond-weds-akyeamaa',
    'seven-sports': '7even-sports-group',
    drobotix: 'drobotix',
    dronehub: 'dronehub',
    undisciplined: 'undisciplined',
};

const RULES = [
    '# static rules first: Cloudflare uses the first match',
    '/blog /writing 308',
    '/blog/why-i-built-primeflow-a-developers-reaction-to-a-real-problem /writing/why-i-built-reevit 308',
    '/case-studies /work 308',
    ...Object.entries(RENAMED).map(([from, to]) => `/case-studies/${from} /work/${to} 308`),
    '# dynamic rules',
    '/blog/:slug /writing/:slug 308',
    '/docs/:slug /writing/:slug 308',
    '/case-studies/:slug /work 307',
];

export default function cloudflareStatic() {
    return {
        name: 'fy-cloudflare-static',
        hooks: {
            'astro:build:done': ({ dir }) => {
                const out = fileURLToPath(dir);
                writeFileSync(out + '_redirects', RULES.join('\n') + '\n');
                /* feed readers expect the RSS type; Cloudflare would otherwise serve .xml as application/xml */
                writeFileSync(out + '_headers', '/writing/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8\n');
                copyFileSync(fileURLToPath(new URL('../src/assets/favicon.ico', import.meta.url)), out + 'favicon.ico');
                copyFileSync(fileURLToPath(new URL('../src/assets/logo.svg', import.meta.url)), out + 'favicon.svg');
            },
        },
    };
}
