'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { initPage } from '@/lib/site/fy';

/**
 * Same-page hash links (#top, #main, section anchors). A native jump adds a history entry the App Router
 * doesn't own, so Back from a later page lands on it with the wrong page still rendered. Pushing the hash
 * through history.pushState keeps the router in sync; the scroll (smooth + scroll-padding from site.css)
 * and focus move behave like the native jump.
 */
function onHashClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a || a.target) return;
    const id = decodeURIComponent(a.getAttribute('href')!.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    if (location.hash !== '#' + id) history.pushState(history.state, '', '#' + id);
    el.scrollIntoView();
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
}

/** Re-binds the shared declarative hooks (reveal, clock, copy, peek, magnetic, spy) after every navigation. */
export function SiteRuntime() {
    const pathname = usePathname();
    useEffect(() => initPage(), [pathname]);
    useEffect(() => {
        document.addEventListener('click', onHashClick);
        return () => document.removeEventListener('click', onHashClick);
    }, []);
    return null;
}
