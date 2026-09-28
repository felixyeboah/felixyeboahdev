import { feedXML } from '@/lib/site/post-render';
import { getPosts } from '@/lib/site/posts';

/* RSS 2.0 for the writing section (same document as the prototype's site/writing/feed.xml), built at build time. */
export const dynamic = 'force-static';

export function GET() {
    return new Response(feedXML(getPosts()), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
}
