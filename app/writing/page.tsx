import { PageStyle } from '@/core/site/chrome';
import {
    CAT_ORDER,
    catLabel,
    cld,
    fmtDate2,
    getPosts,
    isoDate,
} from '@/lib/site/posts';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { WritingList, type WritingRow } from './writing-list';

/* Writing index, ported from design-options/tools/sitebuild/writing.py (site/writing/index.html). */

export const metadata: Metadata = {
    title: { absolute: 'Writing — Felix Yeboah' },
    description:
        'Essays, year-in-reviews and tutorials by Felix Yeboah on Remix, Go, React and the path from self-taught to senior engineer.',
    alternates: { canonical: '/writing' },
};

/* the featured (latest) post's dek, as written for the prototype */
const DEK =
    'It began with an e-commerce app for a client selling natural spice products, and a payment webhook that sometimes fired and sometimes went total silence.';

const d = (ms: string) => ({ '--d': ms }) as CSSProperties;
const mins = (m: number) => (m ? `${m} min read` : '');

export default function WritingPage() {
    const posts = getPosts();
    const latest = posts[0];
    const first = posts[posts.length - 1].date.getUTCFullYear();
    const last = latest.date.getUTCFullYear();

    const rows: WritingRow[] = posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        cats: p.categories,
        label: p.categories.map(catLabel).join(' · '),
        date: fmtDate2(p.date),
        iso: isoDate(p.date),
        year: p.date.getUTCFullYear(),
        reading: mins(p.minutes),
        img: cld(p.cover, 400),
        alt: p.bannerAlt,
        latest: p === latest,
    }));
    const chips = [
        { cat: 'all', label: 'All', n: posts.length },
        ...CAT_ORDER.map((c) => ({
            cat: c,
            label: catLabel(c),
            n: posts.filter((p) => p.categories.includes(c)).length,
        })),
    ];

    return (
        <main id="main">
            <PageStyle name="writing-index" />
            <header className="pagehead wrap">
                <p className="pagehead__crumb mono" data-reveal>
                    <Link href="/">Index</Link>
                    <span className="sep" aria-hidden="true" />
                    <span aria-current="page">Writing</span>
                    <span className="end">
                        {first} — {last}
                    </span>
                </p>
                <h1 className="pagehead__title" data-reveal style={d('60ms')}>
                    Notes from <span className="soft">the work.</span>
                </h1>
                <div className="pagehead__foot">
                    <p
                        className="pagehead__lede"
                        data-reveal
                        style={d('140ms')}
                    >
                        Essays, year-in-reviews and tutorials: Remix and React,
                        Go on the backend, and the story of how a self-taught
                        developer got here.
                    </p>
                    <p
                        className="pagehead__meta mono"
                        data-reveal
                        style={d('200ms')}
                    >
                        {posts.length} posts
                        <br />
                        Newest first
                    </p>
                </div>
            </header>

            <WritingList
                rows={rows}
                chips={chips}
                feat={{
                    slug: latest.slug,
                    title: latest.title,
                    img: cld(latest.cover, 1600),
                    alt: latest.bannerAlt,
                    date: fmtDate2(latest.date),
                    label: latest.categories.map(catLabel).join(' · '),
                    reading: mins(latest.minutes),
                    dek: DEK,
                }}
            />
        </main>
    );
}
