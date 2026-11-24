import type { APIRoute } from 'astro';
import { getPosts, isoDate } from '@/lib/site/posts';
import { PROJECTS } from '@/lib/site/projects';

/* Every public page, for search engines. Posts carry the date they were written or last updated. */
export const GET: APIRoute = ({ site }) => {
    const url = (path: string) => new URL(path, site).href;
    const entries: Array<[loc: string, lastmod?: string]> = [
        [url('/')],
        [url('/work')],
        ...PROJECTS.map((p): [string] => [url(`/work/${p.slug}`)]),
        [url('/writing')],
        ...getPosts().map((p): [string, string] => [url(`/writing/${p.slug}`), isoDate(p.updated ?? p.date)]),
        [url('/about')],
        [url('/resume')],
        [url('/photos')],
    ];
    const body =
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        entries.map(([loc, lastmod]) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n') +
        '\n</urlset>\n';
    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
