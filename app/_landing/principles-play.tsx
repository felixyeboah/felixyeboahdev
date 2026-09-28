'use client';

import { useEffect } from 'react';

/** Principle cards: on touch devices there is no hover, so play each card's animation while it's in view
    (toggles .play on .p). Motion only, like the prototype's landing script. */
export function PrinciplesPlay() {
    useEffect(() => {
        if (!document.documentElement.classList.contains('motion')) return;
        if (window.matchMedia('(hover:hover)').matches || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle('play', en.isIntersecting)), {
            threshold: 0.6,
        });
        const cards = document.querySelectorAll('.p');
        cards.forEach((c) => io.observe(c));
        return () => {
            io.disconnect();
            cards.forEach((c) => c.classList.remove('play'));
        };
    }, []);
    return null;
}
