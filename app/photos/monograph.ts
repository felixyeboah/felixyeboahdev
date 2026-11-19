/* =====================================================================
   Photographs: the book ("Monograph").
   A cover, then one archive in three views:
     Plates    one photograph at a time, a chapter card per set, a scrubber and autoplay
     Contents  the table of contents; a plate there jumps to it in Plates
     Columns   columns travelling in opposite directions (columns.ts)
   mountMonograph() binds to the markup book.tsx renders and returns a cleanup. View and plate are
   kept in the hash (#view=columns, #n=14); the viewer owns #p=<id>.
   ===================================================================== */
import { type Photo, type PhotoSet, photoDate } from '@/lib/site/photos';

import { mountColumns } from './columns';
import { type Cleanup, ICON, clamp, createScope, el, frame, getHash, motion, mountCursor, pad, roman, setHash, src, titles } from './kit';
import { createViewer } from './viewer';

type View = 'plates' | 'contents' | 'columns';
type Chapter = { type: 'ch'; set: PhotoSet; roman: string; count: number; lead: Photo };
type Plate = { type: 'p'; p: Photo; k: number };
type Step = Chapter | Plate;

const VIEWS: View[] = ['plates', 'contents', 'columns'];
const AUTO_MS = 5200;

export function mountMonograph(root: HTMLElement, photos: Photo[], sets: PhotoSet[]): Cleanup {
    const scope = createScope();
    const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector(sel) as T;
    const setTitle = titles(sets);

    /* ------------------------------------------------------------------ the book's order */
    const list: Photo[] = []; /* photographs in book order */
    const steps: Step[] = []; /* chapter cards and plates, in the order you page through them */
    sets.forEach((s, si) => {
        const ps = photos.filter((p) => p.set === s.id);
        if (!ps.length) return;
        steps.push({ type: 'ch', set: s, roman: roman(si + 1), count: ps.length, lead: ps[0] });
        for (const p of ps) {
            list.push(p);
            steps.push({ type: 'p', p, k: list.length });
        }
    });
    const numbers = new Map(list.map((p, i) => [p.id, i + 1]));
    const numberOf = (p: Photo) => numbers.get(p.id) ?? 0;
    const alt = (p: Photo) => p.title || `${setTitle(p.set)}, photograph ${pad(numberOf(p))}`;
    const stepOf = (id: string | null) => steps.findIndex((s) => s.type === 'p' && s.p.id === id);
    const lens = list.length > 99 ? 3 : 2;

    let view = (getHash('view') || 'plates') as View;
    if (!VIEWS.includes(view)) view = 'plates';
    let cur = clamp((parseInt(getHash('n') || '', 10) || 1) - 1, 0, Math.max(0, steps.length - 1));

    const viewer = createViewer({ scope, list: () => list, setTitle, numberOf });
    viewer.onClose = (id) => {
        if (view !== 'plates') return;
        const i = stepOf(id);
        if (i >= 0 && i !== cur) go(i, i > cur ? 1 : -1, true);
    };
    mountCursor(scope, viewer.isOpen);

    /* ------------------------------------------------------------------ cover */
    const cvPlate = $('#cvPlate');
    const lead = list.find((p) => p.w > p.h) || list[0];
    if (lead) {
        cvPlate.hidden = false;
        cvPlate.style.setProperty('--r', (lead.w / lead.h).toFixed(4));
        cvPlate.dataset.pid = lead.id;
        cvPlate.setAttribute('aria-label', alt(lead));
        cvPlate.appendChild(frame(lead, { eager: true, min: 960, sizes: '(max-width:820px) 62vw, 34vw' }));
        scope.on(cvPlate, 'click', () => viewer.open(lead.id, cvPlate));
        scope.add(() => cvPlate.replaceChildren());
    }

    /* ------------------------------------------------------------------ elements */
    const book = $('#book');
    const viewsEl = $('#views');
    const sections: Record<View, HTMLElement> = { plates: $('#plates'), contents: $('#contents'), columns: $('#columns') };
    const stage = sections.plates;
    const sheet = $('#sheet');
    const live = $('#live');
    const countEl = $('#count');
    const prevB = $<HTMLButtonElement>('#prev');
    const nextB = $<HTMLButtonElement>('#next');
    const autoB = $<HTMLButtonElement>('#auto');
    const scrub = $('#scrub');
    const track = $('#track');
    const fill = $('#fill');
    const knob = $('#knob');
    const tip = $('#tip');
    prevB.innerHTML = ICON.prev;
    nextB.innerHTML = ICON.next;
    autoB.innerHTML = ICON.play;
    autoB.hidden = !motion();

    let colsOff: Cleanup | null = null;
    scope.add(() => {
        colsOff?.();
        sheet.replaceChildren();
        sections.contents.replaceChildren();
        track.querySelectorAll('.tk,.scrub__auto').forEach((t) => t.remove());
    });

    const press = (v: View) => {
        for (const b of Array.from(viewsEl.children)) b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v));
    };

    function show(swap: boolean) {
        press(view);
        colsOff?.();
        colsOff = null;
        for (const v of VIEWS) sections[v].hidden = v !== view;
        if (view === 'plates') {
            buildScrub();
            renderSlide(1, !swap);
        } else if (view === 'contents') renderContents();
        else colsOff = mountColumns(sections.columns, list, { setTitle, numberOf, viewer });
        if (swap) {
            const s = sections[view];
            s.classList.remove('is-swap');
            void s.offsetWidth;
            s.classList.add('is-swap');
            toBook();
        }
    }

    /* bring the book to the top of the window when a control is used from further down the page */
    function toBook() {
        const pinned = view !== 'contents';
        const top = (view === 'plates' ? stage : book).getBoundingClientRect().top;
        if (top < 0 || pinned) window.scrollTo({ top: window.scrollY + top - (pinned ? 0 : 70), behavior: 'instant' });
    }

    scope.on(viewsEl, 'click', (e: MouseEvent) => {
        const v = (e.target as Element).closest('button')?.getAttribute('data-v') as View | null;
        if (!v || v === view) return;
        view = v;
        setHash('view', v === 'plates' ? null : v);
        stopAuto();
        show(true);
    });

    /* ------------------------------------------------------------------ plates */
    const digits = (n: number) =>
        pad(n, lens)
            .split('')
            .map((d, i) => `<span class="dg" style="--i:${i}"><b>${d}</b></span>`)
            .join('');

    function buildSlide(st: Step) {
        if (st.type === 'ch') {
            const a = el('article', 'sl sl--ch');
            const bg = el('div', 'sl__bg wipe');
            bg.appendChild(frame(st.lead, { eager: true, min: 1600, sizes: '100vw' }));
            a.appendChild(bg);
            a.appendChild(
                el(
                    'div',
                    'sl__chin',
                    `<p class="ch__num">${st.roman}</p><span class="ch__rule" aria-hidden="true"></span>` +
                        `<h2 class="ch__title"><i>${st.set.title}</i></h2>` +
                        `<p class="ch__count mono">${pad(st.count)} Plates</p>`,
                ),
            );
            return a;
        }
        const p = st.p,
            r = p.w / p.h,
            x = p.exif || {};
        const a = el('article', `sl sl--p ${st.k % 2 ? 'sl--left' : 'sl--right'} ${r < 1 ? 'sl--port' : 'sl--land'}`);
        const b = el('button', 'sl__ph wipe');
        b.type = 'button';
        b.style.setProperty('--r', r.toFixed(4));
        b.dataset.pid = p.id;
        b.dataset.cur = 'View';
        b.setAttribute('aria-label', alt(p));
        b.appendChild(frame(p, { eager: true, min: 1600, sizes: r < 1 ? '(max-width:820px) 90vw, 40vw' : '(max-width:820px) 92vw, 56vw' }));
        a.appendChild(b);
        const caption = [p.title, p.location].filter(Boolean).join(' · ');
        const camera = [x.camera, x.lens].filter(Boolean).join(' · ');
        const exposure = [x.aperture, x.shutter, x.iso ? 'ISO ' + x.iso : ''].filter(Boolean).join(' · ');
        a.appendChild(
            el(
                'div',
                'sl__col',
                `<p class="sl__no"><span class="sl__digits" aria-hidden="true">${digits(st.k)}</span>` +
                    `<span class="mono">/ ${pad(list.length, lens)}</span></p>` +
                    `<h2 class="sl__set">${setTitle(p.set)}</h2>` +
                    `<p class="sl__meta mono">${[caption, photoDate(p), camera, exposure]
                        .filter(Boolean)
                        .map((t) => `<span>${t}</span>`)
                        .join('')}</p>`,
            ),
        );
        return a;
    }

    /* The new page is inserted in its "entering" state and released on the same tick, so CSS carries the
       motion and nothing waits on a frame callback. Timers only tidy up the page that left. */
    function renderSlide(dir: number, cut: boolean) {
        const st = steps[cur];
        const old = Array.from(sheet.querySelectorAll<HTMLElement>('.sl'));
        if (!st) {
            old.forEach((o) => o.remove());
            return;
        }
        const a = buildSlide(st);
        a.dataset.dir = String(dir);
        if (motion() && !cut) {
            a.classList.add('is-enter');
            sheet.appendChild(a);
            void a.offsetWidth;
            a.classList.remove('is-enter');
            for (const o of old) {
                o.dataset.dir = String(dir);
                o.classList.add('is-leave');
                o.inert = true;
                o.querySelector('[data-pid]')?.removeAttribute('data-pid');
                scope.timeout(() => o.remove(), 1300);
            }
        } else {
            old.forEach((o) => o.remove());
            sheet.appendChild(a);
        }
        stage.style.setProperty('--tint', st.type === 'p' ? st.p.color : st.lead.color);
        prevB.disabled = cur <= 0;
        nextB.disabled = cur >= steps.length - 1;
        countEl.innerHTML = `<b>${st.type === 'p' ? pad(st.k) : st.roman}</b> / ${pad(list.length)}`;
        live.textContent = st.type === 'p' ? `Plate ${st.k} of ${list.length}, ${setTitle(st.p.set)}` : `Chapter ${st.roman}, ${st.set.title}`;
        placeScrub();
        /* warm the neighbours */
        for (const i of [cur + 1, cur - 1]) {
            const s = steps[i];
            if (s) new Image().src = src(s.type === 'p' ? s.p : s.lead, 1600);
        }
    }

    function go(i: number, dir = 0, cut = false) {
        i = clamp(i, 0, steps.length - 1);
        if (i === cur) return;
        dir = dir || (i > cur ? 1 : -1);
        cur = i;
        setHash('n', cur ? String(cur + 1) : null);
        renderSlide(dir, cut);
    }
    const canStep = (d: number) => (d > 0 ? cur < steps.length - 1 : cur > 0);
    function step(d: number) {
        if (canStep(d)) go(cur + d, d);
    }

    scope.on(prevB, 'click', () => step(-1));
    scope.on(nextB, 'click', () => step(1));

    /* the stage counts as "the page you are on" while it fills most of the window */
    function engaged() {
        if (view !== 'plates') return false;
        const r = stage.getBoundingClientRect();
        return r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.6;
    }
    function snap() {
        const top = stage.getBoundingClientRect().top;
        if (Math.abs(top) > 2) window.scrollTo({ top: window.scrollY + top, behavior: motion() ? 'smooth' : 'instant' });
    }

    /* Wheel: one plate per gesture. A gesture that begins on the stage turns the page; one that arrives from
       outside is caught and pinned. At the first and last plate the page simply scrolls on. */
    let lastWheel = 0,
        lastStep = 0,
        gStepped = false,
        gInside = false;
    scope.on(
        window,
        'wheel',
        (e: WheelEvent) => {
            if (view !== 'plates' || viewer.isOpen() || e.ctrlKey) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            const now = performance.now(),
                same = now - lastWheel < 170,
                on = engaged();
            lastWheel = now;
            if (!same) {
                gStepped = false;
                gInside = on;
            }
            if (!on) return;
            const d = e.deltaY > 0 ? 1 : -1,
                can = canStep(d);
            stopAuto();
            if (gStepped) {
                /* the tail of a gesture that already turned a page */
                if (can || now - lastStep < 900) e.preventDefault();
                if (!(can && now - lastStep > 1150 && Math.abs(e.deltaY) > 40)) return;
            } else if (!gInside) {
                /* scrolled in from the cover or the footer: settle on the stage first */
                if (!can) return;
                e.preventDefault();
                snap();
                gStepped = true;
                lastStep = now;
                return;
            }
            if (!can) return;
            e.preventDefault();
            if (Math.abs(e.deltaY) < 3) return;
            snap();
            step(d);
            gStepped = true;
            lastStep = now;
        },
        { passive: false },
    );

    scope.on(document, 'keydown', (e: KeyboardEvent) => {
        if (view !== 'plates' || viewer.isOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target as Element | null;
        if (t?.closest?.('input,textarea,select')) return;
        if (t !== autoB) stopAuto();
        const k = e.key;
        if (t === scrub && (k === 'Home' || k === 'End')) {
            e.preventDefault();
            go(k === 'Home' ? 0 : steps.length - 1);
            return;
        }
        let d = 0;
        if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown') d = 1;
        else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') d = -1;
        /* at the ends the keys scroll the page as usual */
        if (!d || !engaged() || !canStep(d)) return;
        e.preventDefault();
        if (k !== 'ArrowLeft' && k !== 'ArrowRight') snap();
        step(d);
    });

    /* swipe (and mouse drag) sideways to turn the page; vertical touch movement belongs to the page */
    let sx = 0,
        sy = 0,
        sDown = false,
        swiped = false;
    scope.on(stage, 'pointerdown', (e: PointerEvent) => {
        if ((e.target as Element).closest('.pl__hud')) return;
        sDown = true;
        swiped = false;
        sx = e.clientX;
        sy = e.clientY;
    });
    scope.on(window, 'pointerup', (e: PointerEvent) => {
        if (!sDown) return;
        sDown = false;
        const dx = e.clientX - sx,
            dy = e.clientY - sy;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            swiped = true;
            step(dx < 0 ? 1 : -1);
            /* the click that follows this pointerup is the only one to swallow */
            scope.timeout(() => {
                swiped = false;
            }, 0);
        }
    });
    scope.on(window, 'pointercancel', () => {
        sDown = false;
    });
    scope.on(sheet, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest<HTMLElement>('[data-pid]');
        if (b && !swiped) viewer.open(b.dataset.pid as string, b);
    });

    /* ------------------------------------------------------------------ scrubber */
    const frac = (i: number) => (steps.length > 1 ? i / (steps.length - 1) : 0);
    const label = (s: Step) => (s.type === 'p' ? `Plate ${s.k}, ${setTitle(s.p.set)}` : `Chapter ${s.roman}, ${s.set.title}`);

    function buildScrub() {
        track.querySelectorAll('.tk').forEach((t) => t.remove());
        steps.forEach((s, i) => {
            const t = el('i', 'tk' + (s.type === 'ch' ? ' tk--ch' : ''), s.type === 'ch' ? `<em>${s.roman}</em>` : '');
            t.style.left = (frac(i) * 100).toFixed(3) + '%';
            track.insertBefore(t, fill);
        });
        scrub.setAttribute('aria-valuemax', String(Math.max(1, steps.length)));
    }
    function placeScrub() {
        const f = frac(cur);
        fill.style.transform = `scaleX(${f.toFixed(4)})`;
        knob.style.left = (f * 100).toFixed(3) + '%';
        scrub.setAttribute('aria-valuenow', String(cur + 1));
        if (steps[cur]) scrub.setAttribute('aria-valuetext', label(steps[cur]));
    }
    function indexAt(x: number) {
        const r = track.getBoundingClientRect();
        return Math.round(clamp((x - r.left) / (r.width || 1), 0, 1) * (steps.length - 1));
    }
    function showTip(x: number) {
        const i = indexAt(x),
            s = steps[i];
        if (!s) return;
        const r = track.getBoundingClientRect();
        tip.hidden = false;
        tip.style.left = clamp(frac(i) * r.width, 48, Math.max(48, r.width - 48)) + 'px';
        const url = src(s.type === 'p' ? s.p : s.lead, 0);
        const im = tip.querySelector('img') as HTMLImageElement;
        if (im.getAttribute('src') !== url) im.src = url;
        (tip.querySelector('span') as HTMLElement).textContent = s.type === 'p' ? `${pad(s.k)} · ${setTitle(s.p.set)}` : `${s.roman} · ${s.set.title}`;
    }
    let dragging = false;
    scope.on(scrub, 'pointerdown', (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        stopAuto();
        try {
            scrub.setPointerCapture(e.pointerId);
        } catch {}
        go(indexAt(e.clientX));
        showTip(e.clientX);
    });
    scope.on(scrub, 'pointermove', (e: PointerEvent) => {
        if (dragging) {
            scrub.classList.add('is-drag');
            go(indexAt(e.clientX), 0, true);
        }
        if (dragging || e.pointerType === 'mouse') showTip(e.clientX);
    });
    const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        scrub.classList.remove('is-drag');
        if (!scrub.matches(':hover')) tip.hidden = true;
    };
    scope.on(scrub, 'pointerup', endDrag);
    scope.on(scrub, 'pointercancel', endDrag);
    scope.on(scrub, 'pointerleave', () => {
        if (!dragging) tip.hidden = true;
    });

    /* ------------------------------------------------------------------ autoplay */
    let auto = false,
        autoT = 0;
    function autoBar(on: boolean) {
        track.querySelector('.scrub__auto')?.remove();
        if (!on) return;
        const u = el('u', 'scrub__auto');
        u.style.animationDuration = AUTO_MS + 'ms';
        track.appendChild(u);
    }
    function schedule() {
        clearTimeout(autoT);
        autoBar(true);
        autoT = scope.timeout(() => {
            if (!auto) return;
            if (!viewer.isOpen() && !document.hidden && view === 'plates') {
                if (cur >= steps.length - 1) return stopAuto();
                go(cur + 1, 1);
            }
            schedule();
        }, AUTO_MS);
    }
    function setAuto(on: boolean) {
        auto = on && motion();
        clearTimeout(autoT);
        autoB.setAttribute('aria-pressed', String(auto));
        autoB.innerHTML = auto ? ICON.pause : ICON.play;
        if (auto) {
            if (cur >= steps.length - 1) go(0, -1);
            toBook();
            schedule();
        } else autoBar(false);
    }
    function stopAuto() {
        if (auto) setAuto(false);
    }
    scope.on(autoB, 'click', () => setAuto(!auto));
    scope.on(document, 'pointerdown', (e: PointerEvent) => {
        if (auto && !(e.target as Element).closest?.('#auto')) stopAuto();
    });
    scope.on(window, 'touchmove', stopAuto, { passive: true });
    scope.add(() => clearTimeout(autoT));

    /* ------------------------------------------------------------------ contents */
    function renderContents() {
        const host = sections.contents;
        host.innerHTML = '<h2 class="toc__head">Contents</h2>';
        steps.forEach((s, i) => {
            if (s.type !== 'ch') return;
            const rowEl = el('div', 'toc__ch');
            const left = el(
                'div',
                '',
                `<p class="toc__num">${s.roman}</p>` +
                    `<button class="toc__title" type="button" data-step="${i}">${s.set.title}</button>` +
                    `<p class="toc__n mono">${pad(s.count)} Plates</p>`,
            );
            const grid = el('div', 'toc__grid');
            for (let j = i + 1; j < steps.length; j++) {
                const st = steps[j];
                if (st.type !== 'p') break;
                const b = el('button', 'tp');
                b.type = 'button';
                b.dataset.step = String(j);
                b.setAttribute('aria-label', label(st));
                const im = el('span', 'tp__im');
                im.dataset.pid = st.p.id;
                im.appendChild(frame(st.p, { min: 480, sizes: '112px' }));
                b.append(im, el('span', 'tp__n mono', pad(st.k)));
                grid.appendChild(b);
            }
            rowEl.append(left, grid);
            host.appendChild(rowEl);
        });
    }
    scope.on(sections.contents, 'click', (e: MouseEvent) => {
        const b = (e.target as Element).closest<HTMLElement>('[data-step]');
        if (!b) return;
        cur = clamp(Number(b.dataset.step), 0, steps.length - 1);
        setHash('n', cur ? String(cur + 1) : null);
        view = 'plates';
        setHash('view', null);
        press('plates');
        for (const v of VIEWS) sections[v].hidden = v !== 'plates';
        sheet.replaceChildren();
        buildScrub();
        toBook();
        renderSlide(1, false);
        stage.focus({ preventScroll: true });
    });

    show(false);
    return scope.dispose;
}
