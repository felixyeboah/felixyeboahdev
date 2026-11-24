import type { APIRoute } from 'astro';
import { feedXML } from '@/lib/site/post-render';
import { getPosts } from '@/lib/site/posts';

/* RSS 2.0 for the writing section, built at build time: the same document the Next app serves at this address. */
export const GET: APIRoute = () =>
    new Response(feedXML(getPosts()), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
