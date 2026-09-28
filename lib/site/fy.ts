/* =====================================================================
   Shared site behaviour ("Dark Studio"), ported from design-options/site/assets/site.js.
   ---------------------------------------------------------------------
   The static prototype bound everything once on DOMContentLoaded. Here the root layout's
   <SiteRuntime> calls initPage() after every client navigation and runs the returned cleanup
   before the next one, so each page gets a fresh binding and nothing double-binds.

   Page options are read from <main id="main">:
     data-spy        (landing) light up [data-nav=KEY] while [data-spy-target=KEY] is in view
     data-fy-skip    space-separated features NOT to run: "reveal magnetic peek copy clock"

   Declarative hooks (no page JS needed):
     [data-clock]         live Accra time (HH:MM), refreshed every 10s
     [data-year]          current year
     [data-copy="text"]   copies text; label -> "Copied"; toast (data-copy-toast overrides the message)
     [data-reveal]        fade/rise in on scroll; style="--d:120ms" delays it. Inside .hero, .pagehead
                          or [data-instant] it reveals on load.
     [data-stagger]       auto --d on direct [data-reveal] children (70ms steps)
     [data-count="60000"]  counts up when its [data-reveal] ancestor enters
     .magnetic            pulls toward the pointer (fine pointers only)
     .arch + img.arch__peek   rows with data-img show a floating preview on hover

   Imperative API for page components: toast(), copy(), reveal(scope), splitWords(el).
   ===================================================================== */

export const EMAIL = 'me@felixyeboah.dev';
export const LINKS = {
    email: `mailto:${EMAIL}`,
    github: 'https://github.com/felixyeboah',
    x: 'https://x.com/sudocode_',
};

const motion = () => document.documentElement.classList.contains('motion');
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------- toast ---------------- */
let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string, opts: { tone?: 'error'; ms?: number } = {}) {
    if (!toastEl || !toastEl.isConnected) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
    }
    const el = toastEl;
    el.textContent = msg;
    if (opts.tone) el.setAttribute('data-tone', opts.tone);
    else el.removeAttribute('data-tone');
    el.classList.remove('is-on');
    void el.offsetWidth;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), opts.ms || 2400);
}

/* ---------------- clipboard ---------------- */
function legacyCopy(text: string) {
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}
export function copy(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(
            () => true,
            () => legacyCopy(text),
        );
    }
    return Promise.resolve(legacyCopy(text));
}

/* ---------------- headline word split ---------------- */
export function splitWords(el: HTMLElement | null) {
    if (!el || el.classList.contains('is-split')) return;
    let i = 0;
    const walk = (node: Node) => {
        Array.from(node.childNodes).forEach((n) => {
            if (n.nodeType === 3) {
                const frag = document.createDocumentFragment();
                (n.textContent || '').split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(' '));
                        return;
                    }
                    const w = document.createElement('span');
                    w.className = 'w';
                    const inner = document.createElement('span');
                    inner.textContent = part;
                    inner.style.setProperty('--i', String(i++));
                    w.appendChild(inner);
                    frag.appendChild(w);
                });
                node.replaceChild(frag, n);
            } else if (n.nodeType === 1) walk(n);
        });
    };
    walk(el);
    el.setAttribute('aria-label', (el.textContent || '').replace(/\s+/g, ' ').trim());
    el.classList.add('is-split');
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
}

/* ---------------- reveal ---------------- */
function count(el: Element) {
    const to = parseInt(el.getAttribute('data-count') || '', 10);
    if (isNaN(to)) return;
    let start: number | null = null;
    const dur = 1600;
    const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}
function show(el: Element) {
    el.classList.add('is-in');
    if (motion()) el.querySelectorAll('[data-count]').forEach(count);
}
function stagger(scope: ParentNode) {
    scope.querySelectorAll('[data-stagger]').forEach((group) => {
        Array.from(group.children).forEach((el, idx) => {
            const h = el as HTMLElement;
            if (h.hasAttribute('data-reveal') && !h.style.getPropertyValue('--d'))
                h.style.setProperty('--d', (idx % 6) * 70 + 'ms');
        });
    });
}

let io: IntersectionObserver | null = null;
let skipList: string[] = [];
const skip = (f: string) => skipList.includes(f);

export function reveal(scope: ParentNode = document) {
    const items = scope.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!motion() || skip('reveal')) {
        items.forEach((el) => el.classList.add('is-in'));
        return;
    }
    stagger(scope);
    if (!('IntersectionObserver' in window)) {
        items.forEach(show);
        return;
    }
    if (!io)
        io = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    show(en.target);
                    io?.unobserve(en.target);
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
        );
    items.forEach((el) => {
        if (el.closest('.hero, .pagehead, [data-instant]')) {
            requestAnimationFrame(() => show(el));
            return;
        }
        io!.observe(el);
    });
}

/* ---------------- per-page init ---------------- */
export function initPage(): () => void {
    const doc = document;
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof HTMLElementEventMap>(
        el: HTMLElement | Window | Document,
        type: K | string,
        fn: EventListener,
        opts?: AddEventListenerOptions,
    ) => {
        el.addEventListener(type, fn, opts);
        cleanups.push(() => el.removeEventListener(type, fn, opts));
    };

    const main = doc.getElementById('main');
    skipList = (main?.getAttribute('data-fy-skip') || '').split(/\s+/).filter(Boolean);

    /* clock + year */
    if (!skip('clock')) {
        let fmt: Intl.DateTimeFormat | null = null;
        try {
            fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Accra' });
        } catch {}
        const tick = () => {
            const d = new Date();
            const t = fmt
                ? fmt.format(d)
                : ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2);
            doc.querySelectorAll('[data-clock]').forEach((el) => (el.textContent = t));
        };
        tick();
        const t = setInterval(tick, 10000);
        cleanups.push(() => clearInterval(t));
    }
    doc.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));

    /* scroll-spy (landing) */
    if (main?.hasAttribute('data-spy') && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    const k = en.target.getAttribute('data-spy-target');
                    doc.querySelectorAll('.nav [data-nav]').forEach((a) => {
                        if (a.getAttribute('data-nav') === k) a.setAttribute('aria-current', 'true');
                        else if (a.getAttribute('aria-current') === 'true') a.removeAttribute('aria-current');
                    });
                });
            },
            { rootMargin: '-45% 0px -50% 0px' },
        );
        doc.querySelectorAll('[data-spy-target]').forEach((s) => spy.observe(s));
        cleanups.push(() => {
            spy.disconnect();
            /* only the spy's own marks ("true"); the nav's route marks are "page" */
            doc.querySelectorAll('.nav [data-nav][aria-current="true"]').forEach((a) => a.removeAttribute('aria-current'));
        });
    }

    /* copy-to-clipboard */
    if (!skip('copy'))
        doc.querySelectorAll<HTMLElement>('[data-copy]').forEach((b) => {
            const original = b.textContent;
            let reset: ReturnType<typeof setTimeout> | undefined;
            on(b, 'click', () => {
                const v = b.getAttribute('data-copy') || '';
                copy(v).then((ok) => {
                    if (ok) {
                        b.textContent = 'Copied';
                        b.setAttribute('data-copied', 'true');
                        toast(b.getAttribute('data-copy-toast') || (v.indexOf('@') > 0 ? 'Email copied to clipboard' : 'Copied to clipboard'));
                        clearTimeout(reset);
                        reset = setTimeout(() => {
                            b.textContent = original;
                            b.setAttribute('data-copied', 'false');
                        }, 1800);
                    } else {
                        toast('Couldn’t copy. It’s ' + v, { tone: 'error', ms: 4000 });
                    }
                });
            });
            cleanups.push(() => clearTimeout(reset));
        });

    /* archive hover preview (fine pointers only) */
    if (!skip('peek'))
        doc.querySelectorAll<HTMLElement>('.arch').forEach((arch) => {
            const peek = arch.querySelector<HTMLImageElement>('.arch__peek');
            if (!peek) return;
            if (!finePointer() || !motion()) {
                peek.style.display = 'none';
                return;
            }
            /* escape transformed ancestors so position:fixed tracks the viewport; a clone keeps React's tree intact */
            const floater = peek.cloneNode() as HTMLImageElement;
            peek.style.display = 'none';
            doc.body.appendChild(floater);
            cleanups.push(() => floater.remove());
            let activeRow: HTMLElement | null = null;
            const showPeek = () => {
                if (activeRow && floater.complete && floater.naturalWidth) floater.classList.add('on');
            };
            on(floater, 'load', showPeek);
            arch.querySelectorAll<HTMLElement>('.arch__row[data-img]').forEach((r) => {
                new Image().src = r.getAttribute('data-img')!;
                on(r, 'mouseenter', () => {
                    activeRow = r;
                    if (floater.getAttribute('src') !== r.getAttribute('data-img')) floater.src = r.getAttribute('data-img')!;
                    showPeek();
                });
                on(r, 'mouseleave', () => {
                    activeRow = null;
                    floater.classList.remove('on');
                });
                on(r, 'mousemove', ((e: MouseEvent) => {
                    floater.style.setProperty('--x', e.clientX + 28 + 'px');
                    floater.style.setProperty('--y', e.clientY - 96 + 'px');
                }) as EventListener);
            });
        });

    /* reveal on scroll */
    reveal(doc);
    cleanups.push(() => {
        io?.disconnect();
        io = null;
    });

    /* magnetic CTAs (fine pointers, motion only); the nav CTA persists across pages, so bind it once per page too */
    if (motion() && !skip('magnetic') && finePointer())
        doc.querySelectorAll<HTMLElement>('.magnetic').forEach((el) => {
            on(el, 'mousemove', ((e: MouseEvent) => {
                const r = el.getBoundingClientRect();
                el.style.transform =
                    'translate(' + (e.clientX - r.left - r.width / 2) * 0.22 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.32 + 'px)';
            }) as EventListener);
            on(el, 'mouseleave', () => (el.style.transform = ''));
            cleanups.push(() => (el.style.transform = ''));
        });

    return () => cleanups.forEach((fn) => fn());
}
