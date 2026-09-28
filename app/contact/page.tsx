import { PageStyle } from '@/core/site/chrome';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { ContactForm } from './contact-form';

/* Port of design-options/site/contact.html (generator: tools/sitebuild/contact.py). */

export const metadata: Metadata = {
    title: { absolute: 'Contact — Felix Yeboah' },
    description: 'Start a project with Felix Yeboah, software engineer and designer in Accra, Ghana. Email me@felixyeboah.dev.',
};

export default function ContactPage() {
    return (
        <main id="main">
            <PageStyle name="contact" />
            <header className="pagehead wrap">
                <p className="pagehead__crumb mono" data-reveal="">
                    <Link href="/">Index</Link>
                    <span className="sep" aria-hidden="true" />
                    <span aria-current="page">Contact</span>
                    <span className="end">
                        <span className="dot" aria-hidden="true" />
                        Taking on select projects
                    </span>
                </p>
                <h1 className="pagehead__title" data-reveal="" style={{ '--d': '60ms' } as CSSProperties}>
                    Have a product worth building? <span className="soft">Let&rsquo;s talk.</span>
                </h1>
                <div className="pagehead__foot">
                    <p className="pagehead__lede" data-reveal="" style={{ '--d': '140ms' } as CSSProperties}>
                        Tell me about the product, the problem and the people who&rsquo;ll use it. The form opens your email app with
                        everything filled in, so nothing is stored here.
                    </p>
                    <p className="pagehead__meta mono" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                        Accra, Ghana
                        <br />
                        UTC+0
                    </p>
                </div>
            </header>
            <div className="wrap cgrid">
                <section className="card card--glow" aria-labelledby="form-title" data-reveal="">
                    <h2 className="sr-only" id="form-title">
                        Project enquiry
                    </h2>
                    <ContactForm />
                </section>
                <aside className="aside" aria-label="Other ways to reach me">
                    <div className="card" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                        <h2 className="mono">Email</h2>
                        <a className="bigmail" href="mailto:me@felixyeboah.dev">
                            me@felixyeboah.dev
                        </a>
                        <br />{' '}
                        <button className="btn btn--ghost copy" type="button" data-copy="me@felixyeboah.dev">
                            Copy email
                        </button>
                    </div>
                    <div className="card" data-reveal="" style={{ '--d': '140ms' } as CSSProperties}>
                        <h2 className="mono">Elsewhere</h2>
                        <ul className="links">
                            <li>
                                <a href="https://x.com/sudocode_" target="_blank" rel="noopener">
                                    X / Twitter{' '}
                                    <span>
                                        @sudocode_{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/felixyeboah" target="_blank" rel="noopener">
                                    GitHub{' '}
                                    <span>
                                        felixyeboah{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="https://chat.whatsapp.com/DsQpntdph4L7xE9ZUVXu1j" target="_blank" rel="noopener">
                                    Remix Community Ghana{' '}
                                    <span>
                                        WhatsApp{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <Link href="/resume">
                                    Resume <span>Printable &rarr;</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="card" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                        <h2 className="mono">Local time</h2>
                        <p className="time">
                            <span data-clock="" style={{ all: 'unset' }}>
                                14:02
                            </span>
                            <span>GMT</span>
                        </p>
                        <p className="status mono">
                            <span className="dot" aria-hidden="true" />
                            Accra, Ghana &middot; UTC+0
                        </p>
                    </div>
                </aside>
            </div>
        </main>
    );
}
