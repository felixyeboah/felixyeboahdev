'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { LINKS } from '@/lib/site/fy';

export const NAV = [
    ['work', 'Work', '/work'],
    ['about', 'About', '/about'],
    ['writing', 'Writing', '/writing'],
    ['resume', 'Resume', '/resume'],
    ['contact', 'Contact', '/contact'],
] as const;

export type NavKey = (typeof NAV)[number][0];

export function activeFor(pathname: string): NavKey | null {
    const hit = NAV.find(([, , href]) => pathname === href || pathname.startsWith(href + '/'));
    return hit ? hit[0] : null;
}

/** Floating pill nav + mobile panel (markup from design-options/site/assets/CHROME.md). */
export function Nav() {
    const pathname = usePathname();
    const active = activeFor(pathname);
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                btnRef.current?.focus();
            }
        };
        const onClick = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onResize = () => {
            if (window.innerWidth > 960) setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('click', onClick);
        window.addEventListener('resize', onResize);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
        };
    }, [open]);

    const cur = (k: NavKey) => (k === active ? ('page' as const) : undefined);
    const cls = ['nav', scrolled && 'is-scrolled', open && 'is-open'].filter(Boolean).join(' ');

    return (
        <header className={cls} id="nav" ref={navRef}>
            <div className="nav__bar">
                <Link className="brand" href="/" aria-label="Felix Yeboah, home">
                    <span className="brand__mark" aria-hidden="true">
                        FY
                    </span>
                    <span className="brand__name">Felix Yeboah</span>
                </Link>
                <nav aria-label="Primary">
                    <ul className="nav__links">
                        {NAV.map(([k, label, href]) => (
                            <li key={k}>
                                <Link href={href} data-nav={k} aria-current={cur(k)}>
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <span className="clock mono" aria-label="Local time in Accra">
                    <span className="dot" aria-hidden="true" />
                    <span>
                        <span className="clock__city">Accra </span>
                        <b data-clock suppressHydrationWarning>
                            --:--
                        </b>{' '}
                        <span className="clock__tz">GMT</span>
                    </span>
                </span>
                <Link className="btn btn--accent nav__cta magnetic" href="/contact">
                    Let&apos;s talk
                </Link>
                <button
                    ref={btnRef}
                    className="menu-btn"
                    type="button"
                    aria-expanded={open}
                    aria-controls="nav-panel"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span className="menu-btn__label">{open ? 'Close' : 'Menu'}</span>
                    <span className="menu-btn__icon" aria-hidden="true" />
                </button>
            </div>
            <div className="nav__panel" id="nav-panel">
                <ul>
                    {NAV.map(([k, label, href], i) => (
                        <li key={k}>
                            <Link href={href} data-nav={k} aria-current={cur(k)} onClick={() => setOpen(false)}>
                                {label} <span className="mono">0{i + 1}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="nav__panel-foot">
                    <Link className="btn btn--accent" href="/contact" onClick={() => setOpen(false)}>
                        Let&apos;s talk
                    </Link>
                    <a className="btn btn--ghost" href={LINKS.x} target="_blank" rel="noopener">
                        @sudocode_
                    </a>
                </div>
            </div>
        </header>
    );
}
