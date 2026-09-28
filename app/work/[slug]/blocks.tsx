import Link from 'next/link';
import { Fragment, type CSSProperties, type ReactNode } from 'react';

import {
    fw,
    isLong,
    nextProject,
    type Brief,
    type Chapters,
    type Compose,
    type Diagram,
    type Facts,
    type Gallery,
    type Lines,
    type Notes,
    type ProjectDetail,
    type Quote,
    type Rich,
    type Title,
    getDetail,
} from '@/lib/site/project-details';
import { cld } from '@/lib/site/posts';
import { PROJECTS, pad2, type Project } from '@/lib/site/projects';

import { CaseTitle } from './case-title';
import { NextPeek } from './next-peek';
import { RouteDiagram } from './route-diagram';

/* Server-rendered blocks of the project template (port of work_pages.py's renderer). */

const TOTAL = PROJECTS.length;
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

export const ICON = {
    r: (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    l: (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M13.5 8h-11m0 0L7 3.5M2.5 8 7 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ne: (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4.5 11.5l7-7m0 0H5.5m6 0v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    q: (
        <svg className="quote__mark" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <path
                d="M8 30c0-8 4-14 11-17l1.5 2.6C16 18 14 21.4 14 25h6v11H8v-6Zm18 0c0-8 4-14 11-17l1.5 2.6C34 18 32 21.4 32 25h6v11H26v-6Z"
                fill="currentColor"
            />
        </svg>
    ),
};

/* ---------- text helpers ---------- */
export function RichText({ value }: { value: Rich }) {
    if (typeof value === 'string') return <>{value}</>;
    return (
        <>
            {value.map((x, i) =>
                typeof x === 'string' ? (
                    <Fragment key={i}>{x}</Fragment>
                ) : (
                    <Link key={i} className="tlink" href={x.href}>
                        {x.text}
                    </Link>
                ),
            )}
        </>
    );
}

export function TitleText({ value }: { value: Title }) {
    if (typeof value === 'string') return <>{value}</>;
    return (
        <>
            {value[0]} <span className="soft">{value[1]}</span>
        </>
    );
}

export function LinesText({ value }: { value: Lines }) {
    return (
        <>
            {value.map((l, i) => (
                <Fragment key={i}>
                    {i > 0 && <br />}
                    {l}
                </Fragment>
            ))}
        </>
    );
}

function SHead({ n, label, title, aside, id }: { n: number; label: string; title: Title; aside?: Lines; id: string }) {
    return (
        <div className="shead">
            <p className="shead__label mono" data-reveal="">
                <i>({pad2(n)})</i> {label}
            </p>
            <h2 className="shead__title" id={id} data-reveal="" style={vars({ '--d': '80ms' })}>
                <TitleText value={title} />
            </h2>
            {aside && aside.length > 0 && (
                <p className="shead__aside mono" data-reveal="" style={vars({ '--d': '160ms' })}>
                    <LinesText value={aside} />
                </p>
            )}
        </div>
    );
}

function Bar({ url }: { url: string }) {
    return (
        <div className="frame__bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span className="frame__url">{url}</span>
        </div>
    );
}

/* ---------- hero ---------- */
export function Hero({ p, d }: { p: Project; d: ProjectDetail }) {
    const long = isLong(p.name);
    const credits = d.credits || [{ k: 'Category', v: p.category }];
    const year = credits.find((c) => c.k === 'Year')?.v;
    const [t, tm] = typeof d.tagline === 'string' ? [d.tagline, ''] : d.tagline;
    const st = {
        src: p.cover,
        w: 1600,
        h: 1000,
        url: p.domain,
        cap: [`${p.domain} · homepage`, ''] as [string, string],
        ...d.stage,
    };
    return (
        <section className="phero" aria-labelledby="p-title" data-instant="">
            <div className="phero__band">
                <div className="wrap">
                    <nav className="crumbs mono" aria-label="Breadcrumb" data-reveal="">
                        <ol>
                            <li>
                                <Link className="link-arrow link-arrow--back" href="/work">
                                    {ICON.l}Work
                                </Link>
                            </li>
                            <li>
                                <Link href={`/work?cat=${p.group}`}>{p.category}</Link>
                            </li>
                        </ol>
                        <span className="crumbs__n">
                            Project {pad2(p.order)} / {TOTAL}
                        </span>
                    </nav>
                    <div className={'phero__grid' + (long ? ' is-long' : '')}>
                        <div className="phero__copy">
                            <p className="kicker mono" data-reveal="">
                                <b>{p.category}</b>
                                {year && (
                                    <>
                                        <span className="sep" aria-hidden="true" />
                                        <span>{year}</span>
                                    </>
                                )}
                                {d.status && (
                                    <>
                                        <span className="sep" aria-hidden="true" />
                                        <span className="kicker__live">
                                            <span className="dot" aria-hidden="true" />
                                            {d.status}
                                        </span>
                                    </>
                                )}
                            </p>
                            <CaseTitle name={p.name} long={long} fw={fw(p.name, long ? 0.06 : 0.07)} />
                            <p className={'tagline' + ((t + tm).length > 70 ? ' is-long' : '')} data-reveal="" style={vars({ '--d': '320ms' })}>
                                {t}
                                {tm && (
                                    <>
                                        {' '}
                                        <span>{tm}</span>
                                    </>
                                )}
                            </p>
                            {d.formerly && (
                                <p className="former mono" data-reveal="" style={vars({ '--d': '380ms' })}>
                                    Formerly {d.formerly}
                                </p>
                            )}
                        </div>
                        <dl className="credits" data-reveal="" style={vars({ '--d': '440ms' })}>
                            {credits
                                .filter((c) => c.v)
                                .map((c) => (
                                    <div key={c.k}>
                                        <dt className="mono">{c.k}</dt>
                                        <dd>
                                            {c.v}
                                            {c.note && (
                                                <>
                                                    {' '}
                                                    <span className="soft">· {c.note}</span>
                                                </>
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            <div>
                                <dt className="mono">Live</dt>
                                <dd>
                                    <a className="credits__live" href={p.url} target="_blank" rel="noopener">
                                        {p.domain} {ICON.ne}
                                        <span className="sr-only"> (opens in a new tab)</span>
                                    </a>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="wrap phero__stage">
                <figure className="stage" data-reveal="" style={vars({ '--d': '520ms' })}>
                    <div className="stage__frame frame" data-scrub="">
                        <Bar url={st.url} />
                        <div className="stage__img">
                            <img src={st.src} width={st.w} height={st.h} alt={st.alt} fetchPriority="high" decoding="async" />
                        </div>
                    </div>
                    <figcaption className="cap mono">
                        <span>{st.cap[0]}</span>
                        <span>{st.cap[1]}</span>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}

/* ---------- brief ---------- */
export function BriefBlock({ b, n }: { b: Brief; n: number }) {
    return (
        <section className="blk wrap" id="brief" aria-labelledby="brief-title">
            <p className="brief__label mono" data-reveal="">
                <i>({pad2(n)})</i> The brief in one line
            </p>
            <h2 className="statement" id="brief-title" data-reveal="" style={vars({ '--d': '80ms' })}>
                {b.statement}
                {b.muted && (
                    <>
                        {' '}
                        <span>{b.muted}</span>
                    </>
                )}
            </h2>
            {b.story && b.story.length > 0 && (
                <div className={`story story--${b.story.length}`} data-stagger="">
                    {b.story.map((c, i) => (
                        <div className="story__col" data-reveal="" key={i}>
                            <h3 className="mono">
                                <b>{'ABCDEF'[i]}</b> {c.h}
                            </h3>
                            {(c.body || []).map((x, k) => (
                                <p key={k}>
                                    <RichText value={x} />
                                </p>
                            ))}
                            {c.list && c.list.length > 0 && (
                                <ol className="remote">
                                    {c.list.map((it, k) => (
                                        <li key={k}>
                                            <span>{pad2(k + 1)}</span>
                                            <div>
                                                {it.b && (
                                                    <>
                                                        <b>{it.b}</b>{' '}
                                                    </>
                                                )}
                                                {it.t}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

/* ---------- chapters ---------- */
export function ChaptersBlock({ c, n }: { c: Chapters; n: number }) {
    const one = c.items.length === 1;
    return (
        <section className="blk wrap" id="product" aria-labelledby="ch-title">
            <SHead n={n} label={c.label} title={c.title} aside={c.aside} id="ch-title" />
            <div className="chapters">
                {c.items.map((it, i) => {
                    const cls = 'ch' + (one ? ' ch--wide' : (i % 2 ? ' ch--flip' : '') + (it.broad ? ' ch--broad' : ''));
                    const [x, y, w, h] = it.crop || [0, 0, 1, 1];
                    return (
                        <article className={cls} key={i}>
                            <div className="ch__text" data-reveal="">
                                <p className="ch__n mono">
                                    <b>{pad2(i + 1)}</b> {it.label}
                                </p>
                                <h3>{it.title}</h3>
                                <p>{it.body}</p>
                                {it.chips && it.chips.length > 0 && (
                                    <div className="ch__foot">
                                        {it.chips.map((chip) => (
                                            <span className="chip" key={chip}>
                                                {chip}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <figure className="ch__media" data-reveal="" style={vars({ '--d': '120ms' })}>
                                <div className="frame">
                                    <Bar url={it.url} />
                                    <div className="crop" style={vars({ '--x': x, '--y': y, '--w': w, '--h': h })}>
                                        <img src={it.src} width={2160} height={1350} alt={it.alt} loading="lazy" decoding="async" />
                                    </div>
                                </div>
                                <figcaption className="cap mono">
                                    <span>{it.cap}</span>
                                    <span>{it.note}</span>
                                </figcaption>
                            </figure>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

/* ---------- compose (desktop + phone) ---------- */
export function ComposeBlock({ m, n }: { m: Compose; n: number }) {
    return (
        <section className="blk wrap" id="screens" aria-labelledby="compose-title">
            <SHead n={n} label={m.label} title={m.title} aside={m.aside} id="compose-title" />
            <figure className="compose" data-reveal="">
                <div className="compose__desk frame">
                    <Bar url={m.url} />
                    <div className="stage__img">
                        <img src={m.desktop} width={2160} height={1350} alt="" loading="lazy" decoding="async" />
                    </div>
                </div>
                <div className="phone" data-scrub="">
                    <div className="phone__screen">
                        <span className="phone__island" aria-hidden="true" />
                        <img src={m.mobile} width={780} height={1688} alt={m.alt} loading="lazy" decoding="async" />
                    </div>
                </div>
                <figcaption className="sr-only">{m.sr}</figcaption>
            </figure>
            <div className="compose__cap mono">
                <span>{m.cap[0]}</span>
                <span>{m.cap[1]}</span>
            </div>
        </section>
    );
}

/* ---------- notes ---------- */
function NotesInner({ notes }: { notes: Notes }) {
    return (
        <>
            <div className="notes" data-stagger="" style={vars({ '--n': Math.min(5, notes.items.length) })}>
                {notes.items.map((it, i) => (
                    <div className="note" data-reveal="" key={i}>
                        <span className="mono">
                            {i === 0 ? `${notes.label} · ` : ''}
                            {pad2(i + 1)}
                        </span>
                        <h3>{it.t}</h3>
                        <p>{it.b}</p>
                    </div>
                ))}
            </div>
            {notes.chips && notes.chips.length > 0 && (
                <div className="providers" data-reveal="">
                    <span className="mono">{notes.chipsLabel}</span>
                    {notes.chips.map((c) => (
                        <span className="chip" key={c}>
                            {c}
                        </span>
                    ))}
                </div>
            )}
        </>
    );
}

export function NotesBlock({ notes, n }: { notes: Notes; n: number }) {
    return (
        <section className="blk wrap" id="under-the-hood" aria-labelledby="notes-title">
            <SHead n={n} label={notes.label} title={notes.title} aside={notes.aside} id="notes-title" />
            <NotesInner notes={notes} />
        </section>
    );
}

/* ---------- diagram (bespoke components by kind) ---------- */
const DIAGRAMS: Record<Diagram['kind'], () => ReactNode> = {
    'reevit-route': () => <RouteDiagram />,
};

export function DiagramBlock({ dg, notes, n }: { dg: Diagram; notes?: Notes; n: number }) {
    return (
        <section className="blk wrap" id="diagram" aria-labelledby="diagram-title">
            <SHead n={n} label={dg.label} title={dg.title} aside={dg.aside} id="diagram-title" />
            {DIAGRAMS[dg.kind]()}
            {notes && <NotesInner notes={notes} />}
        </section>
    );
}

/* ---------- gallery ---------- */
const NUM: Record<number, string> = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six' };

export function GalleryBlock({ g, n, id }: { g: Gallery; n: number; id: string }) {
    const aside = g.aside || [`${NUM[g.items.length] || g.items.length} images`, 'from the project write-up'];
    return (
        <section className="blk wrap" id={id} aria-labelledby="gallery-title">
            <SHead n={n} label={g.label} title={g.title} aside={aside} id="gallery-title" />
            <div className="gallery" data-stagger="">
                {g.items.map((it, i) => {
                    const span = it.span || 6;
                    const img = it.id ? (
                        <img
                            src={cld(it.id, 1600)}
                            srcSet={`${cld(it.id, 800)} 800w, ${cld(it.id, 1600)} 1600w, ${cld(it.id, 2400)} 2400w`}
                            sizes={'(max-width: 760px) 100vw, ' + (span === 12 ? 'min(92vw, 1330px)' : `${Math.round((span / 12) * 92)}vw`)}
                            width={it.w}
                            height={it.h}
                            alt={it.alt}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <img
                            src={it.src}
                            srcSet={it.srcSet}
                            sizes={
                                it.srcSet
                                    ? '(max-width: 760px) 100vw, ' + (span === 12 ? 'min(92vw, 1330px)' : `${Math.round((span / 12) * 92)}vw`)
                                    : undefined
                            }
                            width={it.w}
                            height={it.h}
                            alt={it.alt}
                            loading="lazy"
                            decoding="async"
                        />
                    );
                    return (
                        <figure className={'gal' + (it.wide ? ' gal--wide' : '')} style={vars({ '--span': span })} data-reveal="" key={i}>
                            {it.bar ? (
                                <div className="gal__shot frame">
                                    <Bar url={it.bar} />
                                    {img}
                                </div>
                            ) : (
                                <div className="gal__shot">{img}</div>
                            )}
                            <figcaption className="cap mono">
                                <span>{it.cap}</span>
                                <span>{it.note || ''}</span>
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </section>
    );
}

/* ---------- facts ---------- */
export function FactsBlock({ f, n }: { f: Facts; n: number }) {
    const s = f.status;
    return (
        <section className="blk wrap" id="facts" aria-labelledby="facts-title">
            <SHead n={n} label={f.label} title={f.title} aside={f.aside} id="facts-title" />
            <div className="facts" data-stagger="" style={vars({ '--n': Math.min(4, f.items.length) })}>
                {f.items.map((it, i) => (
                    <div className="fact" data-reveal="" key={i}>
                        <span className="fact__v">
                            {it.pre && <small className="pre">{it.pre}</small>}
                            {it.v}
                            {it.unit && <small>{it.unit}</small>}
                        </span>
                        <span className="fact__l">{it.l}</span>
                        {it.p && <p>{it.p}</p>}
                    </div>
                ))}
            </div>
            {s && (
                <div className="status">
                    <div className="status__now" data-reveal="">
                        {s.pill && (
                            <p className="status__pill mono">
                                <span className="dot" aria-hidden="true" />
                                {s.pill}
                            </p>
                        )}
                        <p className="big">
                            {s.big}
                            {s.muted && (
                                <>
                                    {' '}
                                    <span>{s.muted}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <div className="status__next" data-reveal="" style={vars({ '--d': '120ms' })}>
                        <h3 className="mono">{s.listTitle}</h3>
                        <ul>
                            {s.list.map((it, i) => (
                                <li key={i}>
                                    <span className="status__t">
                                        <RichText value={it.t} />
                                    </span>{' '}
                                    <span>{it.tag}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
}

/* ---------- quote ---------- */
export function QuoteBlock({ q }: { q: Quote }) {
    const long = (q.text + (q.em || '')).length > 130;
    return (
        <section className="blk wrap" aria-label="Pull quote">
            <div className={'quote' + (long ? ' quote--long' : '')}>
                <p className="quote__label mono" data-reveal="">
                    {q.label}
                </p>
                <figure data-reveal="" style={vars({ '--d': '80ms' })}>
                    {ICON.q}
                    <blockquote>
                        <p>
                            {q.text}
                            {q.em && (
                                <>
                                    {' '}
                                    <em>{q.em}</em>
                                </>
                            )}
                        </p>
                    </blockquote>
                    <figcaption>
                        <span className="avatar" aria-hidden="true">
                            {q.mark}
                        </span>
                        <div>
                            <strong>{q.by}</strong>
                            <span>{q.role}</span>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}

/* ---------- next project ---------- */
export function NextTile({ p, d }: { p: Project; d: ProjectDetail }) {
    const x = nextProject(p);
    const xd = getDetail(x.slug);
    const { zoom, pos } = xd?.nextBg || { zoom: 1.04, pos: '50% 45%' };
    const peek = xd?.nextPeek === false ? undefined : xd?.nextPeek || xd?.compose?.mobile;
    return (
        <section className="next" aria-labelledby="next-title">
            <Link className="next__tile" href={`/work/${x.slug}`} data-reveal="">
                <img
                    className="next__bg"
                    src={x.cover}
                    width={1600}
                    height={1000}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={vars({ '--zc': zoom, '--cp': pos })}
                />
                {peek && <NextPeek src={peek} />}
                <div className="next__inner">
                    <div className="next__top mono">
                        <span>
                            <span className="dot" aria-hidden="true" />
                            Next project
                        </span>
                        <span>
                            {pad2(x.order)} / {TOTAL}
                        </span>
                    </div>
                    <div className="next__bottom">
                        <div>
                            <p className="next__meta mono">
                                {x.category}
                                {d.nextNote ? ` · ${d.nextNote}` : ''}
                            </p>
                            <h2 className={'next__t' + (x.name.length > 20 ? ' is-long' : '')} id="next-title" style={vars({ '--fw': fw(x.name, 0.065) })}>
                                {x.name}
                            </h2>
                        </div>
                        <span className="next__go" aria-hidden="true">
                            {ICON.r}
                        </span>
                    </div>
                </div>
            </Link>
            <div className="wrap next__foot mono">
                <Link className="link-arrow link-arrow--back" href="/work">
                    {ICON.l}All work
                </Link>
                <span>{TOTAL} projects</span>
            </div>
        </section>
    );
}
