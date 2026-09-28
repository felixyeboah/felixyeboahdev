'use client';

import { type CSSProperties, useEffect, useState } from 'react';

import { HERO_SOFT, HERO_TEXT, type Token, heroLabel, tokens } from './split';

const A = tokens(HERO_TEXT, 0);
const B = tokens(HERO_SOFT, A.filter((t) => t !== ' ').length);

function Words({ list }: { list: Token[] }) {
    return list.map((t) =>
        t === ' ' ? (
            ' '
        ) : (
            <span className="w" key={t.i}>
                <span style={{ '--i': t.i } as CSSProperties}>{t.word}</span>
            </span>
        ),
    );
}

/** Landing headline. Server + reduced motion: plain text. Client with html.motion: the masked split
    (already applied pre-paint by HERO_SPLIT_SCRIPT on first load), then .is-in two frames later. */
export function HeroTitle() {
    const [split] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('motion'));
    const [shown, setShown] = useState(false);

    useEffect(() => {
        if (!split) return;
        let r2 = 0;
        const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setShown(true))));
        return () => {
            cancelAnimationFrame(r1);
            cancelAnimationFrame(r2);
        };
    }, [split]);

    if (!split)
        return (
            <h1 id="hero-title" data-split="">
                {HERO_TEXT}
                <span className="soft">{HERO_SOFT}</span>
            </h1>
        );
    return (
        <h1 id="hero-title" data-split="" className={shown ? 'is-split is-in' : 'is-split'} aria-label={heroLabel} suppressHydrationWarning>
            <Words list={A} />
            <span className="soft">
                <Words list={B} />
            </span>
        </h1>
    );
}
