/* =====================================================================
   Shared layer for the three /photos prototypes. Loaded in <head>, after data.js.
   Everything hangs off window.PX:

   data      PX.photos, PX.sets, PX.setTitle(id), PX.byId(id), PX.byColour(a,b), PX.byRecent(a,b)
   images    PX.src(p,minWidth), PX.srcset(p), PX.full(p), PX.frame(p,{sizes,min,eager,alt,cls})
   text      PX.pad(n,len), PX.no(p), PX.year(p), PX.date(p), PX.alt(p)
   state     PX.get(key), PX.set(key,value|null)            (kept in location.hash)
   motion    PX.motion, PX.reveal(elements), PX.ready(fn)
   chrome    nav + footer + option switcher render themselves; PX.toast(msg); PX.cursor()
   lightbox  PX.lightbox.bind(getList), PX.lightbox.open(id, originEl), PX.lightbox.close(), PX.lightbox.isOpen()
   ===================================================================== */
(function () {
    'use strict';

    var D = window.PHOTO_DATA || { sets: [], photos: [] };
    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js');
    if (!reduce) root.classList.add('motion');

    var PX = (window.PX = {});
    PX.base = '/photos/';
    PX.site = 'https://felixyeboah.dev';
    PX.motion = !reduce;
    PX.sets = D.sets;
    PX.photos = D.photos;
    PX.photos.forEach(function (p, i) {
        p.n = i + 1; /* stable frame number, newest first */
    });

    var byId = {};
    PX.photos.forEach(function (p) {
        byId[p.id] = p;
    });
    PX.byId = function (id) {
        return byId[id] || null;
    };
    PX.setTitle = function (id) {
        for (var i = 0; i < PX.sets.length; i++) if (PX.sets[i].id === id) return PX.sets[i].title;
        return id;
    };

    /* ---------- images: every URL is built from the photo's own widths ---------- */
    PX.src = function (p, min) {
        var w = p.widths[p.widths.length - 1];
        for (var i = 0; i < p.widths.length; i++)
            if (p.widths[i] >= (min || 0)) {
                w = p.widths[i];
                break;
            }
        return PX.base + p.id + '-' + w + '.webp';
    };
    PX.srcset = function (p) {
        return p.widths
            .map(function (w) {
                return PX.base + p.id + '-' + w + '.webp ' + w + 'w';
            })
            .join(', ');
    };
    PX.full = function (p) {
        return PX.src(p, 1e9);
    };

    /* ---------- text ---------- */
    PX.pad = function (n, len) {
        return String(n).padStart(len || 3, '0');
    };
    PX.no = function (p) {
        return PX.pad(p.n);
    };
    PX.year = function (p) {
        return p.date ? p.date.slice(0, 4) : '';
    };
    PX.date = function (p) {
        if (!p.date) return '';
        var d = new Date(p.date + 'T00:00:00Z');
        return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    };
    PX.alt = function (p) {
        return p.title || PX.setTitle(p.set) + ', photograph ' + PX.no(p);
    };

    /* ---------- sorting ---------- */
    PX.byColour = function (a, b) {
        var ga = a.hsl[1] < 0.14,
            gb = b.hsl[1] < 0.14;
        if (ga !== gb) return ga ? 1 : -1;
        if (ga) return a.hsl[2] - b.hsl[2];
        return a.hsl[0] - b.hsl[0] || a.hsl[2] - b.hsl[2];
    };
    PX.byRecent = function (a, b) {
        return a.n - b.n;
    };

    /** One photograph: blurred placeholder under the real image, which fades in once decoded. */
    PX.frame = function (p, o) {
        o = o || {};
        var s = document.createElement('span');
        s.className = 'fr' + (o.cls ? ' ' + o.cls : '');
        s.style.backgroundColor = p.color;
        s.style.backgroundImage = 'url(' + p.lqip + ')';
        var im = new Image();
        im.alt = o.alt == null ? PX.alt(p) : o.alt;
        im.decoding = 'async';
        im.loading = o.eager ? 'eager' : 'lazy';
        im.draggable = false;
        im.width = p.w;
        im.height = p.h;
        var done = function () {
            s.classList.add('is-loaded');
        };
        im.onload = done;
        im.onerror = done;
        im.sizes = o.sizes || '50vw';
        im.srcset = PX.srcset(p);
        im.src = PX.src(p, o.min || 960);
        if (im.complete && im.naturalWidth) done();
        s.appendChild(im);
        return s;
    };

    /* ---------- state in the hash: #set=streets&view=reel&p=<id> ---------- */
    function readHash() {
        var o = {};
        location.hash
            .replace(/^#/, '')
            .split('&')
            .forEach(function (kv) {
                if (!kv) return;
                var i = kv.indexOf('=');
                if (i > 0) o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
            });
        return o;
    }
    function hashOf(o) {
        var s = Object.keys(o)
            .map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]);
            })
            .join('&');
        return s ? '#' + s : location.pathname + location.search;
    }
    PX.get = function (k) {
        var v = readHash()[k];
        return v == null ? null : v;
    };
    PX.set = function (k, v) {
        var o = readHash();
        if (v == null || v === '') delete o[k];
        else o[k] = v;
        try {
            history.replaceState(history.state, '', hashOf(o));
        } catch (e) {}
    };

    /* ---------- lifecycle ---------- */
    PX.ready = function (fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    };

    /** Adds .is-in as elements scroll into view. Fails open: no motion, no observer, or a missed callback all end visible. */
    PX.reveal = function (els, margin) {
        els = Array.prototype.slice.call(els);
        var show = function (el) {
            el.classList.add('is-in');
        };
        if (!PX.motion || !('IntersectionObserver' in window)) {
            els.forEach(show);
            return { disconnect: function () {} };
        }
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        show(en.target);
                        io.unobserve(en.target);
                    }
                });
            },
            { rootMargin: margin || '0px 0px -6% 0px' },
        );
        els.forEach(function (el) {
            io.observe(el);
        });
        setTimeout(function () {
            els.forEach(function (el) {
                if (el.classList.contains('is-in') || !el.isConnected) return;
                var r = el.getBoundingClientRect();
                if (r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) show(el);
            });
        }, 1800);
        return io;
    };

    /* ---------- toast ---------- */
    var toastEl, toastT;
    PX.toast = function (msg) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.className = 'toast';
            toastEl.setAttribute('role', 'status');
            document.body.appendChild(toastEl);
        }
        toastEl.textContent = msg;
        toastEl.classList.add('is-on');
        clearTimeout(toastT);
        toastT = setTimeout(function () {
            toastEl.classList.remove('is-on');
        }, 1800);
    };

    /* ---------- cursor label: any element with data-cur="View" ---------- */
    PX.cursor = function () {
        if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches || PX._cur) return;
        var el = (PX._cur = document.createElement('div'));
        el.className = 'pcur';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
        root.classList.add('has-cur');
        var x = 0,
            y = 0,
            tx = 0,
            ty = 0,
            raf = 0,
            on = false;
        var tick = function () {
            x += (tx - x) * 0.24;
            y += (ty - y) * 0.24;
            el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
            raf = on || Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
        };
        var sync = function (e) {
            tx = e.clientX;
            ty = e.clientY;
            var t = e.target && e.target.closest ? e.target.closest('[data-cur]') : null;
            var label = t && !PX.lightbox.isOpen() ? t.getAttribute('data-cur') : '';
            if (label) {
                if (!on) {
                    x = tx;
                    y = ty;
                }
                el.textContent = label;
            }
            on = !!label;
            el.classList.toggle('is-on', on);
            if (!raf) raf = requestAnimationFrame(tick);
        };
        document.addEventListener('pointermove', sync, { passive: true });
        document.addEventListener('pointerdown', function () {
            el.classList.add('is-down');
        });
        document.addEventListener('pointerup', function () {
            el.classList.remove('is-down');
        });
        document.addEventListener('pointerleave', function () {
            on = false;
            el.classList.remove('is-on');
        });
    };

    /* =====================================================================
       Lightbox
       ===================================================================== */
    var ICON = {
        play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.6v10.8L13 8z"/></svg>',
        pause: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
        info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 4.7v.4" stroke-linecap="round"/></svg>',
        full: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/></svg>',
        close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
        prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
        next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
    };
    PX.icon = ICON;

    var L = { el: null, list: [], i: 0, open: false, getList: null, origin: null, play: false, timer: 0, info: false, pushed: false };
    var SLIDE_MS = 4200;

    function build() {
        if (L.el) return;
        var el = (L.el = document.createElement('div'));
        el.className = 'lb';
        el.hidden = true;
        el.tabIndex = -1;
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Photograph');
        el.innerHTML =
            '<div class="lb__glow" aria-hidden="true"></div>' +
            '<div class="lb__top">' +
            '<p class="lb__count mono"><b></b><i></i><span></span></p>' +
            '<div class="lb__tools">' +
            '<button class="lb__btn" type="button" data-lb="play" aria-pressed="false" aria-label="Slideshow">' + ICON.play + '</button>' +
            '<button class="lb__btn" type="button" data-lb="info" aria-pressed="false" aria-label="Details">' + ICON.info + '</button>' +
            '<button class="lb__btn lb__btn--full" type="button" data-lb="full" aria-label="Fullscreen">' + ICON.full + '</button>' +
            '<button class="lb__btn lb__btn--close" type="button" data-lb="close" aria-label="Close">' + ICON.close + '</button>' +
            '</div></div>' +
            '<div class="lb__stage">' +
            '<button class="lb__nav lb__nav--prev" type="button" data-lb="prev" aria-label="Previous photograph">' + ICON.prev + '</button>' +
            '<div class="lb__frame"><button class="lb__zoom" type="button" aria-label="Zoom"><img alt="" draggable="false"></button></div>' +
            '<button class="lb__nav lb__nav--next" type="button" data-lb="next" aria-label="Next photograph">' + ICON.next + '</button>' +
            '</div>' +
            '<aside class="lb__info" aria-label="Details" hidden></aside>' +
            '<div class="lb__bottom"><div class="lb__strip"></div></div>';
        document.body.appendChild(el);

        el.addEventListener('click', function (e) {
            var b = e.target.closest('[data-lb]');
            if (b) {
                var a = b.getAttribute('data-lb');
                if (a === 'close') PX.lightbox.close();
                else if (a === 'prev') step(-1);
                else if (a === 'next') step(1);
                else if (a === 'play') setPlay(!L.play);
                else if (a === 'info') setInfo(!L.info);
                else if (a === 'full') toggleFull();
                else if (a === 'go') go(+b.getAttribute('data-i'), +b.getAttribute('data-i') > L.i ? 1 : -1);
                else if (a === 'copy') copy(b.getAttribute('data-hex'));
                return;
            }
            var z = e.target.closest('.lb__zoom');
            if (z) {
                if (swiped) return;
                origin(e);
                el.classList.toggle('is-zoom');
                if (el.classList.contains('is-zoom')) {
                    setPlay(false);
                    /* Zoom no further than the file can carry: about one image pixel per CSS pixel, between 1.4x
                       and 2.4x. Small originals (phone screenshots, crops) used to be blown up to 2.4x and looked soft.
                       While zoomed, ask for the largest file. */
                    var zp = L.list[L.i], zf = el.querySelector('.lb__frame'), zi = zf && zf.querySelector('img:not(.lb__ghost)');
                    if (zp && zf) el.style.setProperty('--zoom', Math.max(1.4, Math.min(2.4, zp.w / zf.getBoundingClientRect().width)).toFixed(2));
                    if (zi) zi.sizes = '250vw';
                }
            }
        });

        /* swipe to travel, and pan while zoomed */
        var stage = el.querySelector('.lb__stage');
        var sx = 0,
            sy = 0,
            down = false,
            swiped = false;
        stage.addEventListener('pointerdown', function (e) {
            down = true;
            swiped = false;
            sx = e.clientX;
            sy = e.clientY;
        });
        stage.addEventListener('pointermove', function (e) {
            if (el.classList.contains('is-zoom')) origin(e);
        });
        stage.addEventListener('pointerup', function (e) {
            if (!down) return;
            down = false;
            if (el.classList.contains('is-zoom')) return;
            var dx = e.clientX - sx,
                dy = e.clientY - sy;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                swiped = true;
                step(dx < 0 ? 1 : -1);
            } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
                swiped = true;
                PX.lightbox.close();
            }
        });
        stage.addEventListener('pointercancel', function () {
            down = false;
        });

        function origin(e) {
            var z = el.querySelector('.lb__zoom');
            var r = z.getBoundingClientRect();
            if (!r.width) return;
            var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
                py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
            z.style.setProperty('--ox', (px * 100).toFixed(1) + '%');
            z.style.setProperty('--oy', (py * 100).toFixed(1) + '%');
        }

        document.addEventListener('keydown', function (e) {
            if (!L.open || e.metaKey || e.ctrlKey || e.altKey) return;
            var k = e.key;
            if (k === 'Escape') {
                e.preventDefault();
                if (el.classList.contains('is-zoom')) el.classList.remove('is-zoom');
                else PX.lightbox.close();
            } else if (k === 'ArrowRight') {
                e.preventDefault();
                step(1);
            } else if (k === 'ArrowLeft') {
                e.preventDefault();
                step(-1);
            } else if (k === ' ' && !(e.target.closest && e.target.closest('button'))) {
                e.preventDefault();
                setPlay(!L.play);
            } else if (k === 'i' || k === 'I') setInfo(!L.info);
            else if (k === 'f' || k === 'F') toggleFull();
        });
    }

    function copy(hex) {
        var ok = function () {
            PX.toast(hex + ' copied');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(hex).then(ok, ok);
        else ok();
    }

    function toggleFull() {
        try {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (root.requestFullscreen) root.requestFullscreen();
        } catch (e) {}
    }

    function setInfo(on) {
        L.info = on;
        var a = L.el.querySelector('.lb__info');
        a.hidden = !on;
        L.el.querySelector('[data-lb="info"]').setAttribute('aria-pressed', String(on));
        L.el.classList.toggle('has-info', on);
    }

    function setPlay(on) {
        L.play = on;
        clearTimeout(L.timer);
        var b = L.el.querySelector('[data-lb="play"]');
        b.setAttribute('aria-pressed', String(on));
        b.innerHTML = on ? ICON.pause : ICON.play;
        var old = L.el.querySelector('.lb__progress');
        if (old) old.remove();
        if (!on) return;
        var bar = document.createElement('i');
        bar.className = 'lb__progress';
        bar.style.animationDuration = SLIDE_MS + 'ms';
        L.el.appendChild(bar);
        L.timer = setTimeout(function () {
            step(1, true);
        }, SLIDE_MS);
    }

    function step(d, auto) {
        if (!L.list.length) return;
        go((L.i + d + L.list.length) % L.list.length, d, auto);
    }

    function go(i, dir, auto) {
        L.i = i;
        L.el.classList.remove('is-zoom');
        render(dir || 1);
        PX.set('p', L.list[i].id);
        if (L.play) setPlay(true);
        else if (!auto) clearTimeout(L.timer);
    }

    function row(k, v) {
        return v ? '<div data-k="' + k.toLowerCase() + '"><dt>' + k + '</dt><dd>' + v + '</dd></div>' : '';
    }
    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function render(dir) {
        var p = L.list[L.i],
            el = L.el;
        if (!p) return;
        el.style.setProperty('--lbc', p.color);
        el.querySelector('.lb__count b').textContent = PX.pad(L.i + 1);
        el.querySelector('.lb__count i').textContent = ' / ' + PX.pad(L.list.length);
        el.querySelector('.lb__count span').textContent = PX.setTitle(p.set);

        var frame = el.querySelector('.lb__frame');
        /* where the frame is right now (mid-morph included), so the next shape grows out of it */
        var first = dir && PX.motion && !document.hidden ? frame.getBoundingClientRect() : null;
        frame.style.setProperty('--r', (p.w / p.h).toFixed(4));
        frame.style.backgroundImage = 'url(' + p.lqip + ')';
        frame.style.backgroundColor = p.color;

        /* a fresh <img> each time, so the slide-in restarts and a slow load never shows the previous picture */
        var zoom = el.querySelector('.lb__zoom');
        var old = zoom.querySelector('img');
        var im = new Image();
        im.alt = PX.alt(p);
        im.draggable = false;
        im.decoding = 'async';
        im.onload = function () {
            im.classList.add('is-loaded');
        };
        im.sizes = '(max-width:900px) 100vw, 80vw';
        im.srcset = PX.srcset(p);
        im.src = PX.src(p, 1600);
        if (im.complete && im.naturalWidth) im.classList.add('is-loaded');
        zoom.replaceChild(im, old);
        /* Travel between photographs: the frame reshapes from the old proportions to the new ones while the
           old picture dissolves inside it and the new one settles in from the side you are heading to. */
        Array.prototype.forEach.call(zoom.querySelectorAll('.lb__ghost'), function (g) { g.remove(); });
        frame.getAnimations().forEach(function (a) { a.cancel(); });
        clearTimeout(L.morphT);
        frame.classList.remove('is-morph');
        if (first && first.width && frame.animate) {
            var last = frame.getBoundingClientRect();
            var EASE = 'cubic-bezier(.2,0,0,1)', MS = 560;
            old.className = 'lb__ghost';
            old.alt = '';
            old.onload = null;
            zoom.appendChild(old);
            frame.classList.add('is-morph');
            frame.animate(
                [{ width: first.width + 'px', height: first.height + 'px' }, { width: last.width + 'px', height: last.height + 'px' }],
                { duration: MS, easing: EASE },
            );
            old.animate(
                [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(' + -dir * 3 + '%,0,0) scale(1.02)' }],
                { duration: MS * 0.62, easing: 'cubic-bezier(.3,0,.6,.4)', fill: 'forwards' },
            );
            im.animate(
                [{ transform: 'translate3d(' + dir * 4 + '%,0,0) scale(1.05)' }, { transform: 'none' }],
                { duration: MS, easing: EASE },
            );
            L.morphT = setTimeout(function () {
                if (old.parentNode) old.remove();
                frame.classList.remove('is-morph');
            }, MS + 60);
        }

        var x = p.exif || {};
        var exposure = [x.focal, x.aperture, x.shutter ? String(x.shutter).replace(/s$/, '') + 's' : '', x.iso ? 'ISO ' + x.iso : ''].filter(Boolean).join(' · ');
        var credit = p.credit ? (p.source ? '<a href="' + esc(p.source) + '" target="_blank" rel="noopener">' + esc(p.credit) + '</a>' : esc(p.credit)) : '';
        el.querySelector('.lb__info').innerHTML =
            '<p class="lb__no mono">No. ' + PX.no(p) + '</p>' +
            '<h3>' + esc(p.title || PX.setTitle(p.set)) + '</h3>' +
            '<dl class="lb__meta mono">' +
            row('Set', esc(PX.setTitle(p.set))) +
            row('Date', PX.date(p)) +
            row('Place', p.location ? esc(p.location) : '') +
            row('Camera', x.camera ? esc(x.camera) : '') +
            row('Lens', x.lens ? esc(x.lens) : '') +
            row('Exposure', exposure) +
            row('Size', p.w + ' × ' + p.h) +
            row('Photo', credit) +
            '</dl>' +
            '<div class="lb__palette">' +
            p.palette
                .map(function (c) {
                    return '<button type="button" class="mono" data-lb="copy" data-hex="' + c + '" style="--sw:' + c + '" aria-label="Copy ' + c + '"><i></i>' + c.replace('#', '') + '</button>';
                })
                .join('') +
            '</div>';

        /* thumbnail strip: a window around the current photograph */
        var n = L.list.length,
            half = Math.min(7, Math.floor((n - 1) / 2)),
            html = '';
        for (var k = -half; k <= half; k++) {
            var j = (L.i + k + n) % n,
                q = L.list[j];
            html +=
                '<button type="button" data-lb="go" data-i="' + j + '"' + (k === 0 ? ' aria-current="true"' : '') +
                ' aria-label="Photograph ' + (j + 1) + '" style="background-color:' + q.color + ';background-image:url(' + PX.src(q, 0) + ')"></button>';
        }
        el.querySelector('.lb__strip').innerHTML = html;

        /* warm the neighbours */
        [1, -1].forEach(function (d) {
            var q = L.list[(L.i + d + n) % n];
            if (q) new Image().src = PX.src(q, 1600);
        });
    }

    function thumbFor(id) {
        var all = document.querySelectorAll('[data-pid="' + id + '"]');
        for (var i = 0; i < all.length; i++) {
            var r = all[i].getBoundingClientRect();
            if (r.width > 8 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && !L.el.contains(all[i])) return all[i];
        }
        return null;
    }

    function morph(fromEl, toEl, change) {
        if (!PX.motion || !document.startViewTransition || (!fromEl && !toEl)) {
            change();
            return;
        }
        if (fromEl) fromEl.style.viewTransitionName = 'ph-active';
        var vt;
        try {
            vt = document.startViewTransition(function () {
                if (fromEl) fromEl.style.viewTransitionName = '';
                change();
                if (toEl) toEl.style.viewTransitionName = 'ph-active';
            });
        } catch (e) {
            if (fromEl) fromEl.style.viewTransitionName = '';
            change();
            return;
        }
        var clean = function () {
            if (toEl) toEl.style.viewTransitionName = '';
            if (fromEl) fromEl.style.viewTransitionName = '';
        };
        if (vt.ready) vt.ready.catch(function () {});
        if (vt.updateCallbackDone) vt.updateCallbackDone.catch(function () {});
        vt.finished.then(clean, clean);
    }

    function show(id, originEl, dir) {
        build();
        L.list = (L.getList ? L.getList() : PX.photos).slice();
        var i = L.list.findIndex(function (p) {
            return p.id === id;
        });
        if (i < 0) {
            L.list = PX.photos.slice();
            i = L.list.findIndex(function (p) {
                return p.id === id;
            });
        }
        if (i < 0) return false;
        L.i = i;
        L.origin = originEl || null;
        L.last = document.activeElement;
        var frame = L.el.querySelector('.lb__frame');
        var from = originEl && originEl.isConnected ? originEl : thumbFor(id);
        frame.style.viewTransitionName = 'none';
        morph(from, frame, function () {
            render(0);
            L.el.hidden = false;
            L.open = true;
            root.classList.add('lb-open');
            Array.prototype.forEach.call(document.body.children, function (c) {
                if (c !== L.el && !c.classList.contains('toast')) c.inert = true;
            });
            L.el.focus({ preventScroll: true });
        });
        return true;
    }

    function hide() {
        if (!L.open) return;
        var id = L.list[L.i] && L.list[L.i].id;
        setPlay(false);
        if (document.fullscreenElement)
            try {
                document.exitFullscreen();
            } catch (e) {}
        var frame = L.el.querySelector('.lb__frame');
        var to = id ? thumbFor(id) : null;
        var done = function () {
            L.el.hidden = true;
            L.el.classList.remove('is-zoom');
            L.open = false;
            root.classList.remove('lb-open');
            Array.prototype.forEach.call(document.body.children, function (c) {
                c.inert = false;
            });
        };
        /* thumbFor needs the page visible again to find its target, so un-inert first */
        Array.prototype.forEach.call(document.body.children, function (c) {
            c.inert = false;
        });
        to = id ? thumbFor(id) : null;
        morph(to ? frame : null, to, done);
        var back = (to && to.closest('a,button,[tabindex]')) || L.last;
        if (back && back.focus && back.isConnected) back.focus({ preventScroll: true });
        if (typeof PX.lightbox.onClose === 'function') PX.lightbox.onClose(id);
    }

    PX.lightbox = {
        onClose: null,
        isOpen: function () {
            return L.open;
        },
        current: function () {
            return L.open ? L.list[L.i] : null;
        },
        /** getList() returns the photographs currently on show, in order. Also opens a deep link (#p=<id>). */
        bind: function (getList) {
            L.getList = getList;
            var sync = function () {
                var id = PX.get('p');
                if (id && PX.byId(id)) {
                    if (!L.open) show(id, null);
                    else if (L.list[L.i].id !== id) {
                        var i = L.list.findIndex(function (p) {
                            return p.id === id;
                        });
                        if (i >= 0) {
                            L.i = i;
                            render(1);
                        }
                    }
                } else if (L.open) hide();
            };
            window.addEventListener('popstate', sync);
            window.addEventListener('hashchange', sync);
            PX.ready(sync);
        },
        open: function (id, originEl) {
            if (L.open) return;
            var o = readHash();
            o.p = id;
            L.pushed = false;
            try {
                history.pushState({ lb: 1 }, '', hashOf(o));
                L.pushed = true;
            } catch (e) {}
            show(id, originEl || null);
        },
        close: function () {
            if (!L.open) return;
            if (L.pushed && history.state && history.state.lb) {
                L.pushed = false;
                history.back(); /* popstate -> hide() */
            } else {
                PX.set('p', null);
                hide();
            }
        },
    };

    /* =====================================================================
       Site chrome: the real pill nav and footer, plus the prototype switcher
       ===================================================================== */
    var NAV = [
        ['work', 'Work'],
        ['about', 'About'],
        ['writing', 'Writing'],
        ['photos', 'Photos'],
        ['resume', 'Resume'],
    ];
    var MAIL = 'mailto:me@felixyeboah.dev';
    var OPTIONS = [
        ['a', 'option-a-darkroom.html', 'Darkroom'],
        ['b', 'option-b-exhibition.html', 'Exhibition'],
        ['c', 'option-c-depth.html', 'Depth'],
        ['d', 'option-d-monograph.html', 'Monograph'],
        ['e', 'option-e-counterpoint.html', 'Counterpoint'],
    ];
    PX.options = OPTIONS;

    /* pages of the redesigned site, next to this file's page */
    function href(k) {
        return k === 'photos' ? '#top' : k + '.html';
    }

    function chrome() {
        var nav = document.getElementById('nav');
        if (nav && !nav.children.length) {
            nav.innerHTML =
                '<div class="nav__bar">' +
                '<a class="brand" href="index.html" aria-label="Felix Yeboah - Jefferson, home"><span class="brand__mark" aria-hidden="true">FY</span><span class="brand__name">Felix Yeboah - Jefferson</span></a>' +
                '<nav aria-label="Primary"><ul class="nav__links">' +
                NAV.map(function (n) {
                    return '<li><a href="' + href(n[0]) + '"' + (n[0] === 'photos' ? ' aria-current="page"' : '') + '>' + n[1] + '</a></li>';
                }).join('') +
                '</ul></nav>' +
                '<span class="clock mono" aria-label="Local time in Accra"><span class="dot" aria-hidden="true"></span><span><span class="clock__city">Accra </span><b data-clock>--:--</b> <span class="clock__tz">GMT</span></span></span>' +
                '<a class="btn btn--accent nav__cta" href="' + MAIL + '">Let\'s talk</a>' +
                '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-panel"><span class="menu-btn__label">Menu</span><span class="menu-btn__icon" aria-hidden="true"></span></button>' +
                '</div>' +
                '<div class="nav__panel" id="nav-panel"><ul>' +
                NAV.map(function (n, i) {
                    return '<li><a href="' + href(n[0]) + '"' + (n[0] === 'photos' ? ' aria-current="page"' : '') + '>' + n[1] + ' <span class="mono">0' + (i + 1) + '</span></a></li>';
                }).join('') +
                '</ul><div class="nav__panel-foot"><a class="btn btn--accent" href="' + MAIL + '">Let\'s talk</a><a class="btn btn--ghost" href="https://x.com/sudocode_" target="_blank" rel="noopener">@sudocode_</a></div></div>';

            var btn = nav.querySelector('.menu-btn');
            var setOpen = function (on) {
                nav.classList.toggle('is-open', on);
                btn.setAttribute('aria-expanded', String(on));
                btn.querySelector('.menu-btn__label').textContent = on ? 'Close' : 'Menu';
            };
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                setOpen(!nav.classList.contains('is-open'));
            });
            nav.querySelector('.nav__panel').addEventListener('click', function (e) {
                if (e.target.closest('a')) setOpen(false);
            });
            document.addEventListener('click', function (e) {
                if (!nav.contains(e.target)) setOpen(false);
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                    setOpen(false);
                    btn.focus();
                }
            });
            var onScroll = function () {
                nav.classList.toggle('is-scrolled', window.scrollY > 24);
            };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
            var clock = nav.querySelector('[data-clock]');
            var tick = function () {
                clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra' });
            };
            tick();
            setInterval(tick, 20000);
        }

        var foot = document.querySelector('footer.footer');
        if (foot && !foot.children.length) {
            foot.innerHTML =
                '<div class="footer__word" aria-hidden="true">Felix Yeboah - Jefferson</div>' +
                '<div class="wrap footer__row mono"><span>&copy; ' + new Date().getFullYear() + ' Felix Yeboah - Jefferson</span><span>Designed &amp; built in Accra</span>' +
                '<nav class="footer__links" aria-label="Elsewhere"><a href="' + MAIL + '">Email</a><a href="https://github.com/felixyeboah" target="_blank" rel="noopener">GitHub</a><a href="https://x.com/sudocode_" target="_blank" rel="noopener">X / Twitter</a></nav>' +
                '<a href="#top">Back to top &uarr;</a></div>';
        }

        /* prototype-only: jump between the three options */
        var cur = document.body.getAttribute('data-option');
        if (cur) {
            var sw = document.createElement('nav');
            sw.className = 'optsw mono';
            sw.setAttribute('aria-label', 'Design options');
            sw.innerHTML =
                '<a href="index.html" aria-label="All options">' + ICON.prev + '</a>' +
                OPTIONS.map(function (o) {
                    return '<a href="' + o[1] + '"' + (o[0] === cur ? ' aria-current="page"' : '') + ' title="' + o[2] + '">' + o[0].toUpperCase() + '</a>';
                }).join('');
            document.body.appendChild(sw);
        }
    }
    PX.ready(chrome);
})();
