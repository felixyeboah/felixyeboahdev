import { PageStyle } from '@/core/site/chrome';
import { LINKS } from '@/lib/site/fy';
import {
    AUTHOR_IMG,
    CANON,
    creditHTML,
    dekText,
    imageOk,
    imageRec,
    isShortNote,
    isoMonth,
    postEndHTML,
    related,
    renderPost,
    shortNoteHTML,
    splitDek,
} from '@/lib/site/post-render';
import {
    type PostMeta,
    catLabel,
    cld,
    fmtDate,
    fmtMonth,
    getPost,
    getPosts,
    isoDate,
} from '@/lib/site/posts';
import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';

import { PostBehaviour, Toc } from './post-client';

/* Post page, ported from design-options/tools/sitebuild/writing_pages.js (pageHTML) + writing_post.css.
   The body is the renderer's HTML (lib/site/post-render.ts); everything around it is JSX. */

/* the prototype loads Newsreader (reading serif) from Google Fonts; writing-post.css's --serif uses it */
const newsreader = Newsreader({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
    display: 'swap',
});

export const dynamicParams = false;
export function generateStaticParams() {
    return getPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const p = getPost((await params).slug);
    if (!p) return {};
    const dek = dekText(p);
    const url = CANON + p.slug;
    return {
        title: { absolute: `${p.title} · Felix Yeboah` },
        description: dek,
        alternates: {
            canonical: url,
            types: {
                'application/rss+xml': [
                    {
                        url: '/writing/feed.xml',
                        title: 'Felix Yeboah: Writing',
                    },
                ],
            },
        },
        openGraph: {
            type: 'article',
            siteName: 'Felix Yeboah',
            title: p.title,
            description: dek,
            url,
            images: p.cover ? [cld(p.cover, 1600)] : undefined,
            publishedTime: p.date.toISOString(),
        },
        twitter: { card: 'summary_large_image', creator: '@sudocode_' },
    };
}

const d = (ms: string) => ({ '--d': ms }) as CSSProperties;

/* ------------------------------------------------------------------ icons */
const IconBack = () => (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
            d="M13.5 8h-11m0 0L7 3.5M2.5 8 7 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const IconNe = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const IconFwd = () => (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
            d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const ArrowR = () => (
    <svg viewBox="0 0 16 16" fill="none">
        <path
            d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const ArrowL = () => (
    <svg viewBox="0 0 16 16" fill="none">
        <path
            d="M13.5 8h-11m0 0L7 3.5M2.5 8 7 12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* ------------------------------------------------------------------ blocks */
function Author() {
    return (
        <section className="author wrap" aria-labelledby="author-title">
            <div className="author__card" data-reveal>
                <figure className="author__photo">
                    <img
                        src={cld(AUTHOR_IMG, 400)}
                        srcSet={`${cld(AUTHOR_IMG, 400)} 400w, ${cld(AUTHOR_IMG, 800)} 800w`}
                        sizes="(max-width: 900px) 92vw, 30vw"
                        width="400"
                        height="533"
                        alt="Felix Yeboah wearing headphones, working on a laptop"
                        loading="lazy"
                        decoding="async"
                    />
                    <figcaption className="mono">
                        <span className="dot" aria-hidden="true" />
                        Accra, Ghana
                    </figcaption>
                </figure>
                <div className="author__body">
                    <div>
                        <p className="author__kick mono">Written by</p>
                        <h2 className="author__name" id="author-title">
                            <Link href="/about">Felix Yeboah</Link>
                        </h2>
                        <p className="author__bio">
                            Software engineer and designer.{' '}
                            <strong>Self-taught, based in Accra.</strong> Ten
                            years taking products from first sketch to
                            production — React and Remix on the front, Go and
                            Postgres underneath.
                        </p>
                        <div className="author__acts">
                            <div className="author__btns">
                                <Link
                                    className="btn btn--accent magnetic"
                                    href="/contact"
                                >
                                    Let&apos;s talk{' '}
                                    <IconNe className="arrow-ne" />
                                </Link>
                                <Link className="btn btn--ghost" href="/about">
                                    About me
                                </Link>
                            </div>
                            <div className="author__links mono">
                                <a
                                    className="link-arrow link-arrow--ne"
                                    href={LINKS.github}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    GitHub <IconNe />
                                </a>
                                <a
                                    className="link-arrow link-arrow--ne"
                                    href={LINKS.x}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    X @sudocode_ <IconNe />
                                </a>
                                <a
                                    className="link-arrow link-arrow--ne"
                                    href="/writing/feed.xml"
                                >
                                    RSS <IconNe />
                                </a>
                            </div>
                        </div>
                    </div>
                    <dl className="author__foot mono">
                        <div>
                            <dt>Local time</dt>
                            <dd>
                                <span data-clock suppressHydrationWarning>
                                    14:02
                                </span>{' '}
                                <span>GMT</span>
                            </dd>
                        </div>
                        <div>
                            <dt>Writes about</dt>
                            <dd>
                                Go, Remix, <span>the work</span>
                            </dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>
                                <a
                                    className="link-arrow"
                                    href={LINKS.email}
                                    style={{
                                        textTransform: 'none',
                                        letterSpacing: '-.01em',
                                    }}
                                >
                                    me@felixyeboah.dev
                                </a>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </section>
    );
}

function More({ list, total }: { list: PostMeta[]; total: number }) {
    return (
        <section className="more" aria-labelledby="more-title">
            <div className="wrap">
                <div className="shead">
                    <p className="shead__label mono" data-reveal>
                        <i>(→)</i> Keep reading
                    </p>
                    <h2
                        className="shead__title"
                        id="more-title"
                        data-reveal
                        style={d('80ms')}
                    >
                        More notes <span className="soft">from the work.</span>
                    </h2>
                    <p
                        className="shead__aside mono"
                        data-reveal
                        style={d('160ms')}
                    >
                        {total} posts
                        <br />
                        <Link
                            className="link-arrow"
                            href="/writing"
                            style={{ marginTop: 8 }}
                        >
                            All writing <IconFwd />
                        </Link>
                    </p>
                </div>
            </div>
            <div className="cards" data-stagger>
                {list.map((q, k) => (
                    <Link
                        key={q.slug}
                        className="rcard"
                        href={`/writing/${q.slug}`}
                        data-reveal
                    >
                        <div className="rcard__top mono">
                            <span>
                                <b>0{k + 1}</b>
                                {catLabel(q.categories[0] || 'writing')}
                            </span>
                            <span className="rcard__go" aria-hidden="true">
                                <ArrowR />
                            </span>
                        </div>
                        <div className="rcard__shot">
                            <img
                                src={cld(q.cover, 800)}
                                width="800"
                                height="533"
                                alt=""
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="rcard__meta">
                            <time
                                className="rcard__date mono"
                                dateTime={isoMonth(q.date)}
                            >
                                {fmtMonth(q.date)}
                            </time>
                            <h3>{q.title}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function PnHalf({ q, dir }: { q: PostMeta | null; dir: 'prev' | 'next' }) {
    const isPrev = dir === 'prev';
    const cls = `pn__half pn__${dir}`;
    const go = (
        <span className="pn__go" aria-hidden="true">
            {isPrev ? <ArrowL /> : <ArrowR />}
        </span>
    );
    if (!q) {
        const label = isPrev ? 'The first post' : 'The latest post';
        return (
            <Link className={`${cls} pn__none`} href="/writing">
                <div className="pn__top mono">
                    {isPrev ? (
                        <>
                            <span className="pn__dir">{label}</span>
                            <span />
                        </>
                    ) : (
                        <>
                            <span />
                            <span className="pn__dir">{label}</span>
                        </>
                    )}
                </div>
                <div className="pn__bottom">
                    <span className="pn__t">Back to all writing</span>
                    {go}
                </div>
            </Link>
        );
    }
    const time = <time dateTime={isoMonth(q.date)}>{fmtMonth(q.date)}</time>;
    const lab = <span className="pn__dir">{isPrev ? 'Previous' : 'Next'}</span>;
    return (
        <Link className={cls} href={`/writing/${q.slug}`} rel={dir}>
            <img
                className="pn__bg"
                src={cld(q.cover, 800)}
                width="800"
                height="533"
                alt=""
                loading="lazy"
                decoding="async"
            />
            <div className="pn__top mono">
                {isPrev ? (
                    <>
                        {lab}
                        {time}
                    </>
                ) : (
                    <>
                        {time}
                        {lab}
                    </>
                )}
            </div>
            <div className="pn__bottom">
                <span className="pn__t">{q.title}</span>
                {go}
            </div>
        </Link>
    );
}

/* ------------------------------------------------------------------ page */
export default async function PostPage({ params }: Props) {
    const { slug } = await params;
    const all = getPosts();
    const idx = all.findIndex((q) => q.slug === slug);
    if (idx < 0) notFound();
    const p = all[idx];

    const r = renderPost(p, all);
    const prev = all[idx + 1] || null; /* older */
    const next = all[idx - 1] || null; /* newer */
    const rel = related(p, all, prev, next);
    const [dekInk, dekMuted] = splitDek(p);
    const cats = p.categories;
    const isShort = isShortNote(p);
    const reading = isShort ? 'Short note' : `${p.minutes} min read`;
    const coverOk = !!p.cover && imageOk('cover:' + p.cover);
    const coverRec = imageRec('cover:' + p.cover);
    const cw = 1600,
        ch = coverRec.w
            ? Math.round(((coverRec.h || 0) * 1600) / coverRec.w)
            : 900;
    const credit = creditHTML(p.bannerCredit, all);

    let body = r.html;
    if (isShort) body = shortNoteHTML(p, all) + (body ? '\n' + body : '');
    const prose = '\n' + body + '\n' + postEndHTML(p) + '\n  ';

    return (
        <>
            <main id="main" key={p.slug}>
                <PageStyle name="writing-post" />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `:root{--serif:${newsreader.style.fontFamily}, "Iowan Old Style", "Charter", Georgia, serif}`,
                    }}
                />
                <article className="entry" aria-labelledby="post-title">
                    <header className="phead" data-instant>
                        <div className="wrap">
                            <div className="phead__top mono" data-reveal>
                                <Link
                                    className="link-arrow link-arrow--back"
                                    href="/writing"
                                >
                                    <IconBack />
                                    All writing
                                </Link>
                                <span className="phead__topmid">
                                    Notes from the work
                                </span>
                                <a
                                    className="link-arrow link-arrow--ne"
                                    href="/writing/feed.xml"
                                >
                                    RSS <IconNe />
                                </a>
                            </div>
                            <div className="phead__grid">
                                <p
                                    className="phead__kick mono"
                                    data-reveal
                                    style={d('60ms')}
                                >
                                    <span className="dot" aria-hidden="true" />
                                    <Link href="/writing">Writing</Link>
                                    <i>/</i>
                                    <b>{catLabel(cats[0] || 'writing')}</b>
                                </p>
                                <div className="phead__main">
                                    <h1
                                        className={
                                            'ptitle' +
                                            (p.title.length > 40
                                                ? ' is-long'
                                                : '')
                                        }
                                        id="post-title"
                                    >
                                        {p.title}
                                    </h1>
                                    {dekInk ? (
                                        <p
                                            className="dek"
                                            data-reveal
                                            style={d('320ms')}
                                        >
                                            {dekInk}
                                            {dekMuted ? (
                                                <span>{dekMuted}</span>
                                            ) : null}
                                        </p>
                                    ) : null}
                                </div>
                                <dl
                                    className="phead__info mono"
                                    data-reveal
                                    style={d('420ms')}
                                >
                                    <div>
                                        <dt>Published</dt>
                                        <dd>
                                            <time dateTime={isoDate(p.date)}>
                                                {fmtDate(p.date)}
                                            </time>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Reading</dt>
                                        <dd>{reading}</dd>
                                    </div>
                                    <div>
                                        <dt>Topics</dt>
                                        <dd>{cats.map(catLabel).join(', ')}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </header>
                    {coverOk ? (
                        <figure
                            className="cover wrap"
                            data-reveal
                            data-instant
                            style={d('480ms')}
                        >
                            <div className="cover__frame">
                                <img
                                    src={cld(p.cover, 1600)}
                                    srcSet={`${cld(p.cover, 800)} 800w, ${cld(p.cover, 1600)} 1600w`}
                                    sizes="(max-width: 1440px) 94vw, 1330px"
                                    width={cw}
                                    height={ch}
                                    alt={p.bannerAlt}
                                    fetchPriority="high"
                                    decoding="async"
                                />
                            </div>
                            <figcaption className="cap mono">
                                <span>
                                    Cover
                                    {p.bannerAlt ? ' · ' + p.bannerAlt : ''}
                                </span>
                                <span
                                    dangerouslySetInnerHTML={{ __html: credit }}
                                />
                            </figcaption>
                        </figure>
                    ) : null}
                    <div
                        className={
                            'prose' +
                            (r.firstIsPara && !isShort ? ' prose--drop' : '')
                        }
                        id="article-body"
                        style={{ marginTop: 'clamp(56px,7vw,112px)' }}
                        dangerouslySetInnerHTML={{ __html: prose }}
                    />
                </article>

                <Author />

                <More list={rel} total={all.length} />

                <nav className="pn" aria-label="Previous and next post">
                    <PnHalf q={prev} dir="prev" />
                    <PnHalf q={next} dir="next" />
                </nav>
                <div className="wrap pn-foot mono">
                    <Link
                        className="link-arrow link-arrow--back"
                        href="/writing"
                    >
                        <IconBack />
                        All writing
                    </Link>
                    <a
                        className="link-arrow link-arrow--ne"
                        href="/writing/feed.xml"
                    >
                        Subscribe via RSS <IconNe />
                    </a>
                </div>
            </main>
            {r.toc.length >= 2 ? (
                <Toc key={'toc:' + p.slug} heads={r.toc} />
            ) : null}
            <PostBehaviour key={'js:' + p.slug} />
        </>
    );
}
