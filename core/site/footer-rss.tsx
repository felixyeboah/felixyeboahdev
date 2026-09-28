'use client';

import { usePathname } from 'next/navigation';

/** Post pages add an RSS link to the footer (as the prototype's writing/<slug>.html did). */
export function FooterRss() {
    const pathname = usePathname();
    if (!pathname.startsWith('/writing/') || pathname === '/writing/feed.xml') return null;
    return <a href="/writing/feed.xml">RSS</a>;
}
