import { PageStyle } from '@/core/site/chrome';
import { fmtMonth, getPosts, isoDate } from '@/lib/site/posts';
import { PROJECTS, pad2 } from '@/lib/site/projects';
import Link from 'next/link';
import { type CSSProperties, Fragment } from 'react';

import { HeroTitle } from './_landing/hero-title';
import { PrinciplesPlay } from './_landing/principles-play';
import { HERO_SPLIT_SCRIPT } from './_landing/split';

/* Port of design-options/site/index.html (generator: tools/sitebuild/landing.py).
   Title/description come from the root layout defaults. Scroll-spy: data-spy on <main> (lib/site/fy.ts). */

const featured = PROJECTS.filter((p) => p.featured);
const archive = PROJECTS.filter((p) => !p.featured);

/* The landing's hand-picked writing list, newest first; a few titles are shortened for the landing. */
const LANDING_POSTS: Array<[slug: string, title?: string]> = [
    ['why-i-built-reevit', "Why I Built Reevit: A Developer's Reaction to a Real Problem"],
    ['my-2024-in-review', 'A Year of Resilience and Growth — 2024 in review'],
    ['from-zero-to-go-how-real-projects-shaped-my-golang-skills'],
    ['mock-testing-with-go-mockery'],
    ['transitioning-to-backend-engineering'],
    ['how-i-got-sold-on-remix', 'How I got sold on Remix'],
];

function landingPosts() {
    const all = getPosts();
    return LANDING_POSTS.map(([slug, title]) => {
        const post = all.find((p) => p.slug === slug);
        if (!post) throw new Error(`Landing post not found: ${slug}`);
        return { slug, title: title ?? post.title, month: isoDate(post.date).slice(0, 7), label: fmtMonth(post.date) };
    });
}

export default function Home() {
    const writing = landingPosts();
    return (
        <>
            <main id="main" data-spy="">
                <PageStyle name="landing" />
                {/* HERO */}
                <section className="hero wrap" aria-labelledby="hero-title">
                    <figure className="portrait" data-reveal="">
                        <img
                            src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1100/felixyeboah.dev/IMG_7337_tmsrzq"
                            srcSet="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_700/felixyeboah.dev/IMG_7337_tmsrzq 700w, https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1100/felixyeboah.dev/IMG_7337_tmsrzq 1100w, https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1500/felixyeboah.dev/IMG_7337_tmsrzq 1500w"
                            sizes="(max-width: 900px) 100vw, 42vw"
                            width={1100}
                            height={1467}
                            alt="Felix Yeboah wearing headphones, working on a laptop"
                            fetchPriority="high"
                        />{' '}
                        <span className="portrait__chip mono">
                            <span className="dot" aria-hidden="true" />
                            Taking on select projects
                        </span>
                        <figcaption className="portrait__meta mono">
                            <span>
                                <strong>Felix Yeboah</strong>Engineer / Designer
                            </span>{' '}
                            <span style={{ textAlign: 'right' }}>
                                5.6037° N<br />
                                0.1870° W
                            </span>
                        </figcaption>
                    </figure>
                    <div className="hero__copy">
                        <div className="hero__top mono" data-reveal="">
                            <span>Software engineer &amp; UI/UX designer</span> <span>Index — 2026</span>
                        </div>
                        <div>
                            <HeroTitle />
                            <p className="hero__sub" data-reveal="" style={{ '--d': '380ms' } as CSSProperties}>
                                Self-taught, based in Accra. Ten years taking products from first sketch to production — React and Remix on
                                the front, Go and Postgres underneath.
                            </p>
                            <div className="hero__ctas" data-reveal="" style={{ '--d': '480ms' } as CSSProperties}>
                                <a className="btn btn--accent magnetic" href="#work">
                                    View work{' '}
                                    <svg className="arrow-down" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path
                                            d="M8 2.5v11m0 0L3.5 9M8 13.5 12.5 9"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>{' '}
                                </a>{' '}
                                <a className="btn btn--ghost magnetic" href="mailto:me@felixyeboah.dev">
                                    Email me{' '}
                                    <svg className="arrow-ne" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path
                                            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>{' '}
                                </a>
                            </div>
                        </div>
                        <dl className="hero__meta mono" data-reveal="" style={{ '--d': '560ms' } as CSSProperties}>
                            <div>
                                <dt>Experience</dt>
                                <dd>10+ yrs</dd>
                            </div>
                            <div>
                                <dt>Based</dt>
                                <dd>Accra, GH · UTC+0</dd>
                            </div>
                            <div>
                                <dt>Stack</dt>
                                <dd>Remix / Go / React / Postgres</dd>
                            </div>
                        </dl>
                    </div>
                </section>
                {/* WORK */}
                <section
                    className="section"
                    id="work"
                    data-spy-target="work"
                    aria-labelledby="work-title"
                    style={{ paddingTop: 'clamp(40px,5vw,80px)', paddingBottom: 'clamp(72px,8vw,128px)' }}
                >
                    <div className="wrap">
                        <div className="shead">
                            <p className="shead__label mono" data-reveal="">
                                <i>(01)</i> Selected work
                            </p>
                            <h2 className="shead__title" id="work-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                Products built end to end, <span className="soft">design through deploy.</span>
                            </h2>
                            <p className="shead__aside mono" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                                Latest first · {PROJECTS.length} projects
                                <br />
                                <Link className="link-arrow" href="/work" style={{ marginTop: '8px' }}>
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
                            </p>
                        </div>
                    </div>
                    <div className="work" data-stagger="">
                        {featured.map((p, i) => (
                            <Fragment key={p.slug}>
                                {i > 0 ? ' ' : null}
                                <Link className="tile" href={`/work/${p.slug}`} data-reveal="">
                                    <div className="tile__top">
                                        <span className="tile__idx mono">
                                            <b>{pad2(p.order)}</b> {p.category}
                                        </span>
                                        <span className="tile__go" aria-hidden="true">
                                            <svg viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                    <div className="tile__shot" aria-hidden="true">
                                        <div className="tile__bar">
                                            <i />
                                            <i />
                                            <i />
                                            <span className="tile__url">{p.domain}</span>
                                        </div>
                                        <div className="tile__img">
                                            <img src={p.cover} width={1600} height={1000} alt="" loading="lazy" decoding="async" />
                                        </div>
                                    </div>
                                    <div className="tile__meta">
                                        <div>
                                            <h3>{p.name}</h3>
                                            <p className="tile__desc">{p.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            </Fragment>
                        ))}
                    </div>
                    <div className="wrap">
                        <div className="arch" data-reveal="">
                            <p className="arch__label mono">
                                <span>More work</span>
                                <span>{archive.length} projects</span>
                            </p>
                            <ol className="arch__list">
                                {archive.map((p) => (
                                    <li key={p.slug}>
                                        <Link className="arch__row" href={`/work/${p.slug}`} data-img={p.cover}>
                                            <span className="arch__n mono">{pad2(p.order)}</span>
                                            <span className="arch__t">{p.name}</span>
                                            <span className="arch__c mono">{p.category}</span>
                                            <span className="arch__s mono">{p.domain}</span>
                                            <span className="arch__a">
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
                                ))}
                            </ol>
                            <img className="arch__peek" alt="" aria-hidden="true" decoding="async" />
                        </div>
                    </div>
                    <div className="wrap">
                        <Link className="allbar" href="/work" data-reveal="">
                            <span className="allbar__t">All projects</span>{' '}
                            <span className="allbar__n mono">{PROJECTS.length} in total</span>{' '}
                            <span className="allbar__go" aria-hidden="true">
                                <svg viewBox="0 0 16 16" fill="none">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </section>
                {/* PRINCIPLES */}
                <section className="section" aria-labelledby="principles-title" style={{ paddingTop: '0' }}>
                    <div className="wrap">
                        <div className="shead">
                            <p className="shead__label mono" data-reveal="">
                                <i>(02)</i> How I work
                            </p>
                            <h2 className="shead__title" id="principles-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                Six things I won't compromise on.
                            </h2>
                        </div>
                        <ol className="pgrid" data-stagger="">
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">01</span>
                                    <span className="p__tag mono">Product</span>
                                </div>
                                <div className="p__art" aria-hidden="true">
                                    <div className="flow">
                                        <span className="flow__c">Problem</span>
                                        <span className="flow__l" /> <span className="flow__c">Person</span>
                                        <span className="flow__l" /> <span className="flow__c flow__c--last">Stack</span>
                                    </div>
                                </div>
                                <div className="p__body">
                                    <h3>Product first</h3>
                                    <p>Start with the problem and the person using it. The stack comes after.</p>
                                </div>
                            </li>
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">02</span>
                                    <span className="p__tag mono">Craft</span>
                                </div>
                                <div className="p__art" aria-hidden="true">
                                    <div className="spec">
                                        <span className="spec__btn">
                                            Book a call{' '}
                                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                <path
                                                    d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>{' '}
                                        <span className="spec__m spec__m--w">164</span> <span className="spec__m spec__m--h">44</span>{' '}
                                        <span className="spec__ring" />{' '}
                                        <svg className="spec__cur" viewBox="0 0 18 18" fill="currentColor">
                                            <path
                                                d="M3 1.5v13.2l3.6-3.4 2.3 5.2 2.3-1-2.3-5.1h4.9z"
                                                stroke="#0B0B0C"
                                                strokeWidth="1"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="p__body">
                                    <h3>Design-literate engineering</h3>
                                    <p>Spacing, motion and empty states get the same care as the database schema.</p>
                                </div>
                            </li>
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">03</span>
                                    <span className="p__tag mono">Cadence</span>
                                </div>
                                <div className="p__art" aria-hidden="true">
                                    <ul className="log">
                                        <li className="log__new">
                                            <div className="log__row">
                                                <span className="log__d" />
                                                <span className="log__v">v1.5</span>
                                                <span>in review</span>
                                                <span className="log__t">now</span>
                                            </div>
                                        </li>
                                        <li className="log__live">
                                            <div className="log__row">
                                                <span className="log__d" />
                                                <span className="log__v">v1.4</span>
                                                <span className="log__swap">
                                                    <span>in review</span>
                                                    <span>shipped</span>
                                                </span>
                                                <span className="log__t log__swap">
                                                    <span>now</span>
                                                    <span>1m</span>
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="log__row">
                                                <span className="log__d" />
                                                <span className="log__v">v1.3</span>
                                                <span>shipped</span>
                                                <span className="log__t">2d</span>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="log__row">
                                                <span className="log__d" />
                                                <span className="log__v">v1.2</span>
                                                <span>shipped</span>
                                                <span className="log__t">6d</span>
                                            </div>
                                        </li>
                                        <li className="log__old">
                                            <div className="log__row">
                                                <span className="log__d" />
                                                <span className="log__v">v1.1</span>
                                                <span>shipped</span>
                                                <span className="log__t">11d</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p__body">
                                    <h3>Ship &amp; iterate</h3>
                                    <p>Small releases, real feedback, fewer opinions. Momentum beats a perfect plan.</p>
                                </div>
                            </li>
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">04</span>
                                    <span className="p__tag mono">Speed</span>
                                </div>
                                <div className="p__art" aria-hidden="true">
                                    <div className="vitals">
                                        <div className="vitals__cap">
                                            <span>Budget · mid-range Android</span>
                                            <span>Slow 4G</span>
                                        </div>
                                        <div className="vital">
                                            <span className="vital__k">LCP</span>
                                            <span className="vital__bar">
                                                <i style={{ '--w': '62%' } as CSSProperties} />
                                            </span>
                                            <span className="vital__v">≤ 2.5s</span>
                                        </div>
                                        <div className="vital">
                                            <span className="vital__k">INP</span>
                                            <span className="vital__bar">
                                                <i style={{ '--w': '48%' } as CSSProperties} />
                                            </span>
                                            <span className="vital__v">≤ 200ms</span>
                                        </div>
                                        <div className="vital">
                                            <span className="vital__k">CLS</span>
                                            <span className="vital__bar">
                                                <i style={{ '--w': '30%' } as CSSProperties} />
                                            </span>
                                            <span className="vital__v">≤ 0.1</span>
                                        </div>
                                        <span className="vitals__ok">✓ Within budget</span>
                                    </div>
                                </div>
                                <div className="p__body">
                                    <h3>Performance by default</h3>
                                    <p>A mid-range Android on a patchy connection is the bar, not the edge case.</p>
                                </div>
                            </li>
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">05</span>
                                    <span className="p__tag mono">Systems</span>
                                </div>
                                <div className="p__art" aria-hidden="true">
                                    <div className="codebox">
                                        <pre className="code">
                                            <span className="c">{'// boring on purpose'}</span>
                                            {'\n'}
                                            <span className="k">{'func'}</span>
                                            {' (s *'}
                                            <span className="t">{'Store'}</span>
                                            {') '}
                                            <span className="f">{'Order'}</span>
                                            {'(\n    ctx '}
                                            <span className="t">{'context.Context'}</span>
                                            {', id '}
                                            <span className="t">{'int64'}</span>
                                            {',\n) ('}
                                            <span className="t">{'Order'}</span>
                                            {', '}
                                            <span className="t">{'error'}</span>
                                            {') {\n    '}
                                            <span className="k">{'return'}</span>
                                            {' s.q.'}
                                            <span className="f">{'GetOrder'}</span>
                                            {'(ctx, id)\n}'}
                                        </pre>
                                        <div className="code__run">
                                            $ go test ./store &nbsp;<b>ok</b> &nbsp;0.012s
                                        </div>
                                    </div>
                                </div>
                                <div className="p__body">
                                    <h3>Sturdy, boring backends</h3>
                                    <p>Go, Postgres and clear contracts. Systems that are easy to reason about.</p>
                                </div>
                            </li>
                            <li className="p" data-reveal="">
                                <div className="p__head">
                                    <span className="p__n mono">06</span>
                                    <span className="p__tag mono">Community</span>
                                </div>
                                <div className="p__art">
                                    <div className="comm">
                                        <span className="comm__dots" aria-hidden="true">
                                            <i style={{ '--c': '#D4FF3A' } as CSSProperties} />
                                            <i style={{ '--c': '#BDB9B1' } as CSSProperties} />
                                            <i style={{ '--c': '#5C5A55' } as CSSProperties} />
                                            <i style={{ '--c': '#2A2A2E' } as CSSProperties} />
                                            <i className="comm__plus">+</i>
                                        </span>
                                        <div>
                                            <p className="comm__name">Remix Community Ghana</p>
                                            <p className="comm__meta">Accra · Mentorship</p>
                                        </div>
                                        <a
                                            className="comm__join"
                                            href="https://chat.whatsapp.com/DsQpntdph4L7xE9ZUVXu1j"
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            Join the group{' '}
                                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                <path
                                                    d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                <div className="p__body">
                                    <h3>Teach what I learn</h3>
                                    <p>Mentoring developers and running Remix Community Ghana keeps me honest.</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </section>
                {/* ABOUT / CAPABILITIES */}
                <section className="section" id="about" data-spy-target="about" aria-labelledby="about-title" style={{ paddingTop: '0' }}>
                    <div className="wrap">
                        <div className="shead">
                            <p className="shead__label mono" data-reveal="">
                                <i>(03)</i> About
                            </p>
                            <h2 className="shead__title" id="about-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                An engineer with a <span className="soft">designer's eye.</span>
                            </h2>
                        </div>
                        <div className="about">
                            <div className="about__lede">
                                <p className="big" data-reveal="">
                                    I'm self-taught. I started in the browser, obsessing over type and motion, then{' '}
                                    <strong>followed the problems down the stack.</strong> Today I design the interface, build the service
                                    behind it, and help other developers in Ghana do the same.
                                </p>
                                <figure className="about__photo" data-reveal="" style={{ '--d': '120ms' } as CSSProperties}>
                                    <img
                                        src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1000/photos/Photo_3515_zrzpq3"
                                        width={1000}
                                        height={1333}
                                        alt="A developer workshop session at Ghana Tech Lab, Accra"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <figcaption className="mono">Workshop — Ghana Tech Lab, Accra</figcaption>
                                </figure>
                                <div className="about__links mono" data-reveal="" style={{ '--d': '180ms' } as CSSProperties}>
                                    <Link className="link-arrow" href="/about">
                                        More about me{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>{' '}
                                    <Link className="link-arrow" href="/resume">
                                        Resume{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>{' '}
                                    <a className="link-arrow" href="https://github.com/felixyeboah" target="_blank" rel="noopener">
                                        GitHub{' '}
                                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path
                                                d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="caps" data-stagger="">
                                <article className="cap" data-reveal="">
                                    <div className="cap__head">
                                        <h3>Product engineering</h3>
                                        <span className="mono">01</span>
                                    </div>
                                    <ul>
                                        <li>
                                            Web &amp; mobile apps <i>End to end</i>
                                        </li>
                                        <li>
                                            Remix · Next.js · React <i>TS</i>
                                        </li>
                                        <li>
                                            Payments <i>Paystack · Hubtel</i>
                                        </li>
                                        <li>
                                            CMS <i>Sanity</i>
                                        </li>
                                    </ul>
                                </article>
                                <article className="cap" data-reveal="">
                                    <div className="cap__head">
                                        <h3>Interface design</h3>
                                        <span className="mono">02</span>
                                    </div>
                                    <ul>
                                        <li>
                                            Product &amp; UI design <i>Figma</i>
                                        </li>
                                        <li>
                                            Design systems <i>Tailwind</i>
                                        </li>
                                        <li>
                                            Motion <i>GSAP · Framer</i>
                                        </li>
                                        <li>
                                            Prototyping <i>In code</i>
                                        </li>
                                    </ul>
                                </article>
                                <article className="cap" data-reveal="">
                                    <div className="cap__head">
                                        <h3>Backend &amp; APIs</h3>
                                        <span className="mono">03</span>
                                    </div>
                                    <ul>
                                        <li>
                                            Services <i>Go · Node</i>
                                        </li>
                                        <li>
                                            Data <i>Postgres · Prisma</i>
                                        </li>
                                        <li>
                                            Testing <i>Mockery</i>
                                        </li>
                                        <li>
                                            Infra <i>AWS · Vercel</i>
                                        </li>
                                    </ul>
                                </article>
                                <article className="cap" data-reveal="">
                                    <div className="cap__head">
                                        <h3>Mentorship &amp; community</h3>
                                        <span className="mono">04</span>
                                    </div>
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
                        </div>
                    </div>
                </section>
                {/* PROOF / EXPERIENCE */}
                <section
                    className="section"
                    id="experience"
                    data-spy-target="resume"
                    aria-labelledby="exp-title"
                    style={{ paddingTop: '0' }}
                >
                    <div className="wrap">
                        <div className="shead">
                            <p className="shead__label mono" data-reveal="">
                                <i>(04)</i> Proof
                            </p>
                            <h2 className="shead__title" id="exp-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                Ten years, <span className="soft">measured.</span>
                            </h2>
                        </div>
                        <div className="stats" data-stagger="">
                            <div className="stat" data-reveal="">
                                <span className="mono soft">Building</span>{' '}
                                <span className="stat__n">
                                    <span data-count="10">10</span>
                                    <span className="u">+</span>
                                </span>
                                <p>Years designing and shipping for web and mobile.</p>
                            </div>
                            <div className="stat" data-reveal="">
                                <span className="mono soft">Complete Farmer</span>{' '}
                                <span className="stat__n">
                                    <span data-count="60000">60,000</span>
                                    <span className="u">+</span>
                                </span>
                                <p>Farmers onboarded through the Grower Agent Platform.</p>
                            </div>
                            <div className="stat" data-reveal="">
                                <span className="mono soft">Impact</span>{' '}
                                <span className="stat__n">
                                    <span className="u">+</span>
                                    <span data-count="30">30</span>
                                    <span className="u">%</span>
                                </span>
                                <p>Increase in farmer productivity on the platform my team built.</p>
                            </div>
                        </div>
                        <ol className="tl">
                            <li className="tl__row" data-reveal="">
                                <span className="tl__y mono">
                                    <span className="dot" aria-hidden="true" />
                                    2019 — Present
                                </span>
                                <div className="tl__role">
                                    <h3>Senior Frontend Engineer / Team Lead</h3>
                                    <p>Grower Agent Platform. Led the team that onboarded 60,000+ farmers and lifted productivity by 30%.</p>
                                </div>
                                <span className="tl__co">Complete Farmer</span>
                            </li>
                            <li className="tl__row" data-reveal="">
                                <span className="tl__y mono">2022</span>
                                <div className="tl__role">
                                    <h3>Frontend Engineer</h3>
                                    <p>
                                        Contract frontend engineering on the product, working closely with product, design and engineering.
                                    </p>
                                </div>
                                <span className="tl__co">Primer</span>
                            </li>
                            <li className="tl__row" data-reveal="">
                                <span className="tl__y mono">2018 — 2021</span>
                                <div className="tl__role">
                                    <h3>Web Developer</h3>
                                    <p>Websites and web apps for clients.</p>
                                </div>
                                <span className="tl__co">Bee and Bloom</span>
                            </li>
                        </ol>
                        <div className="tl-foot mono">
                            <span>Also: independent client work, 2020 — 2024</span>{' '}
                            <Link className="link-arrow" href="/resume">
                                Full resume{' '}
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
                        </div>
                    </div>
                </section>
                {/* TESTIMONIAL */}
                <section className="section" aria-label="Testimonial" style={{ paddingTop: '0' }}>
                    <div className="wrap">
                        <div className="quote" style={{ paddingTop: 'clamp(40px,5vw,72px)' }}>
                            <p className="quote__label mono" data-reveal="">
                                <span className="soft">(05)</span> Kind words
                            </p>
                            <figure data-reveal="" style={{ '--d': '100ms' } as CSSProperties}>
                                <svg className="quote__mark" viewBox="0 0 44 44" fill="none" aria-hidden="true">
                                    <path
                                        d="M4 26c0-9 5-16 14-18l1 4c-5 2-8 5-8 10h7v14H4V26Zm22 0c0-9 5-16 14-18l1 4c-5 2-8 5-8 10h7v14H26V26Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <blockquote>
                                    <p>
                                        Felix is an exceptional developer who is{' '}
                                        <em>dedicated to delivering products that exceed expectations.</em> His attention to detail,
                                        problem-solving skills, and <em>commitment to quality</em> makes him a valuable asset to any team.
                                    </p>
                                </blockquote>
                                <figcaption>
                                    <span className="avatar" aria-hidden="true">
                                        KD
                                    </span>{' '}
                                    <span>
                                        <strong>Kwasi Dwomoh</strong>
                                        <span className="mono">CEO, Dawncraft</span>
                                    </span>
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </section>
                {/* WRITING */}
                <section
                    className="section"
                    id="writing"
                    data-spy-target="writing"
                    aria-labelledby="writing-title"
                    style={{ paddingTop: '0' }}
                >
                    <div className="wrap">
                        <div className="shead">
                            <p className="shead__label mono" data-reveal="">
                                <i>(06)</i> Writing
                            </p>
                            <h2 className="shead__title" id="writing-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                Notes from <span className="soft">the work.</span>
                            </h2>
                            <p className="shead__aside mono" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                                <Link className="link-arrow" href="/writing">
                                    All writing{' '}
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
                        <ul className="posts" data-stagger="">
                            {writing.map((p) => (
                                <li data-reveal="" key={p.slug}>
                                    <Link className="post" href={`/writing/${p.slug}`}>
                                        <time className="post__d mono" dateTime={p.month}>
                                            {p.label}
                                        </time>
                                        <span className="post__t">{p.title}</span>
                                        <span className="post__a" aria-hidden="true">
                                            <svg viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                {/* CONTACT */}
                <section className="contact" id="contact" data-spy-target="contact" aria-labelledby="contact-title">
                    <div className="contact__card">
                        <p className="contact__kicker mono" data-reveal="">
                            <span className="dot" aria-hidden="true" />
                            (07) Contact — taking on select projects
                        </p>
                        <h2 id="contact-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                            Have a product worth building? <span className="soft">Let's talk.</span>
                        </h2>
                        <Link className="orb magnetic" href="/contact" data-reveal="" style={{ '--d': '240ms' } as CSSProperties}>
                            Start a<br />
                            project
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path
                                    d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                        <div className="mailrow" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                            <a className="mail" href="mailto:me@felixyeboah.dev">
                                me@felixyeboah.dev
                            </a>{' '}
                            <button className="btn btn--ghost copy" type="button" data-copy="me@felixyeboah.dev">
                                Copy email
                            </button>
                        </div>
                        <div className="contact__grid">
                            <div data-reveal="">
                                <h3 className="mono">Elsewhere</h3>
                                <ul>
                                    <li>
                                        <a href="https://x.com/sudocode_" target="_blank" rel="noopener">
                                            X / Twitter <span>@sudocode_</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://github.com/felixyeboah" target="_blank" rel="noopener">
                                            GitHub <span>felixyeboah</span>
                                        </a>
                                    </li>
                                    <li>
                                        <Link href="/resume">
                                            Resume <span>Printable</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                                <h3 className="mono">Local time</h3>
                                <p className="big">
                                    <span data-clock="">14:02</span> <span className="soft">GMT</span>
                                </p>
                                <p className="mono soft">Accra, Ghana · UTC+0</p>
                            </div>
                            <div data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                                <h3 className="mono">Community</h3>
                                <p>Running Remix Community Ghana and mentoring developers who are just getting started.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <PrinciplesPlay />
            <script dangerouslySetInnerHTML={{ __html: HERO_SPLIT_SCRIPT }} />
        </>
    );
}
