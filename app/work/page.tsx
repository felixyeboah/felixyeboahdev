import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PageStyle } from '@/core/site/chrome';
import { PROJECTS } from '@/lib/site/projects';

import { WorkList } from './work-list';

/* Port of design-options/site/work/index.html (generator: tools/sitebuild/work.py). */

export const metadata: Metadata = {
    title: { absolute: 'Work — Felix Yeboah' },
    description:
        'Fifteen products and sites by Felix Yeboah, latest first: payments, commerce, drones, ride-sharing and more, designed and built end to end.',
};

export default function WorkPage() {
    return (
        <main id="main">
            <PageStyle name="work-index" />
            <header className="pagehead wrap">
                <p className="pagehead__crumb mono" data-reveal="">
                    <Link href="/">Index</Link>
                    <span className="sep" aria-hidden="true" />
                    <span aria-current="page">Work</span>
                    <span className="end">
                        <span className="dot" aria-hidden="true" />
                        Latest first
                    </span>
                </p>
                <h1 className="pagehead__title" data-reveal="" style={{ '--d': '60ms' } as CSSProperties}>
                    Products built end to end, <span className="soft">design through deploy.</span>
                </h1>
                <div className="pagehead__foot">
                    <p className="pagehead__lede" data-reveal="" style={{ '--d': '140ms' } as CSSProperties}>
                        A payments router, a spice shop, a ride-share, drone companies and the sites behind small businesses.
                        Every one taken from first sketch to production.
                    </p>
                    <p className="pagehead__meta mono" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                        {PROJECTS.length} projects
                        <br />
                        Newest at the top
                    </p>
                </div>
            </header>
            <WorkList />
        </main>
    );
}
