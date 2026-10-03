import { PageStyle } from '@/core/site/chrome';
import { PROJECTS } from '@/lib/site/projects';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

/* Port of design-options/site/404.html (generator: tools/sitebuild/nf.py). */

export const metadata: Metadata = {
    title: { absolute: 'Page not found — Felix Yeboah' },
    description: 'This page does not exist. Head back to the work, the writing or the landing page.',
};

export default function NotFound() {
    return (
        <main id="main" className="wrap nf">
            <PageStyle name="notfound" />
            <p className="nf__code" aria-hidden="true" data-reveal="" data-instant="">
                4<em>0</em>4
            </p>
            <p className="nf__k mono" data-reveal="" data-instant="" style={{ '--d': '80ms' } as CSSProperties}>
                <span className="dot" aria-hidden="true" />
                Error 404 &middot; page not found
            </p>
            <h1 data-reveal="" data-instant="" style={{ '--d': '140ms' } as CSSProperties}>
                This page shipped somewhere else. <span className="soft">Or never shipped at all.</span>
            </h1>
            <p className="nf__lede" data-reveal="" data-instant="" style={{ '--d': '200ms' } as CSSProperties}>
                The link may be old, or the address may have a typo. Try one of these instead.
            </p>
            <div className="nf__btns" data-reveal="" data-instant="" style={{ '--d': '260ms' } as CSSProperties}>
                <Link className="btn btn--accent magnetic" href="/">
                    Back to the start{' '}
                    <svg className="arrow-r" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>{' '}
                <a className="btn btn--ghost magnetic" href="mailto:me@felixyeboah.dev?subject=Broken%20link%20on%20felixyeboah.dev">
                    Report a broken link
                </a>
            </div>
            <nav aria-label="Site pages">
                <ul className="nf__list" data-reveal="">
                    <li>
                        <Link className="nf__row" href="/">
                            <span className="mono">01</span>
                            <span className="nf__t">Home</span>
                            <span className="mono nf__s">The landing page</span>
                            <span className="nf__a">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link className="nf__row" href="/work">
                            <span className="mono">02</span>
                            <span className="nf__t">Work</span>
                            <span className="mono nf__s">{PROJECTS.length} projects, latest first</span>
                            <span className="nf__a">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link className="nf__row" href="/writing">
                            <span className="mono">03</span>
                            <span className="nf__t">Writing</span>
                            <span className="mono nf__s">21 posts, newest first</span>
                            <span className="nf__a">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link className="nf__row" href="/about">
                            <span className="mono">04</span>
                            <span className="nf__t">About</span>
                            <span className="mono nf__s">How I got into tech</span>
                            <span className="nf__a">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link className="nf__row" href="/contact">
                            <span className="mono">05</span>
                            <span className="nf__t">Contact</span>
                            <span className="mono nf__s">Start a project</span>
                            <span className="nf__a">
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </main>
    );
}
