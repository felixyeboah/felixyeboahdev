'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/* Project title (work_pages.js splitTitle + fitTitle).
   Rendered pre-split (masked letters) so the letters never flash unsplit before hydration; with reduced motion
   it drops back to plain words, exactly like the prototype, which only split when html.motion was set.
   fitTitle shrinks the size if the widest word would overflow its column (never grows). */
export function CaseTitle({ name, long, fw }: { name: string; long: boolean; fw: number }) {
    const ref = useRef<HTMLHeadingElement>(null);
    const [split, setSplit] = useState(true);
    const [shown, setShown] = useState(false);

    useLayoutEffect(() => {
        if (!document.documentElement.classList.contains('motion')) {
            setSplit(false);
            return;
        }
        let r2 = 0;
        const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(() => setShown(true))));
        return () => {
            cancelAnimationFrame(r1);
            cancelAnimationFrame(r2);
            setShown(false);
        };
    }, []);

    useEffect(() => {
        const h1 = ref.current;
        if (!h1) return;
        const fit = () => {
            h1.style.fontSize = '';
            const avail = h1.clientWidth;
            let widest = 0;
            h1.querySelectorAll('.w').forEach((w) => (widest = Math.max(widest, w.getBoundingClientRect().width)));
            if (widest > avail && avail > 0) {
                const fs = parseFloat(getComputedStyle(h1).fontSize);
                h1.style.fontSize = Math.floor(fs * (avail / widest) * 0.97) + 'px';
            }
        };
        fit();
        let alive = true;
        let rt: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
            clearTimeout(rt);
            rt = setTimeout(fit, 120);
        };
        window.addEventListener('resize', onResize);
        document.fonts?.ready.then(() => alive && fit());
        return () => {
            alive = false;
            clearTimeout(rt);
            window.removeEventListener('resize', onResize);
            h1.style.fontSize = '';
        };
    }, [split]);

    let i = 0;
    const words = name.split(/\s+/);
    return (
        <h1
            ref={ref}
            className={'ptitle' + (long ? ' is-long' : '') + (split ? ' is-split' : '') + (split && shown ? ' is-in' : '')}
            id="p-title"
            data-split=""
            aria-label={split ? name.replace(/\s+/g, ' ').trim() : undefined}
            style={{ '--fw': fw } as CSSProperties}
        >
            {words.map((w, k) => (
                <Fragment key={k}>
                    {k > 0 && ' '}
                    <span className="w">
                        {split
                            ? w.split('').map((c, j) => (
                                  <span className="ch-l" aria-hidden="true" key={j}>
                                      <span style={{ '--i': i++ } as CSSProperties}>{c}</span>
                                  </span>
                              ))
                            : w}
                    </span>
                </Fragment>
            ))}
        </h1>
    );
}
