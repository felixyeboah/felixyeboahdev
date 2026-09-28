'use client';

import { useLayoutEffect } from 'react';

/* Page-level behaviour of the project template (work_pages.js + the prototype's <head> additions):
   - html[data-case-tone="light"] for light project bands (the nav pill turns more opaque)
   - html.no-sdt when scroll-driven animations are unsupported, plus the --p scroll-progress fallback on
     [data-scrub] (stage zoom, floating phone)
   Everything is undone on unmount so nothing leaks into the next route. */
export function CaseRuntime({ tone }: { tone: 'dark' | 'light' }) {
    useLayoutEffect(() => {
        const root = document.documentElement;
        const cleanups: Array<() => void> = [];
        if (tone === 'light') {
            root.setAttribute('data-case-tone', 'light');
            cleanups.push(() => root.removeAttribute('data-case-tone'));
        }
        const motion = root.classList.contains('motion');
        const sdt = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: view()');
        const main = document.getElementById('main');
        if (motion && !sdt && main) {
            root.classList.add('no-sdt');
            cleanups.push(() => root.classList.remove('no-sdt'));
            const scrubs = Array.from(main.querySelectorAll<HTMLElement>('[data-scrub]'));
            if (scrubs.length) {
                let queued = false;
                let raf = 0;
                const scrub = () => {
                    queued = false;
                    const vh = window.innerHeight;
                    scrubs.forEach((el) => {
                        const r = el.getBoundingClientRect();
                        const p = (vh - r.top) / (vh + r.height);
                        el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
                    });
                };
                const onScroll = () => {
                    if (!queued) {
                        queued = true;
                        raf = requestAnimationFrame(scrub);
                    }
                };
                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('resize', scrub);
                scrub();
                cleanups.push(() => {
                    cancelAnimationFrame(raf);
                    window.removeEventListener('scroll', onScroll);
                    window.removeEventListener('resize', scrub);
                    scrubs.forEach((el) => el.style.removeProperty('--p'));
                });
            }
        }
        return () => cleanups.forEach((fn) => fn());
    }, [tone]);
    return null;
}
