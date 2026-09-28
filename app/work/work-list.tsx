'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';

import { GROUPS, PROJECTS, pad2, type ProjectGroup } from '@/lib/site/projects';

/* Work index: category filter + grid/list view, both synced to the URL (?cat=products&view=list) with
   replaceState, exactly like the prototype's inline script (no history entries). The archive hover peek
   (.arch__peek) is bound by fy.ts; rows stay mounted (only `hidden` toggles), so its listeners survive filtering. */

type Cat = 'all' | ProjectGroup;
type View = 'grid' | 'list';

const CATS: Record<string, string> = Object.fromEntries([['all', 'All'], ...GROUPS]);

const ARROW = (
    <svg viewBox="0 0 16 16" fill="none">
        <path d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ARROW15 = (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const GRID_ICON = (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="9" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
);
const LIST_ICON = (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

export function WorkList() {
    const rootRef = useRef<HTMLElement>(null);
    const [state, setState] = useState<{ cat: Cat; view: View }>({ cat: 'all', view: 'grid' });
    const [status, setStatus] = useState('');
    const synced = useRef(false);

    const shown = PROJECTS.filter((p) => state.cat === 'all' || p.group === state.cat).length;
    const label = shown + (shown === 1 ? ' project' : ' projects');

    /* read ?cat / ?view once, before paint */
    useLayoutEffect(() => {
        try {
            const q = new URLSearchParams(location.search);
            const cat = q.get('cat');
            const next = {
                cat: (cat && CATS[cat] ? cat : 'all') as Cat,
                view: (q.get('view') === 'list' ? 'list' : 'grid') as View,
            };
            if (next.cat !== 'all' || next.view !== 'grid') setState(next);
        } catch {}
    }, []);

    /* after every render of the filter: URL sync + reveal anything newly visible that was never revealed */
    useLayoutEffect(() => {
        if (synced.current) {
            try {
                const q = new URLSearchParams();
                if (state.cat !== 'all') q.set('cat', state.cat);
                if (state.view !== 'grid') q.set('view', state.view);
                const s = q.toString();
                history.replaceState(history.state, '', location.pathname + (s ? '?' + s : '') + location.hash);
            } catch {}
        }
        rootRef.current?.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
            if (el.offsetParent !== null && el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
        });
    }, [state]);

    const choose = (next: Partial<{ cat: Cat; view: View }>) => {
        const s = { ...state, ...next };
        const n = PROJECTS.filter((p) => s.cat === 'all' || p.group === s.cat).length;
        synced.current = true;
        setState(s);
        setStatus(
            (s.cat === 'all' ? 'All projects' : CATS[s.cat]) + ', ' + n + (n === 1 ? ' project' : ' projects') + ', ' + s.view + ' view',
        );
    };

    return (
        <section className="worklist" aria-labelledby="work-list-title" ref={rootRef}>
            <h2 className="sr-only" id="work-list-title">
                All projects
            </h2>
            <div className="wrap">
                <div className="fbar">
                    <div className="fchips" role="group" aria-label="Filter by category">
                        {Object.entries(CATS).map(([k, name]) => (
                            <button
                                key={k}
                                className="fchip"
                                type="button"
                                data-cat={k}
                                aria-pressed={state.cat === k ? 'true' : 'false'}
                                onClick={() => choose({ cat: k as Cat })}
                            >
                                {name} <span>{PROJECTS.filter((p) => k === 'all' || p.group === k).length}</span>
                            </button>
                        ))}
                    </div>
                    <div className="seg" role="group" aria-label="View">
                        <button type="button" data-view="grid" aria-pressed={state.view === 'grid' ? 'true' : 'false'} onClick={() => choose({ view: 'grid' })}>
                            {GRID_ICON}Grid
                        </button>
                        <button type="button" data-view="list" aria-pressed={state.view === 'list' ? 'true' : 'false'} onClick={() => choose({ view: 'list' })}>
                            {LIST_ICON}List
                        </button>
                    </div>
                </div>
                <p className="sr-only" role="status" aria-live="polite" data-status="">
                    {status}
                </p>
            </div>

            <div data-pane="grid" hidden={state.view !== 'grid'}>
                <div className="work" data-stagger="">
                    {PROJECTS.map((p) => (
                        <Link
                            key={p.slug}
                            className="tile"
                            href={`/work/${p.slug}`}
                            data-cat={p.group}
                            data-reveal=""
                            hidden={!(state.cat === 'all' || p.group === state.cat)}
                        >
                            <div className="tile__top">
                                <span className="tile__idx mono">
                                    <b>{pad2(p.order)}</b> {p.category}
                                </span>
                                <span className="tile__go" aria-hidden="true">
                                    {ARROW}
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
                    ))}
                    <Link className="tile tile--cta" href="/contact" data-reveal="" hidden={shown % 2 === 0}>
                        <div className="tile__top">
                            <span className="tile__idx mono">
                                <span className="dot" aria-hidden="true" /> Taking on select projects
                            </span>
                            <span className="tile__go" aria-hidden="true">
                                {ARROW}
                            </span>
                        </div>
                        <div className="tile__shot" aria-hidden="true">
                            <div className="tile__bar">
                                <i />
                                <i />
                                <i />
                                <span className="tile__url">your-product.com</span>
                            </div>
                            <div className="tile__img tile__img--empty">
                                <span>Your product</span>
                            </div>
                        </div>
                        <div className="tile__meta">
                            <div>
                                <h3>Yours, next?</h3>
                                <p className="tile__desc">Have a product worth building? Tell me about it.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="wrap" data-pane="list" hidden={state.view !== 'list'}>
                <div className="arch arch--solo">
                    <p className="arch__label mono">
                        <span>Project</span>
                        <span data-count-label="">{label}</span>
                    </p>
                    <ol className="arch__list">
                        {PROJECTS.map((p) => (
                            <li key={p.slug} data-cat={p.group} hidden={!(state.cat === 'all' || p.group === state.cat)}>
                                <Link className="arch__row" href={`/work/${p.slug}`} data-img={p.cover}>
                                    <span className="arch__n mono">{pad2(p.order)}</span>
                                    <span className="arch__t">{p.name}</span>
                                    <span className="arch__c mono">{p.category}</span>
                                    <span className="arch__s mono">{p.domain}</span>
                                    <span className="arch__a">{ARROW15}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <img className="arch__peek" alt="" aria-hidden="true" decoding="async" />
                </div>
            </div>

            <div className="wrap outro">
                <Link className="allbar" href="/contact" data-reveal="">
                    <span className="allbar__t">Start a project</span>
                    <span className="allbar__n mono">me@felixyeboah.dev</span>
                    <span className="allbar__go" aria-hidden="true">
                        {ARROW}
                    </span>
                </Link>
            </div>
        </section>
    );
}
