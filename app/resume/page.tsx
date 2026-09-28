import { PageStyle } from '@/core/site/chrome';
import { PROJECTS, pad2 } from '@/lib/site/projects';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PrintButton } from './print-button';

/* Port of design-options/site/resume.html (generator: tools/sitebuild/resume.py). */

export const metadata: Metadata = {
    title: { absolute: 'Resume — Felix Yeboah' },
    description:
        'Resume of Felix Yeboah: senior frontend engineer and team lead at Complete Farmer, formerly at Primer. React, Remix, Go and Postgres. Accra, Ghana.',
};

const featured = PROJECTS.filter((p) => p.featured);

export default function ResumePage() {
    return (
        <main id="main">
            <PageStyle name="resume" />
            <header className="pagehead wrap">
                <p className="pagehead__crumb mono" data-reveal="">
                    <Link href="/">Index</Link>
                    <span className="sep" aria-hidden="true" />
                    <span aria-current="page">Resume</span>
                    <span className="end">
                        <span className="dot" aria-hidden="true" />
                        Taking on select projects
                    </span>
                </p>
                <h1 className="pagehead__title" data-reveal="" style={{ '--d': '60ms' } as CSSProperties}>
                    Felix Yeboah. <span className="soft">Software engineer &amp; UI/UX designer.</span>
                </h1>
                <div className="pagehead__foot">
                    <div className="pagehead__lede" data-reveal="" style={{ '--d': '140ms' } as CSSProperties}>
                        <p>
                            Self-taught, based in Accra. Ten years taking products from first sketch to production: React and Remix on the
                            front, Go and Postgres underneath.
                        </p>
                        <p className="rhead__contact mono">
                            <a href="mailto:me@felixyeboah.dev">me@felixyeboah.dev</a>
                            <a href="https://github.com/felixyeboah" target="_blank" rel="noopener">
                                github.com/felixyeboah
                            </a>
                            <a href="https://x.com/sudocode_" target="_blank" rel="noopener">
                                x.com/sudocode_
                            </a>
                            <span>Accra, Ghana &middot; UTC+0</span>
                            <span className="print-only">felixyeboah.dev</span>
                        </p>
                        <div className="rhead__actions">
                            <PrintButton />{' '}
                            <button className="btn btn--ghost" type="button" data-copy="me@felixyeboah.dev">
                                Copy email
                            </button>
                        </div>
                    </div>
                    <p className="pagehead__meta mono" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                        10+ years
                        <br />
                        Web &amp; mobile
                    </p>
                </div>
            </header>
            <div className="wrap">
                <section className="rsec" aria-labelledby="xp-title">
                    <h2 className="rsec__label mono" id="xp-title" data-reveal="">
                        <i>(01)</i> Experience
                    </h2>
                    <div>
                        <p className="rsec__intro" data-reveal="">
                            I have worked with a number of companies and startups. Here are some of the companies I have worked with.
                        </p>
                        <ol className="xp">
                            <li data-reveal="">
                                <div className="xp__when mono">
                                    <span>
                                        <span className="dot" aria-hidden="true" />
                                        May 2019 &mdash; Present
                                    </span>
                                    <em>Full-time</em>
                                </div>
                                <div>
                                    <h3>Senior Frontend Engineer</h3>
                                    <span className="xp__co">
                                        <a href="https://completefarmer.com" target="_blank" rel="noopener">
                                            Complete Farmer
                                        </a>{' '}
                                        &middot; Team Lead, Grower Agent Platform
                                    </span>
                                    <p>
                                        Frontend engineer role focused on developing high-quality, performant, and scalable products used by
                                        clients and in-house. Reviewing code by other engineers and managing junior developers.
                                    </p>
                                    <p>
                                        Currently Team Lead for the Grower Agent Platform, overseeing the development of the frontend and
                                        backend of the platform. The team built a platform that has onboarded over 60,000 farmers and
                                        increased farmer productivity by 30%.
                                    </p>
                                    <div className="xp__tags">
                                        <span>Team lead</span>
                                        <span>Frontend</span>
                                        <span>Backend</span>
                                        <span>Code review</span>
                                    </div>
                                </div>
                            </li>
                            <li data-reveal="">
                                <div className="xp__when mono">
                                    <span>Jan 2022 &mdash; Aug 2022</span>
                                    <em>Contract &middot; UK</em>
                                </div>
                                <div>
                                    <h3>Frontend Engineer</h3>
                                    <span className="xp__co">
                                        <a href="https://primer.io" target="_blank" rel="noopener">
                                            Primer API Limited
                                        </a>
                                    </span>
                                    <p>
                                        Frontend engineer contributing directly to the success and growth of the product area. Working
                                        closely with Product, Design, and Engineering teams to bring elegant and intuitive experiences to
                                        life. Heavily involved in key technology decisions and features, building for scale, and optimizing
                                        for output.
                                    </p>
                                    <div className="xp__tags">
                                        <span>Frontend</span>
                                        <span>Product</span>
                                        <span>Design collaboration</span>
                                    </div>
                                </div>
                            </li>
                            <li data-reveal="">
                                <div className="xp__when mono">
                                    <span>Feb 2018 &mdash; Jun 2021</span>
                                </div>
                                <div>
                                    <h3>Web Developer</h3>
                                    <span className="xp__co">Bee and Bloom</span>
                                    <p>
                                        Frontend engineer role focused on implementing small to medium features and leading on design.
                                        Making sure every feature implemented is well tested and is used by end-users.
                                    </p>
                                    <div className="xp__tags">
                                        <span>Frontend</span>
                                        <span>Design</span>
                                        <span>Testing</span>
                                    </div>
                                </div>
                            </li>
                            <li data-reveal="">
                                <div className="xp__when mono">
                                    <span>2020 &mdash; 2024</span>
                                    <em>Independent</em>
                                </div>
                                <div>
                                    <h3>Independent client work</h3>
                                    <span className="xp__co">Payments, commerce, drones, ride-sharing and more</span>
                                    <p>
                                        Products and sites designed and built end to end for clients.{' '}
                                        <Link className="link-arrow no-print" href="/work" style={{ display: 'inline-flex' }}>
                                            See all {PROJECTS.length} projects{' '}
                                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                <path
                                                    d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </Link>
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </section>
                <section className="rsec" aria-labelledby="early-title">
                    <h2 className="rsec__label mono" id="early-title" data-reveal="">
                        <i>(02)</i> Earlier
                    </h2>
                    <ol className="xp xp--small">
                        <li data-reveal="">
                            <div className="xp__when mono">
                                <span>2016</span>
                            </div>
                            <div>
                                <h3>First job as a software developer</h3>
                            </div>
                        </li>
                        <li data-reveal="">
                            <div className="xp__when mono">
                                <span>2012 &mdash; 2016</span>
                            </div>
                            <div>
                                <h3>Self-taught, freelancing</h3>
                                <p>Started learning to code on my own after high school, working mostly as a freelancer.</p>
                            </div>
                        </li>
                    </ol>
                </section>
                <section className="rsec" aria-labelledby="proof-title">
                    <h2 className="rsec__label mono" id="proof-title" data-reveal="">
                        <i>(03)</i> Impact
                    </h2>
                    <div className="rstats" data-stagger="">
                        <div className="rstat" data-reveal="">
                            <span className="mono soft">Building</span>
                            <b>
                                10<i>+</i>
                            </b>
                            <p>Years designing and shipping for web and mobile.</p>
                        </div>
                        <div className="rstat" data-reveal="">
                            <span className="mono soft">Complete Farmer</span>
                            <b>
                                60,000<i>+</i>
                            </b>
                            <p>Farmers onboarded through the Grower Agent Platform.</p>
                        </div>
                        <div className="rstat" data-reveal="">
                            <span className="mono soft">Impact</span>
                            <b>
                                <i>+</i>30<i>%</i>
                            </b>
                            <p>Increase in farmer productivity on the platform my team built.</p>
                        </div>
                    </div>
                </section>
                <section className="rsec" aria-labelledby="skills-title">
                    <h2 className="rsec__label mono" id="skills-title" data-reveal="">
                        <i>(04)</i> Skills
                    </h2>
                    <div className="skills" data-stagger="">
                        <article className="skill" data-reveal="">
                            <h3>
                                Product engineering <span className="mono">01</span>
                            </h3>
                            <ul>
                                <li>
                                    Web &amp; mobile apps <i>End to end</i>
                                </li>
                                <li>
                                    Remix &middot; Next.js &middot; React <i>TS</i>
                                </li>
                                <li>
                                    Payments <i>Paystack &middot; Hubtel</i>
                                </li>
                                <li>
                                    CMS <i>Sanity</i>
                                </li>
                            </ul>
                        </article>
                        <article className="skill" data-reveal="">
                            <h3>
                                Interface design <span className="mono">02</span>
                            </h3>
                            <ul>
                                <li>
                                    Product &amp; UI design <i>Figma</i>
                                </li>
                                <li>
                                    Design systems <i>Tailwind</i>
                                </li>
                                <li>
                                    Motion <i>GSAP &middot; Framer</i>
                                </li>
                                <li>
                                    Prototyping <i>In code</i>
                                </li>
                            </ul>
                        </article>
                        <article className="skill" data-reveal="">
                            <h3>
                                Backend &amp; APIs <span className="mono">03</span>
                            </h3>
                            <ul>
                                <li>
                                    Services <i>Go &middot; Node</i>
                                </li>
                                <li>
                                    Data <i>Postgres &middot; Prisma</i>
                                </li>
                                <li>
                                    Testing <i>Mockery</i>
                                </li>
                                <li>
                                    Infra <i>AWS &middot; Vercel</i>
                                </li>
                            </ul>
                        </article>
                        <article className="skill" data-reveal="">
                            <h3>
                                Mentorship &amp; community <span className="mono">04</span>
                            </h3>
                            <ul>
                                <li>
                                    Remix Community Ghana <i>Lead</i>
                                </li>
                                <li>
                                    Mentoring developers <i>1:1</i>
                                </li>
                                <li>
                                    Team lead <i>Complete Farmer</i>
                                </li>
                                <li>
                                    Writing <i>Blog</i>
                                </li>
                            </ul>
                        </article>
                    </div>
                </section>
                <section className="rsec" aria-labelledby="sel-title">
                    <h2 className="rsec__label mono" id="sel-title" data-reveal="">
                        <i>(05)</i> Selected work
                    </h2>
                    <div data-reveal="">
                        <ol>
                            {featured.map((p) => (
                                <li key={p.slug}>
                                    <Link className="sel" href={`/work/${p.slug}`}>
                                        <span className="mono sel__n">{pad2(p.order)}</span>
                                        <span className="sel__t">{p.name}</span>
                                        <span className="mono sel__c">{p.category}</span>
                                        <span className="mono sel__d">{p.domain}</span>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                        <p className="rfoot mono no-print">
                            <Link className="link-arrow" href="/work">
                                All projects{' '}
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                            <Link className="link-arrow" href="/writing">
                                Writing{' '}
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
