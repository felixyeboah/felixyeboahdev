/* =====================================================================
   Photographs: the full-screen viewer.
   Arrow keys, swipe, zoom, slideshow, fullscreen, a details panel with a copyable palette, a
   shareable link (#p=<id>) and Back to close. Travelling between photographs reshapes the frame
   from one proportion to the next while the pictures cross-dissolve inside it.
   One viewer per mount; all of its state lives in this closure and leaves with the Scope.
   ===================================================================== */
import { toast } from '@/lib/site/fy';
import { type Photo, photoDate, photoSrcSet } from '@/lib/site/photos';

import { ICON, type Scope, el, esc, hashOf, motion, pad, readHash, setHash, src } from './kit';

export type Viewer = {
    open(id: string, origin?: HTMLElement | null): void;
    close(): void;
    isOpen(): boolean;
    /** Called after the viewer has closed, with the photograph it closed on. */
    onClose: ((id: string | null) => void) | null;
};

type Options = {
    scope: Scope;
    /** The photographs currently on show, in order. */
    list: () => Photo[];
    setTitle: (id: string) => string;
    /** The number shown for a photograph (its plate number). */
    numberOf: (p: Photo) => number;
};

const SLIDE_MS = 4200;
const MORPH_MS = 560;
const MORPH_EASE = 'cubic-bezier(.2,0,0,1)';

export function createViewer({ scope, list: getList, setTitle, numberOf }: Options): Viewer {
    const root = document.documentElement;
    const alt = (p: Photo) => p.title || `${setTitle(p.set)}, photograph ${pad(numberOf(p))}`;

    let list: Photo[] = [];
    let i = 0;
    let open = false;
    let playing = false;
    let playTimer = 0;
    let morphTimer = 0;
    let info = false;
    let pushed = false;
    let last: Element | null = null;
    let swiped = false;

    const box = el('div', 'lb');
    box.hidden = true;
    box.tabIndex = -1;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photograph');
    box.innerHTML =
        '<div class="lb__glow" aria-hidden="true"></div>' +
        '<div class="lb__top">' +
        '<p class="lb__count mono"><b></b><i></i><span></span></p>' +
        '<div class="lb__tools">' +
        `<button class="lb__btn" type="button" data-lb="play" aria-pressed="false" aria-label="Slideshow">${ICON.play}</button>` +
        `<button class="lb__btn" type="button" data-lb="info" aria-pressed="false" aria-label="Details">${ICON.info}</button>` +
        `<button class="lb__btn lb__btn--full" type="button" data-lb="full" aria-label="Fullscreen">${ICON.full}</button>` +
        `<button class="lb__btn lb__btn--close" type="button" data-lb="close" aria-label="Close">${ICON.close}</button>` +
        '</div></div>' +
        '<div class="lb__stage">' +
        `<button class="lb__nav lb__nav--prev" type="button" data-lb="prev" aria-label="Previous photograph">${ICON.prev}</button>` +
        '<div class="lb__frame"><button class="lb__zoom" type="button" aria-label="Zoom"><img alt="" draggable="false"></button></div>' +
        `<button class="lb__nav lb__nav--next" type="button" data-lb="next" aria-label="Next photograph">${ICON.next}</button>` +
        '</div>' +
        '<aside class="lb__info" aria-label="Details" hidden></aside>' +
        '<div class="lb__bottom"><div class="lb__strip"></div></div>';
    document.body.appendChild(box);

    const q = <T extends HTMLElement = HTMLElement>(sel: string) => box.querySelector(sel) as T;
    const frameEl = q('.lb__frame');
    const zoom = q('.lb__zoom');
    const stage = q('.lb__stage');
    const infoEl = q('.lb__info');
    const playBtn = q('[data-lb="play"]');

    const setInert = (on: boolean) => {
        for (const c of Array.from(document.body.children)) {
            if (c === box || c.classList.contains('toast')) continue;
            (c as HTMLElement).inert = on;
        }
    };

    function origin(e: PointerEvent | MouseEvent) {
        const r = zoom.getBoundingClientRect();
        if (!r.width) return;
        const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
        zoom.style.setProperty('--ox', (px * 100).toFixed(1) + '%');
        zoom.style.setProperty('--oy', (py * 100).toFixed(1) + '%');
    }

    function copy(hex: string) {
        const ok = () => toast(hex + ' copied', { ms: 1800 });
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(hex).then(ok, ok);
        else ok();
    }

    function toggleFull() {
        try {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void root.requestFullscreen?.();
        } catch {}
    }

    function setInfo(on: boolean) {
        info = on;
        infoEl.hidden = !on;
        q('[data-lb="info"]').setAttribute('aria-pressed', String(on));
        box.classList.toggle('has-info', on);
    }

    function setPlay(on: boolean) {
        playing = on;
        clearTimeout(playTimer);
        playBtn.setAttribute('aria-pressed', String(on));
        playBtn.innerHTML = on ? ICON.pause : ICON.play;
        box.querySelector('.lb__progress')?.remove();
        if (!on) return;
        const bar = el('i', 'lb__progress');
        bar.style.animationDuration = SLIDE_MS + 'ms';
        box.appendChild(bar);
        playTimer = scope.timeout(() => step(1), SLIDE_MS);
    }

    function step(d: number) {
        if (list.length) go((i + d + list.length) % list.length, d);
    }

    function go(next: number, dir: number) {
        i = next;
        box.classList.remove('is-zoom');
        render(dir || 1);
        setHash('p', list[i].id);
        if (playing) setPlay(true);
    }

    const row = (k: string, v: string | null | undefined) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '');

    function render(dir: number) {
        const p = list[i];
        if (!p) return;
        box.style.setProperty('--lbc', p.color);
        q('.lb__count b').textContent = pad(i + 1);
        q('.lb__count i').textContent = ' / ' + pad(list.length);
        q('.lb__count span').textContent = setTitle(p.set);

        /* where the frame is right now (mid-morph included), so the next shape grows out of it */
        const first = dir && motion() && !document.hidden ? frameEl.getBoundingClientRect() : null;
        frameEl.style.setProperty('--r', (p.w / p.h).toFixed(4));
        frameEl.style.backgroundImage = `url(${p.lqip})`;
        frameEl.style.backgroundColor = p.color;

        /* a fresh <img> each time, so a slow load never shows the previous picture */
        const old = zoom.querySelector('img:not(.lb__ghost)') as HTMLImageElement;
        const im = new Image();
        im.alt = alt(p);
        im.draggable = false;
        im.decoding = 'async';
        im.onload = () => im.classList.add('is-loaded');
        im.sizes = '(max-width:900px) 100vw, 80vw';
        im.srcset = photoSrcSet(p);
        im.src = src(p, 1600);
        if (im.complete && im.naturalWidth) im.classList.add('is-loaded');
        zoom.replaceChild(im, old);

        zoom.querySelectorAll('.lb__ghost').forEach((g) => g.remove());
        frameEl.getAnimations().forEach((a) => a.cancel());
        clearTimeout(morphTimer);
        frameEl.classList.remove('is-morph');
        if (first && first.width) {
            const end = frameEl.getBoundingClientRect();
            old.className = 'lb__ghost';
            old.alt = '';
            old.onload = null;
            zoom.appendChild(old);
            frameEl.classList.add('is-morph');
            frameEl.animate(
                [
                    { width: first.width + 'px', height: first.height + 'px' },
                    { width: end.width + 'px', height: end.height + 'px' },
                ],
                { duration: MORPH_MS, easing: MORPH_EASE },
            );
            old.animate(
                [
                    { opacity: 1, transform: 'none' },
                    { opacity: 0, transform: `translate3d(${-dir * 3}%,0,0) scale(1.02)` },
                ],
                { duration: MORPH_MS * 0.62, easing: 'cubic-bezier(.3,0,.6,.4)', fill: 'forwards' },
            );
            im.animate([{ transform: `translate3d(${dir * 4}%,0,0) scale(1.05)` }, { transform: 'none' }], {
                duration: MORPH_MS,
                easing: MORPH_EASE,
            });
            morphTimer = scope.timeout(() => {
                old.remove();
                frameEl.classList.remove('is-morph');
            }, MORPH_MS + 60);
        }

        const x = p.exif || {};
        const exposure = [x.focal, x.aperture, x.shutter, x.iso ? 'ISO ' + x.iso : ''].filter(Boolean).join(' · ');
        infoEl.innerHTML =
            `<p class="lb__no mono">No. ${pad(numberOf(p))}</p>` +
            `<h3>${esc(p.title || setTitle(p.set))}</h3>` +
            '<dl class="lb__meta mono">' +
            row('Set', esc(setTitle(p.set))) +
            row('Date', photoDate(p)) +
            row('Place', p.location ? esc(p.location) : '') +
            row('Camera', x.camera ? esc(x.camera) : '') +
            row('Lens', x.lens ? esc(x.lens) : '') +
            row('Exposure', exposure) +
            row('Size', `${p.w} × ${p.h}`) +
            '</dl><div class="lb__palette">' +
            p.palette
                .map(
                    (c) =>
                        `<button type="button" class="mono" data-lb="copy" data-hex="${c}" style="--sw:${c}" aria-label="Copy ${c}"><i></i>${c.replace('#', '')}</button>`,
                )
                .join('') +
            '</div>';

        /* thumbnail strip: a window around the current photograph */
        const n = list.length;
        const half = Math.min(7, Math.floor((n - 1) / 2));
        let html = '';
        for (let k = -half; k <= half; k++) {
            const j = (i + k + n) % n;
            const t = list[j];
            html += `<button type="button" data-lb="go" data-i="${j}"${k === 0 ? ' aria-current="true"' : ''} aria-label="Photograph ${j + 1}" style="background-color:${t.color};background-image:url(${src(t, 0)})"></button>`;
        }
        q('.lb__strip').innerHTML = html;

        /* warm the neighbours */
        for (const d of [1, -1]) {
            const t = list[(i + d + n) % n];
            if (t) new Image().src = src(t, 1600);
        }
    }

    /** The thumbnail on the page for a photograph, if one is on screen: the morph's other end. */
    function thumbFor(id: string) {
        for (const t of Array.from(document.querySelectorAll<HTMLElement>(`[data-pid="${id}"]`))) {
            const r = t.getBoundingClientRect();
            if (r.width > 8 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && !box.contains(t)) return t;
        }
        return null;
    }

    function morph(from: HTMLElement | null, to: HTMLElement | null, change: () => void) {
        if (!motion() || !document.startViewTransition || (!from && !to)) return change();
        if (from) from.style.viewTransitionName = 'ph-active';
        const clean = () => {
            if (to) to.style.viewTransitionName = '';
            if (from) from.style.viewTransitionName = '';
        };
        try {
            const vt = document.startViewTransition(() => {
                if (from) from.style.viewTransitionName = '';
                change();
                if (to) to.style.viewTransitionName = 'ph-active';
            });
            vt.ready.catch(() => {});
            vt.updateCallbackDone.catch(() => {});
            vt.finished.then(clean, clean);
        } catch {
            clean();
            change();
        }
    }

    function show(id: string, originEl: HTMLElement | null) {
        list = getList().slice();
        i = list.findIndex((p) => p.id === id);
        if (i < 0) return false;
        last = document.activeElement;
        const from = originEl?.isConnected ? originEl : thumbFor(id);
        frameEl.style.viewTransitionName = 'none';
        morph(from, frameEl, () => {
            render(0);
            box.hidden = false;
            open = true;
            root.classList.add('lb-open');
            setInert(true);
            box.focus({ preventScroll: true });
        });
        return true;
    }

    function hide() {
        if (!open) return;
        const id = list[i]?.id ?? null;
        setPlay(false);
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        /* the page has to be live again before its thumbnail can be found */
        setInert(false);
        const to = id ? thumbFor(id) : null;
        morph(to ? frameEl : null, to, () => {
            box.hidden = true;
            box.classList.remove('is-zoom');
            open = false;
            root.classList.remove('lb-open');
            setInert(false);
        });
        const back = (to?.closest('a,button,[tabindex]') as HTMLElement | null) ?? (last as HTMLElement | null);
        if (back?.isConnected) back.focus({ preventScroll: true });
        api.onClose?.(id);
    }

    /* the address decides: #p=<id> means open on that photograph, no p means closed */
    function sync() {
        const id = readHash().p;
        if (id && getList().some((p) => p.id === id)) {
            if (!open) show(id, null);
            else if (list[i].id !== id) {
                const j = list.findIndex((p) => p.id === id);
                if (j >= 0) {
                    i = j;
                    render(1);
                }
            }
        } else if (open) hide();
    }

    const api: Viewer = {
        onClose: null,
        isOpen: () => open,
        open(id, originEl) {
            if (open) return;
            const o = readHash();
            o.p = id;
            pushed = false;
            try {
                history.pushState(null, '', hashOf(o));
                pushed = true;
            } catch {}
            show(id, originEl ?? null);
        },
        close() {
            if (!open) return;
            if (pushed) {
                pushed = false;
                history.back(); /* popstate -> sync -> hide */
            } else {
                setHash('p', null);
                hide();
            }
        },
    };

    scope.on(box, 'click', (e: MouseEvent) => {
        const t = e.target as Element;
        const b = t.closest<HTMLElement>('[data-lb]');
        if (b) {
            const a = b.dataset.lb;
            if (a === 'close') api.close();
            else if (a === 'prev') step(-1);
            else if (a === 'next') step(1);
            else if (a === 'play') setPlay(!playing);
            else if (a === 'info') setInfo(!info);
            else if (a === 'full') toggleFull();
            else if (a === 'go') go(Number(b.dataset.i), Number(b.dataset.i) > i ? 1 : -1);
            else if (a === 'copy') copy(b.dataset.hex || '');
            return;
        }
        if (t.closest('.lb__zoom') && !swiped) {
            origin(e);
            box.classList.toggle('is-zoom');
            if (box.classList.contains('is-zoom')) setPlay(false);
        }
    });

    /* swipe to travel, pull down to close, and pan while zoomed */
    let sx = 0,
        sy = 0,
        down = false;
    scope.on(stage, 'pointerdown', (e: PointerEvent) => {
        down = true;
        swiped = false;
        sx = e.clientX;
        sy = e.clientY;
    });
    scope.on(stage, 'pointermove', (e: PointerEvent) => {
        if (box.classList.contains('is-zoom')) origin(e);
    });
    scope.on(stage, 'pointerup', (e: PointerEvent) => {
        if (!down) return;
        down = false;
        if (box.classList.contains('is-zoom')) return;
        const dx = e.clientX - sx,
            dy = e.clientY - sy;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            swiped = true;
            step(dx < 0 ? 1 : -1);
        } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
            swiped = true;
            api.close();
        }
    });
    scope.on(stage, 'pointercancel', () => {
        down = false;
    });

    scope.on(document, 'keydown', (e: KeyboardEvent) => {
        if (!open || e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key;
        if (k === 'Escape') {
            e.preventDefault();
            if (box.classList.contains('is-zoom')) box.classList.remove('is-zoom');
            else api.close();
        } else if (k === 'ArrowRight') {
            e.preventDefault();
            step(1);
        } else if (k === 'ArrowLeft') {
            e.preventDefault();
            step(-1);
        } else if (k === ' ' && !(e.target instanceof Element && e.target.closest('button'))) {
            e.preventDefault();
            setPlay(!playing);
        } else if (k === 'i' || k === 'I') setInfo(!info);
        else if (k === 'f' || k === 'F') toggleFull();
    });

    scope.on(window, 'popstate', sync);
    scope.on(window, 'hashchange', sync);

    /* leaving the page with the viewer open must not leave the rest of the site inert */
    scope.add(() => {
        clearTimeout(playTimer);
        clearTimeout(morphTimer);
        frameEl.getAnimations().forEach((a) => a.cancel());
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
        setInert(false);
        root.classList.remove('lb-open');
        box.remove();
        open = false;
    });

    sync();
    return api;
}
