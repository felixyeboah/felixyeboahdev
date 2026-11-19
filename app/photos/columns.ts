/* =====================================================================
   Photographs: the Columns view.
   Columns of plates travel in opposite directions as the page scrolls, each looping without a
   seam, with the title fixed in the middle and inverting against whatever passes beneath it.
   With reduced motion it is a plain grid in normal flow.
   ===================================================================== */
import type { Photo } from '@/lib/site/photos';

import { type Cleanup, clamp, createScope, el, finePointer, frame, mod, motion, pad } from './kit';
import type { Viewer } from './viewer';

type Options = {
    setTitle: (id: string) => string;
    numberOf: (p: Photo) => number;
    viewer: Viewer;
};

type Column = { run: HTMLElement; H: number; items: { p: Photo; el: HTMLElement; mid: number }[]; dir: number; rate: number; phase: number; y: number };

const RATE = [1, 0.8, 1.16];
const colCount = () => (innerWidth < 760 ? 2 : 3);

/** Deal the photographs into n columns of roughly equal height. */
function buckets(list: Photo[], n: number) {
    const out: Photo[][] = [];
    const hs: number[] = [];
    for (let i = 0; i < n; i++) {
        out.push([]);
        hs.push(0);
    }
    for (const p of list) {
        const k = hs.indexOf(Math.min(...hs));
        out[k].push(p);
        hs[k] += p.h / p.w + 0.1;
    }
    /* fewer photographs than columns: a column borrows the whole list rather than standing empty */
    return out.map((b) => (b.length ? b : list.slice()));
}

export function mountColumns(host: HTMLElement, list: Photo[], { setTitle, numberOf, viewer }: Options): Cleanup {
    const scope = createScope();
    scope.add(() => host.replaceChildren());
    if (!list.length) return scope.dispose;

    let suppress = false;

    function fig(p: Photo, dup: boolean) {
        const f = el('figure', 'ci');
        const b = el('button', 'ck');
        b.type = 'button';
        b.dataset.pid = p.id;
        b.dataset.cur = 'View';
        b.setAttribute('aria-label', p.title || `${setTitle(p.set)}, photograph ${pad(numberOf(p))}`);
        b.style.aspectRatio = `${p.w} / ${p.h}`;
        b.appendChild(frame(p, { eager: true, min: 480, sizes: '(max-width:760px) 50vw, 33vw' }));
        if (dup) {
            f.setAttribute('aria-hidden', 'true');
            b.tabIndex = -1;
        }
        f.appendChild(b);
        f.appendChild(el('figcaption', 'mono', `<span>${pad(numberOf(p))}</span><i>${setTitle(p.set)}</i>`));
        return f;
    }

    scope.on(host, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest<HTMLElement>('[data-pid]');
        if (b && !suppress) viewer.open(b.dataset.pid as string, b);
    });

    /* reduced motion: a plain grid, nothing pinned, each photograph once */
    if (!motion()) {
        const sec = el('section', 'cs cs--static');
        const grid = el('div', 'cs__cols wrap');
        sec.appendChild(grid);
        host.appendChild(sec);
        let n0 = 0;
        const flat = () => {
            const n = colCount();
            if (n === n0) return;
            n0 = n;
            grid.replaceChildren();
            grid.style.setProperty('--n', String(n));
            const seen = new Set<string>();
            for (const b of buckets(list, n)) {
                const col = el('div', 'cs__col');
                const g = el('div', 'cs__grp');
                for (const p of b) {
                    if (seen.has(p.id)) continue;
                    seen.add(p.id);
                    g.appendChild(fig(p, false));
                }
                col.appendChild(g);
                grid.appendChild(col);
            }
        };
        flat();
        scope.on(window, 'resize', flat);
        return scope.dispose;
    }

    const sec = el('section', 'cs');
    const stage = el('div', 'cs__stage');
    const colsEl = el('div', 'cs__cols wrap');
    const mark = el('div', 'cs__mark');
    const prog = el('i', 'cs__prog');
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = `<div class="cs__word">Photographs</div><p class="cs__count mono"><b></b><i></i><span></span><em>/ ${pad(list.length)}</em></p>`;
    stage.append(colsEl, mark, prog);
    sec.appendChild(stage);
    host.appendChild(sec);
    const noEl = mark.querySelector('b') as HTMLElement;
    const setEl = mark.querySelector('span') as HTMLElement;

    let cols: Column[] = [];
    let L = 0,
        vh = 0,
        lastW = 0;
    let cam = 0,
        target = 0,
        drift = 0,
        dragOff = 0,
        dragV = 0,
        slow = 1,
        slowT = 1;
    let raf = 0,
        lastT = 0,
        onScreen = true,
        dragging = false,
        down = false,
        py = 0,
        sy = 0,
        resizeT = 0;
    let cur: Photo | null = null;

    function build() {
        lastW = innerWidth;
        vh = stage.clientHeight || innerHeight;
        L = Math.max(2400, Math.round(innerHeight * 3));
        sec.style.height = `calc(100svh + ${L}px)`;
        colsEl.replaceChildren();
        cols = [];
        cur = null;
        const n = colCount();
        colsEl.style.setProperty('--n', String(n));
        buckets(list, n).forEach((b, i) => {
            const col = el('div', 'cs__col');
            const run = el('div', 'cs__run');
            const g1 = el('div', 'cs__grp');
            const g2 = el('div', 'cs__grp');
            col.style.setProperty('--i', String(i));
            col.style.setProperty('--from', (i % 2 ? -70 : 70) + 'px');
            g2.setAttribute('aria-hidden', 'true');
            run.appendChild(g1);
            col.appendChild(run);
            colsEl.appendChild(col);
            const items: Column['items'] = [];
            let pass = 0;
            const fill = () => {
                for (const p of b) {
                    const f = fig(p, pass > 0);
                    g1.appendChild(f);
                    items.push({ p, el: f, mid: 0 });
                }
                pass++;
            };
            fill();
            /* one copy must be taller than the stage, or the loop would show its seam */
            while (g1.offsetHeight < vh * 1.15 && pass < 10) fill();
            const H = g1.offsetHeight || 1;
            for (const it of items) {
                it.mid = it.el.offsetTop + (it.el.firstElementChild as HTMLElement).offsetHeight / 2;
                g2.appendChild(fig(it.p, true));
            }
            run.appendChild(g2);
            cols.push({ run, H, items, dir: i % 2 ? -1 : 1, rate: RATE[i % 3], phase: i * 0.37 * H, y: 0 });
        });
        place();
    }

    function place() {
        for (const c of cols) {
            c.y = -mod((cam * 0.5 + drift) * c.rate * c.dir + c.phase, c.H);
            c.run.style.transform = `translate3d(0,${c.y.toFixed(1)}px,0)`;
        }
        /* the counter follows whichever photograph in the middle column is crossing the centre line */
        const m = cols[Math.min(1, cols.length - 1)];
        if (!m) return;
        let best: Photo | null = null,
            bd = 1e9;
        for (const it of m.items) {
            const d = Math.abs(mod(m.y + it.mid - vh / 2 + m.H / 2, m.H) - m.H / 2);
            if (d < bd) {
                bd = d;
                best = it.p;
            }
        }
        if (best && best !== cur) {
            cur = best;
            noEl.textContent = pad(numberOf(best));
            setEl.textContent = setTitle(best.set);
        }
    }

    function read() {
        const top = -sec.getBoundingClientRect().top;
        target = clamp(top, -innerHeight, L + innerHeight) + dragOff;
        prog.style.transform = `scaleX(${clamp(top / L, 0, 1).toFixed(4)})`;
    }

    function tick(t: number) {
        raf = 0;
        if (!onScreen || document.hidden || viewer.isOpen()) return;
        const dt = lastT ? Math.min(50, t - lastT) : 16;
        lastT = t;
        if (!dragging && Math.abs(dragV) > 0.1) {
            dragOff += dragV;
            dragV *= 0.93;
        }
        read();
        cam += (target - cam) * 0.085;
        slow += (slowT - slow) * 0.08;
        if (!dragging) drift += dt * 0.03 * slow;
        place();
        raf = requestAnimationFrame(tick);
    }
    function kick() {
        if (!raf && onScreen && !document.hidden) {
            lastT = 0;
            raf = requestAnimationFrame(tick);
        }
    }

    /* a backgrounded tab gets no frames: land the columns where the scroll says they should be */
    scope.on(
        window,
        'scroll',
        () => {
            if (document.hidden) {
                read();
                cam = target;
                place();
            } else kick();
        },
        { passive: true },
    );

    /* hovering a photograph slows the idle travel to a near stop */
    if (finePointer()) {
        scope.on(stage, 'pointerover', (e: PointerEvent) => {
            slowT = (e.target as Element).closest('.ck') ? 0.04 : 1;
        });
        scope.on(stage, 'pointerleave', () => {
            slowT = 1;
        });
    }

    /* mouse drag moves the columns; touch already does by scrolling the page */
    scope.on(stage, 'pointerdown', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true;
        suppress = false;
        py = sy = e.clientY;
        dragV = 0;
    });
    scope.on(window, 'pointermove', (e: PointerEvent) => {
        if (!down) return;
        const dy = e.clientY - py;
        if (!dragging && Math.abs(e.clientY - sy) > 5) {
            dragging = true;
            suppress = true;
            stage.classList.add('is-drag');
        }
        if (dragging) {
            dragOff -= dy * 2;
            dragV = -dy * 2;
            kick();
        }
        py = e.clientY;
    });
    const release = () => {
        if (!down) return;
        down = false;
        if (!dragging) return;
        dragging = false;
        stage.classList.remove('is-drag');
        /* the click that follows this pointerup is the only one to swallow */
        scope.timeout(() => {
            suppress = false;
        }, 0);
    };
    scope.on(window, 'pointerup', release);
    scope.on(window, 'pointercancel', release);

    /* tabbing to a photograph brings it to the centre line */
    scope.on(stage, 'focusin', (e: FocusEvent) => {
        const b = (e.target as Element).closest<HTMLElement>('.ck');
        if (!b || down || !b.matches(':focus-visible')) return;
        stage.scrollTop = 0;
        const c = cols.find((x) => x.run.contains(b));
        if (!c) return;
        const s = stage.getBoundingClientRect(),
            r = b.getBoundingClientRect();
        const shift = (r.top + r.height / 2 - (s.top + s.height / 2)) / (0.5 * c.rate * c.dir);
        dragOff += shift;
        cam += shift;
        read();
        place();
        kick();
    });

    const io = new IntersectionObserver((en) => {
        onScreen = en[0].isIntersecting;
        if (onScreen) kick();
    });
    io.observe(sec);
    scope.on(window, 'resize', () => {
        clearTimeout(resizeT);
        resizeT = scope.timeout(() => {
            if (innerWidth !== lastW) build();
            else {
                vh = stage.clientHeight || innerHeight;
                place();
            }
        }, 180);
    });
    scope.on(document, 'visibilitychange', kick);
    const prevClose = viewer.onClose;
    viewer.onClose = (id) => {
        prevClose?.(id);
        kick();
    };
    scope.add(() => {
        viewer.onClose = prevClose;
        io.disconnect();
        cancelAnimationFrame(raf);
    });

    build();
    read();
    cam = target;
    place();
    kick();
    return scope.dispose;
}
