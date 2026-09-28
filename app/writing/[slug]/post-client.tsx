'use client';

import { copy, splitWords } from '@/lib/site/fy';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* Post page behaviour, ported from design-options/tools/sitebuild/writing_post.client.js.
   fy.ts (SiteRuntime) already owns the menu, clock, year, [data-copy] ("Copy link"), reveal and magnetic CTAs;
   this only adds what is specific to a post: code copy/collapse, the title word split, client-side navigation
   for internal links inside the rendered body, and the mini TOC (<Toc>). */

const CHEV =
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function PostBehaviour() {
    const router = useRouter();

    useEffect(() => {
        const doc = document;
        const article = doc.getElementById('article-body');
        const cleanups: Array<() => void> = [];
        const on = (el: EventTarget, type: string, fn: EventListener) => {
            el.addEventListener(type, fn);
            cleanups.push(() => el.removeEventListener(type, fn));
        };

        /* Code panels: copy + collapse (> 40 lines) */
        article?.querySelectorAll<HTMLElement>('.code').forEach((fig) => {
            const b = fig.querySelector<HTMLButtonElement>('.code__copy');
            const txt = b?.querySelector('span');
            const lines = fig.querySelectorAll('.l');
            if (b && txt) {
                let t: ReturnType<typeof setTimeout> | undefined;
                on(b, 'click', () => {
                    const code = Array.prototype.map
                        .call(lines, (l: Element) => l.textContent)
                        .join('\n');
                    copy(code).then((ok) => {
                        if (!ok) {
                            txt.textContent = 'Press ⌘C';
                            return;
                        }
                        b.classList.add('is-done');
                        txt.textContent = 'Copied';
                        clearTimeout(t);
                        t = setTimeout(() => {
                            b.classList.remove('is-done');
                            txt.textContent = 'Copy';
                        }, 1800);
                    });
                });
                cleanups.push(() => {
                    clearTimeout(t);
                    b.classList.remove('is-done');
                    txt.textContent = 'Copy';
                });
            }
            const n = lines.length;
            if (n > 40) {
                fig.classList.add('is-long');
                const more = doc.createElement('button');
                more.type = 'button';
                more.className = 'code__more mono';
                more.setAttribute('aria-expanded', 'false');
                more.innerHTML = '<span>Show all ' + n + ' lines</span>' + CHEV;
                fig.appendChild(more);
                on(more, 'click', () => {
                    const open = !fig.classList.contains('is-open');
                    fig.classList.toggle('is-open', open);
                    more.setAttribute('aria-expanded', open ? 'true' : 'false');
                    more.querySelector('span')!.textContent = open
                        ? 'Collapse'
                        : 'Show all ' + n + ' lines';
                    if (!open) {
                        const r = fig.getBoundingClientRect();
                        if (r.top < 0) window.scrollBy(0, r.top - 110);
                    }
                });
                cleanups.push(() => {
                    more.remove();
                    fig.classList.remove('is-long', 'is-open');
                });
            }
        });

        /* internal links inside the rendered body (post links, "Filed under" chips): client-side navigation */
        if (article)
            on(article, 'click', ((e: MouseEvent) => {
                if (
                    e.defaultPrevented ||
                    e.button !== 0 ||
                    e.metaKey ||
                    e.ctrlKey ||
                    e.shiftKey ||
                    e.altKey
                )
                    return;
                const a = (e.target as Element).closest?.('a');
                const href = a?.getAttribute('href');
                if (
                    !a ||
                    !href ||
                    !href.startsWith('/') ||
                    href.startsWith('//') ||
                    a.hasAttribute('target') ||
                    a.hasAttribute('download')
                )
                    return;
                e.preventDefault();
                router.push(href);
            }) as EventListener);

        /* Title: masked word reveal (motion only; splitWords keeps an aria-label with the full title) */
        if (doc.documentElement.classList.contains('motion'))
            splitWords(doc.querySelector<HTMLElement>('.ptitle'));

        return () => cleanups.forEach((fn) => fn());
    }, [router]);

    return null;
}

export type TocItem = { id: string; n: string; t: string };

const C = 2 * Math.PI * 10;

/** Mini TOC built from the article's h2s (the page only renders it with two or more). */
export function Toc({ heads }: { heads: TocItem[] }) {
    const items: TocItem[] = [
        { id: 'article-body', n: '00', t: 'Introduction' },
        ...heads,
    ];
    const [open, setOpen] = useState(false);
    const [shown, setShown] = useState(false);
    const [cur, setCur] = useState(-1);
    const [pct, setPct] = useState(0);
    const tocRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const curRef = useRef(cur);

    /* scroll spy, visibility and reading progress */
    useEffect(() => {
        const article = document.getElementById('article-body');
        const hero = document.querySelector('.phead');
        const end = document.querySelector('.author');
        if (!article || !hero || !end) return;
        const els = items.map((it) => document.getElementById(it.id));
        const update = () => {
            const vh = window.innerHeight;
            const isOn =
                hero.getBoundingClientRect().bottom < 0 &&
                end.getBoundingClientRect().top > vh * 0.82;
            setShown(isOn);
            if (!isOn) setOpen(false);
            const line = vh * 0.38;
            let idx = 0;
            for (let i = 1; i < els.length; i++) {
                const el = els[i];
                if (el && el.getBoundingClientRect().top < line) idx = i;
            }
            curRef.current = idx;
            setCur(idx);
            const r = article.getBoundingClientRect();
            setPct(
                Math.min(
                    1,
                    Math.max(0, (-r.top + vh * 0.2) / (r.height - vh * 0.6)),
                ),
            );
        };
        let raf = 0;
        const onScroll = () => {
            if (!raf)
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    update();
                });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the headings are static for the page's lifetime
    }, []);

    /* opening focuses the current heading's link; Escape closes (focus back on the button); a click outside closes */
    useEffect(() => {
        if (!open) return;
        linkRefs.current[Math.max(curRef.current, 0)]?.focus({
            preventScroll: true,
        });
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                btnRef.current?.focus();
            }
        };
        const onClick = (e: MouseEvent) => {
            if (tocRef.current && !tocRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClick);
        };
    }, [open]);

    const active = items[Math.max(cur, 0)];

    return (
        <div
            className={
                'toc' + (shown ? ' is-on' : '') + (open ? ' is-open' : '')
            }
            id="toc"
            aria-hidden={shown ? 'false' : 'true'}
            ref={tocRef}
        >
            <nav className="toc__menu" id="toc-menu" aria-label="On this page">
                <p className="toc__head mono">
                    <b>On this page</b>
                    <span data-toc-pct>{Math.round(pct * 100)}% read</span>
                </p>
                <ol
                    data-toc-list
                    onClick={(e) => {
                        const a = (e.target as Element).closest('a');
                        if (!a) return;
                        setOpen(false);
                        /* a native #hash jump would add a history entry the App Router can't restore
                           (Back from a later page would keep the wrong page), so push it through history
                           (Next adds its state) and scroll like the anchor would */
                        const id = a.getAttribute('href')!.slice(1);
                        const target = document.getElementById(id);
                        if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        if (location.hash !== '#' + id) window.history.pushState(null, '', '#' + id);
                        target.scrollIntoView();
                    }}
                >
                    {items.map((it, i) => (
                        <li key={it.id}>
                            <a
                                href={'#' + it.id}
                                aria-current={i === cur ? 'true' : undefined}
                                ref={(el) => {
                                    linkRefs.current[i] = el;
                                }}
                            >
                                <span className="mono">{it.n}</span>
                                <span>{it.t}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
            <button
                className="toc__btn"
                type="button"
                aria-expanded={open ? 'true' : 'false'}
                aria-controls="toc-menu"
                tabIndex={shown ? 0 : -1}
                onClick={() => setOpen(!open)}
                ref={btnRef}
            >
                <svg
                    className="toc__ring"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle className="bg" cx="12" cy="12" r="10" />
                    <circle
                        className="fg"
                        cx="12"
                        cy="12"
                        r="10"
                        style={{
                            strokeDasharray: C,
                            strokeDashoffset: C * (1 - pct),
                        }}
                    />
                </svg>
                <span className="toc__n mono" data-toc-n>
                    {cur < 0 ? '00' : active.n}
                </span>
                <span className="toc__t" data-toc-t>
                    {cur < 0 ? 'Introduction' : active.t}
                </span>
                <svg
                    className="toc__chev"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M4 10l4-4 4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
