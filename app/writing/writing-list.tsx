'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

/* Writing index: featured post + year groups + category chips synced to ?cat=
   (the prototype's inline script, as React state). "All" hides the latest post's row,
   since the featured card above already shows it. */

export type WritingRow = {
    slug: string;
    title: string;
    cats: string[];
    label: string;
    date: string;
    iso: string;
    year: number;
    reading: string;
    img: string;
    alt: string;
    latest: boolean;
};
type Chip = { cat: string; label: string; n: number };
type Feat = {
    slug: string;
    title: string;
    img: string;
    alt: string;
    date: string;
    label: string;
    reading: string;
    dek: string;
};

const ARROW = (
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

/** Reads ?cat= (deep links, and client navigations like a post's "Filed under" chips). Renders nothing, so
    the Suspense boundary it needs doesn't pull the list out of the static HTML. */
function CatFromQuery({ onCat }: { onCat: (q: string | null) => void }) {
    const sp = useSearchParams();
    const q = sp.get('cat');
    useEffect(() => onCat(q), [q, onCat]);
    return null;
}

export function WritingList({
    rows,
    chips,
    feat,
}: {
    rows: WritingRow[];
    chips: Chip[];
    feat: Feat;
}) {
    const [cat, setCat] = useState('all');
    const [status, setStatus] = useState('');
    const featRef = useRef<HTMLAnchorElement>(null);
    const listRef = useRef<HTMLElement>(null);
    const labels = useMemo(
        () =>
            Object.fromEntries(chips.map((c) => [c.cat, c.label])) as Record<
                string,
                string
            >,
        [chips],
    );
    const onCat = useCallback(
        (q: string | null) => setCat(q && labels[q] ? q : 'all'),
        [labels],
    );

    const isOn = (r: WritingRow) =>
        cat === 'all' ? !r.latest : r.cats.includes(cat);
    const years: { y: number; rows: WritingRow[] }[] = [];
    rows.forEach((r) => {
        const g = years[years.length - 1];
        if (g && g.y === r.year) g.rows.push(r);
        else years.push({ y: r.year, rows: [r] });
    });

    /* rows that just became visible in the viewport shouldn't wait for the scroll observer */
    useEffect(() => {
        const vh = window.innerHeight;
        const els = [
            ...(listRef.current?.querySelectorAll<HTMLElement>(
                '[data-reveal]:not(.is-in)',
            ) || []),
            ...(featRef.current && !featRef.current.classList.contains('is-in')
                ? [featRef.current]
                : []),
        ];
        els.forEach((el) => {
            if (el.offsetParent !== null && el.getBoundingClientRect().top < vh)
                el.classList.add('is-in');
        });
    }, [cat]);

    const choose = (c: string) => {
        setCat(c);
        const n = rows.filter((r) =>
            c === 'all' ? !r.latest : r.cats.includes(c),
        ).length;
        setStatus(
            (c === 'all' ? 'All posts' : labels[c]) +
                ', ' +
                (c === 'all' ? n + 1 : n) +
                ' posts',
        );
        try {
            window.history.replaceState(
                null,
                '',
                location.pathname +
                    (c === 'all' ? '' : '?cat=' + c) +
                    location.hash,
            );
        } catch {}
    };

    return (
        <>
            <Suspense fallback={null}>
                <CatFromQuery onCat={onCat} />
            </Suspense>
            <div className="wrap">
                <Link
                    className="feat"
                    href={`/writing/${feat.slug}`}
                    data-reveal
                    hidden={cat !== 'all'}
                    ref={featRef}
                >
                    <span className="feat__img">
                        <img
                            src={feat.img}
                            width="1600"
                            height="1000"
                            alt={feat.alt}
                            fetchPriority="high"
                            decoding="async"
                        />
                        <span className="feat__tag mono">
                            <span className="dot" aria-hidden="true" />
                            Latest
                        </span>
                    </span>
                    <span className="feat__body">
                        <span className="feat__k mono">
                            <b>{feat.date}</b>
                            <span>{feat.label}</span>
                            <span>{feat.reading}</span>
                        </span>
                        <h2>{feat.title}</h2>
                        <span className="feat__dek">{feat.dek}</span>
                        <span className="link-arrow mono">
                            Read the post{' '}
                            <svg
                                viewBox="0 0 16 16"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </span>
                </Link>
            </div>

            <section
                className="wlist wrap"
                aria-labelledby="all-posts"
                ref={listRef}
            >
                <h2 className="sr-only" id="all-posts">
                    All posts
                </h2>
                <div className="fbar">
                    <div
                        className="fchips"
                        role="group"
                        aria-label="Filter by topic"
                    >
                        {chips.map((c) => (
                            <button
                                key={c.cat}
                                className="fchip"
                                type="button"
                                data-cat={c.cat}
                                aria-pressed={c.cat === cat ? 'true' : 'false'}
                                onClick={() => choose(c.cat)}
                            >
                                {c.label} <span>{c.n}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <p
                    className="sr-only"
                    role="status"
                    aria-live="polite"
                    data-status
                >
                    {status}
                </p>
                {years.map((g) => (
                    <section
                        key={g.y}
                        className="wyear"
                        data-y={g.y}
                        aria-label={String(g.y)}
                        hidden={!g.rows.some(isOn)}
                    >
                        <h2 className="wyear__y">{g.y}</h2>
                        <ul className="wyear__list">
                            {g.rows.map((r) => (
                                <li
                                    key={r.slug}
                                    data-cats={r.cats.join(' ')}
                                    data-latest={r.latest ? '' : undefined}
                                    hidden={!isOn(r)}
                                >
                                    <Link
                                        className="wpost"
                                        href={`/writing/${r.slug}`}
                                    >
                                        <span className="wpost__img">
                                            <img
                                                src={r.img}
                                                width="400"
                                                height="260"
                                                alt={r.alt}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </span>
                                        <span className="wpost__main">
                                            <span className="wpost__t">
                                                {r.title}
                                            </span>
                                            <span className="wpost__m mono">
                                                <time dateTime={r.iso}>
                                                    {r.date}
                                                </time>
                                                <span>{r.label}</span>
                                            </span>
                                        </span>
                                        <span className="wpost__r mono">
                                            {r.reading}
                                        </span>
                                        <span
                                            className="post__a"
                                            aria-hidden="true"
                                        >
                                            {ARROW}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </section>
        </>
    );
}
