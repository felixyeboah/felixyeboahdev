/* =====================================================================
   Photographs: small DOM kit shared by the book (monograph.ts), the columns view and the viewer.
   ---------------------------------------------------------------------
   The page is driven imperatively, like lib/site/fy.ts: a controller is mounted on the markup that
   book.tsx renders and returns one cleanup. Everything here is created per mount and torn down
   through a Scope, so a client navigation (or React's double effect in dev) leaves nothing behind.
   ===================================================================== */
import { type Photo, type PhotoSet, photoSrc, photoSrcSet, pickWidth } from '@/lib/site/photos';

export type Cleanup = () => void;

/** Owns every listener, timer and stray node a mount creates. dispose() undoes all of it. */
export type Scope = {
    on(target: EventTarget, type: string, fn: (e: any) => void, opts?: AddEventListenerOptions): void;
    add(fn: Cleanup): void;
    timeout(fn: () => void, ms: number): number;
    dispose(): void;
};

export function createScope(): Scope {
    const cleanups: Cleanup[] = [];
    const timers = new Set<number>();
    let dead = false;
    return {
        on(target, type, fn, opts) {
            target.addEventListener(type, fn, opts);
            cleanups.push(() => target.removeEventListener(type, fn, opts));
        },
        add(fn) {
            cleanups.push(fn);
        },
        timeout(fn, ms) {
            const id = window.setTimeout(() => {
                timers.delete(id);
                if (!dead) fn();
            }, ms);
            timers.add(id);
            return id;
        },
        dispose() {
            if (dead) return;
            dead = true;
            timers.forEach((id) => clearTimeout(id));
            timers.clear();
            for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
            cleanups.length = 0;
        },
    };
}

export const motion = () => document.documentElement.classList.contains('motion');
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export const mod = (n: number, m: number) => ((n % m) + m) % m;
export const pad = (n: number, len = 3) => String(n).padStart(len, '0');
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
export const roman = (n: number) => ROMAN[n - 1] || String(n);
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
}

/** Set titles by id, with the id as a fallback. */
export function titles(sets: PhotoSet[]) {
    const map = new Map(sets.map((s) => [s.id, s.title]));
    return (id: string) => map.get(id) ?? id;
}

export const src = (p: Photo, min = 0) => photoSrc(p, pickWidth(p, min));

/** One photograph: blurred placeholder under the real image, which fades in once decoded. */
export function frame(p: Photo, o: { sizes?: string; min?: number; eager?: boolean; alt?: string } = {}) {
    const s = el('span', 'fr');
    s.style.backgroundColor = p.color;
    s.style.backgroundImage = `url(${p.lqip})`;
    const im = new Image();
    im.alt = o.alt ?? '';
    im.decoding = 'async';
    im.loading = o.eager ? 'eager' : 'lazy';
    im.draggable = false;
    im.width = p.w;
    im.height = p.h;
    const done = () => s.classList.add('is-loaded');
    im.onload = done;
    im.onerror = done;
    im.sizes = o.sizes || '50vw';
    im.srcset = photoSrcSet(p);
    im.src = src(p, o.min || 960);
    if (im.complete && im.naturalWidth) done();
    s.appendChild(im);
    return s;
}

/* ---------- state in the hash: #view=columns&n=14&p=<id> ---------- */
export function readHash(): Record<string, string> {
    const o: Record<string, string> = {};
    for (const kv of location.hash.replace(/^#/, '').split('&')) {
        const i = kv.indexOf('=');
        if (i > 0) o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    }
    return o;
}
export function hashOf(o: Record<string, string>) {
    const s = Object.keys(o)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(o[k]))
        .join('&');
    return s ? '#' + s : location.pathname + location.search;
}
export const getHash = (k: string) => readHash()[k] ?? null;
export function setHash(k: string, v: string | null) {
    const o = readHash();
    if (v == null || v === '') delete o[k];
    else o[k] = v;
    try {
        history.replaceState(history.state, '', hashOf(o));
    } catch {}
}

export const ICON = {
    play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 2.6v10.8L13 8z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 4.7v.4" stroke-linecap="round"/></svg>',
    full: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
    next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
};

/** A round label that follows the pointer over anything carrying data-cur="View". Fine pointers only. */
export function mountCursor(scope: Scope, quiet: () => boolean) {
    if (!finePointer()) return;
    const root = document.documentElement;
    const dot = el('div', 'pcur');
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    root.classList.add('has-cur');
    let x = 0,
        y = 0,
        tx = 0,
        ty = 0,
        raf = 0,
        on = false;
    const tick = () => {
        x += (tx - x) * 0.24;
        y += (ty - y) * 0.24;
        dot.style.transform = `translate3d(${x}px,${y}px,0)`;
        raf = on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    scope.on(
        document,
        'pointermove',
        (e: PointerEvent) => {
            tx = e.clientX;
            ty = e.clientY;
            const t = e.target instanceof Element ? e.target.closest('[data-cur]') : null;
            const label = t && !quiet() ? t.getAttribute('data-cur') : '';
            if (label) {
                if (!on) {
                    x = tx;
                    y = ty;
                }
                dot.textContent = label;
            }
            on = !!label;
            dot.classList.toggle('is-on', on);
            if (!raf) raf = requestAnimationFrame(tick);
        },
        { passive: true },
    );
    scope.on(document, 'pointerdown', () => dot.classList.add('is-down'));
    scope.on(document, 'pointerup', () => dot.classList.remove('is-down'));
    scope.on(document, 'pointerleave', () => {
        on = false;
        dot.classList.remove('is-on');
    });
    scope.add(() => {
        cancelAnimationFrame(raf);
        dot.remove();
        root.classList.remove('has-cur');
    });
}
