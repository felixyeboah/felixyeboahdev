PX.ready(function () {
    'use strict';
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };
    var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    var roman = function (n) { return ROMAN[n - 1] || String(n); };
    var AUTO_MS = 5200;

    /* ------------------------------------------------------------------ cover */
    $('#cvTitle').innerHTML = 'Photographs'.split('').map(function (ch, i) {
        return '<span aria-hidden="true" style="--i:' + i + '">' + ch + '</span>';
    }).join('');
    var years = PX.photos.map(PX.year).filter(Boolean).sort();
    var span = years.length ? (years[0] === years[years.length - 1] ? years[0] : years[0] + '–' + years[years.length - 1]) : '';
    $('#cvEd').innerHTML =
        '<div><dt>Frames</dt><dd>' + PX.pad(PX.photos.length) + '</dd></div>' +
        '<div><dt>Chapters</dt><dd>' + roman(PX.sets.length) + '</dd></div>' +
        (span ? '<div><dt>Years</dt><dd>' + span + '</dd></div>' : '');
    var lead = PX.photos.filter(function (p) { return p.w > p.h; })[0] || PX.photos[0];
    var cvPlate = $('#cvPlate');
    if (lead) {
        cvPlate.style.setProperty('--r', (lead.w / lead.h).toFixed(4));
        cvPlate.setAttribute('data-pid', lead.id);
        cvPlate.setAttribute('aria-label', PX.alt(lead));
        cvPlate.appendChild(PX.frame(lead, { alt: '', eager: true, min: 960, sizes: '(max-width:820px) 62vw, 34vw' }));
        cvPlate.addEventListener('click', function () { PX.lightbox.open(lead.id, cvPlate); });
    } else cvPlate.remove();

    /* ------------------------------------------------------------------ state */
    var VIEWS = ['plates', 'contents', 'columns'];
    var state = { set: 'all', view: PX.get('view') || 'plates' };
    if (VIEWS.indexOf(state.view) < 0) state.view = 'plates';

    var list = [];   /* photographs in book order */
    var steps = [];  /* chapter cards and plates, in the order you page through them */
    var cur = 0;

    function build() {
        list = [];
        steps = [];
        PX.sets.forEach(function (s, si) {
            if (state.set !== 'all' && state.set !== s.id) return;
            var ps = PX.photos.filter(function (p) { return p.set === s.id; });
            if (!ps.length) return;
            steps.push({ type: 'ch', set: s, roman: roman(si + 1), count: ps.length, lead: ps[0], first: steps.length + 1 });
            ps.forEach(function (p) {
                list.push(p);
                steps.push({ type: 'p', p: p, k: list.length });
            });
        });
    }
    function stepOf(id) {
        for (var i = 0; i < steps.length; i++) if (steps[i].type === 'p' && steps[i].p.id === id) return i;
        return -1;
    }
    var kOf = function (p) { return list.indexOf(p) + 1; };

    build();
    cur = clamp((parseInt(PX.get('n'), 10) || 1) - 1, 0, Math.max(0, steps.length - 1));

    PX.lightbox.bind(function () { return list; });
    PX.lightbox.onClose = function (id) {
        if (state.view !== 'plates') return;
        var i = stepOf(id);
        if (i >= 0 && i !== cur) go(i, i > cur ? 1 : -1, true);
    };
    PX.cursor();

    /* ------------------------------------------------------------------ controls */
    var viewsEl = $('#views');
    function press(group, v) {
        Array.prototype.forEach.call(group.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
    }

    viewsEl.addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) return;
        var v = b.getAttribute('data-v');
        if (v === state.view) return;
        state.view = v;
        PX.set('view', v === 'plates' ? null : v);
        stopAuto();
        show(true);
    });

    var book = $('#book'), sections = { plates: $('#plates'), contents: $('#contents'), columns: $('#columns') };
    var reveals = null, colsOff = null, suppress = false;

    function show(swap) {
        press(viewsEl, state.view);
        if (reveals) { reveals.disconnect(); reveals = null; }
        if (colsOff) { colsOff(); colsOff = null; }
        sections.columns.innerHTML = '';
        VIEWS.forEach(function (v) { sections[v].hidden = v !== state.view; });
        if (state.view === 'plates') { buildScrub(); renderSlide(1, !swap); }
        else if (state.view === 'contents') renderContents();
        else colsOff = columns(sections.columns, list);
        if (swap) {
            var s = sections[state.view];
            s.classList.remove('is-swap');
            void s.offsetWidth;
            s.classList.add('is-swap');
            toBook();
        }
    }
    /* bring the book to the top of the window when a control is used from further down the page */
    function toBook() {
        var pinned = state.view !== 'contents';
        var top = (state.view === 'plates' ? stage : book).getBoundingClientRect().top;
        if (top < 0 || pinned) window.scrollTo({ top: window.scrollY + top - (pinned ? 0 : 70), behavior: 'instant' });
    }

    /* ------------------------------------------------------------------ plates */
    var stage = sections.plates, sheet = $('#sheet'), live = $('#live'), countEl = $('#count');
    var prevB = $('#prev'), nextB = $('#next'), autoB = $('#auto');
    prevB.innerHTML = PX.icon.prev;
    nextB.innerHTML = PX.icon.next;
    autoB.innerHTML = PX.icon.play;

    function digits(n, len) {
        return PX.pad(n, len).split('').map(function (d, i) { return '<span class="dg" style="--i:' + i + '"><b>' + d + '</b></span>'; }).join('');
    }
    function buildSlide(st) {
        var a;
        if (st.type === 'ch') {
            a = el('article', 'sl sl--ch');
            var bg = el('div', 'sl__bg wipe');
            bg.appendChild(PX.frame(st.lead, { alt: '', eager: true, min: 1600, sizes: '100vw' }));
            a.appendChild(bg);
            a.appendChild(el('div', 'sl__chin',
                '<p class="ch__num">' + st.roman + '</p><span class="ch__rule" aria-hidden="true"></span>' +
                '<h2 class="ch__title"><i>' + st.set.title + '</i></h2>' +
                '<p class="ch__count mono">' + PX.pad(st.count) + ' Plates</p>'));
            return a;
        }
        var p = st.p, r = p.w / p.h, x = p.exif || {};
        a = el('article', 'sl sl--p ' + (st.k % 2 ? 'sl--left' : 'sl--right') + (r < 1 ? ' sl--port' : ' sl--land'));
        var b = el('button', 'sl__ph wipe');
        b.type = 'button';
        b.style.setProperty('--r', r.toFixed(4));
        b.setAttribute('data-pid', p.id);
        b.setAttribute('data-cur', 'View');
        b.setAttribute('aria-label', PX.alt(p));
        b.appendChild(PX.frame(p, { alt: '', eager: true, min: 1600, sizes: r < 1 ? '(max-width:820px) 90vw, 40vw' : '(max-width:820px) 92vw, 56vw' }));
        a.appendChild(b);
        var cam = [x.camera, x.lens].filter(Boolean).join(' \u00b7 ');
        var exp = [x.aperture, x.shutter, x.iso ? 'ISO ' + x.iso : ''].filter(Boolean).join(' \u00b7 ');
        a.appendChild(el('div', 'sl__col',
            '<p class="sl__no"><span class="sl__digits" aria-hidden="true">' + digits(st.k, list.length > 99 ? 3 : 2) + '</span>' +
            '<span class="mono">/ ' + PX.pad(list.length, list.length > 99 ? 3 : 2) + '</span></p>' +
            '<h2 class="sl__set">' + PX.setTitle(p.set) + '</h2>' +
            '<p class="sl__meta mono">' + [[p.title, p.location].filter(Boolean).join(' \u00b7 '), PX.date(p), cam, exp].filter(Boolean).map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</p>'));
        return a;
    }

    /* The new page is inserted in its "entering" state and released on the same tick, so CSS carries the
       motion and nothing waits on a frame callback. Timers only tidy up the page that left. */
    function renderSlide(dir, cut) {
        var st = steps[cur], old = Array.prototype.slice.call(sheet.querySelectorAll('.sl'));
        if (!st) { old.forEach(function (o) { o.remove(); }); return; }
        var a = buildSlide(st);
        a.setAttribute('data-dir', String(dir));
        if (PX.motion && !cut) {
            a.classList.add('is-enter');
            sheet.appendChild(a);
            void a.offsetWidth;
            a.classList.remove('is-enter');
            old.forEach(function (o) {
                o.setAttribute('data-dir', String(dir));
                o.classList.add('is-leave');
                o.inert = true;
                var ph = o.querySelector('[data-pid]');
                if (ph) ph.removeAttribute('data-pid');
                setTimeout(function () { o.remove(); }, 1300);
            });
        } else {
            old.forEach(function (o) { o.remove(); });
            sheet.appendChild(a);
        }
        stage.style.setProperty('--tint', st.type === 'p' ? st.p.color : st.lead.color);
        prevB.disabled = cur <= 0;
        nextB.disabled = cur >= steps.length - 1;
        countEl.innerHTML = st.type === 'p' ? '<b>' + PX.pad(st.k) + '</b> / ' + PX.pad(list.length) : '<b>' + st.roman + '</b> / ' + PX.pad(list.length);
        live.textContent = st.type === 'p' ? 'Plate ' + st.k + ' of ' + list.length + ', ' + PX.setTitle(st.p.set) : 'Chapter ' + st.roman + ', ' + st.set.title;
        placeScrub();
        /* warm the neighbours */
        [cur + 1, cur - 1].forEach(function (i) {
            var s = steps[i];
            if (s) new Image().src = PX.src(s.type === 'p' ? s.p : s.lead, 1600);
        });
    }

    function go(i, dir, cut) {
        i = clamp(i, 0, steps.length - 1);
        if (i === cur) return;
        dir = dir || (i > cur ? 1 : -1);
        cur = i;
        PX.set('n', cur ? String(cur + 1) : null);
        renderSlide(dir, cut);
    }
    function step(d) {
        var can = d > 0 ? cur < steps.length - 1 : cur > 0;
        if (can) go(cur + d, d);
        return can;
    }

    prevB.addEventListener('click', function () { step(-1); });
    nextB.addEventListener('click', function () { step(1); });

    /* the stage counts as "the page you are on" while it fills most of the window */
    function engaged() {
        if (state.view !== 'plates') return false;
        var r = stage.getBoundingClientRect();
        return r.top < innerHeight * 0.4 && r.bottom > innerHeight * 0.6;
    }
    function snap() {
        var top = stage.getBoundingClientRect().top;
        if (Math.abs(top) > 2) window.scrollTo({ top: window.scrollY + top, behavior: PX.motion ? 'smooth' : 'instant' });
    }

    /* Wheel: one plate per gesture. A gesture that begins on the stage turns the page; one that arrives from
       outside is caught and pinned. At the first and last plate the page simply scrolls on. */
    var lastWheel = 0, lastStep = 0, gStepped = false, gInside = false;
    window.addEventListener('wheel', function (e) {
        if (state.view !== 'plates' || PX.lightbox.isOpen() || e.ctrlKey) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        var now = performance.now(), same = now - lastWheel < 170, on = engaged();
        lastWheel = now;
        if (!same) { gStepped = false; gInside = on; }
        if (!on) return;
        var d = e.deltaY > 0 ? 1 : -1, can = d > 0 ? cur < steps.length - 1 : cur > 0;
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
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
        if (state.view !== 'plates' || PX.lightbox.isOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
        var t = e.target;
        if (t && t.closest && t.closest('input,textarea,select')) return;
        if (t !== autoB) stopAuto();
        var k = e.key, d = 0;
        if (t === scrub && (k === 'Home' || k === 'End')) { e.preventDefault(); go(k === 'Home' ? 0 : steps.length - 1); return; }
        if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown') d = 1;
        else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') d = -1;
        if (!d || !engaged()) return;
        var can = d > 0 ? cur < steps.length - 1 : cur > 0;
        if (!can) return; /* at the ends the keys scroll the page as usual */
        e.preventDefault();
        if (k !== 'ArrowLeft' && k !== 'ArrowRight') snap();
        step(d);
    });

    /* swipe (and mouse drag) sideways to turn the page; vertical touch movement belongs to the page */
    var sx = 0, sy = 0, sDown = false, swiped = false;
    stage.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.pl__hud')) return;
        sDown = true;
        swiped = false;
        sx = e.clientX;
        sy = e.clientY;
    });
    window.addEventListener('pointerup', function (e) {
        if (!sDown) return;
        sDown = false;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            swiped = true;
            step(dx < 0 ? 1 : -1);
            setTimeout(function () { swiped = false; }, 0);
        }
    });
    window.addEventListener('pointercancel', function () { sDown = false; });
    sheet.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pid]');
        if (!b || swiped) return;
        PX.lightbox.open(b.getAttribute('data-pid'), b);
    });

    /* ------------------------------------------------------------------ scrubber */
    var scrub = $('#scrub'), track = $('#track'), fill = $('#fill'), knob = $('#knob'), tip = $('#tip');
    var frac = function (i) { return steps.length > 1 ? i / (steps.length - 1) : 0; };

    function buildScrub() {
        Array.prototype.slice.call(track.querySelectorAll('.tk')).forEach(function (t) { t.remove(); });
        steps.forEach(function (s, i) {
            var t = el('i', 'tk' + (s.type === 'ch' ? ' tk--ch' : ''), s.type === 'ch' ? '<em>' + s.roman + '</em>' : '');
            t.style.left = (frac(i) * 100).toFixed(3) + '%';
            track.insertBefore(t, fill);
        });
        scrub.setAttribute('aria-valuemax', String(Math.max(1, steps.length)));
    }
    function placeScrub() {
        var f = frac(cur);
        fill.style.transform = 'scaleX(' + f.toFixed(4) + ')';
        knob.style.left = (f * 100).toFixed(3) + '%';
        scrub.setAttribute('aria-valuenow', String(cur + 1));
        var s = steps[cur];
        if (s) scrub.setAttribute('aria-valuetext', s.type === 'p' ? 'Plate ' + s.k + ', ' + PX.setTitle(s.p.set) : 'Chapter ' + s.roman + ', ' + s.set.title);
    }
    function indexAt(x) {
        var r = track.getBoundingClientRect();
        return Math.round(clamp((x - r.left) / (r.width || 1), 0, 1) * (steps.length - 1));
    }
    function showTip(x) {
        var i = indexAt(x), s = steps[i], r = track.getBoundingClientRect();
        if (!s) return;
        tip.hidden = false;
        tip.style.left = clamp(frac(i) * r.width, 48, Math.max(48, r.width - 48)) + 'px';
        var src = PX.src(s.type === 'p' ? s.p : s.lead, 0), im = tip.querySelector('img');
        if (im.getAttribute('src') !== src) im.src = src;
        tip.querySelector('span').textContent = s.type === 'p' ? PX.pad(s.k) + ' · ' + PX.setTitle(s.p.set) : s.roman + ' · ' + s.set.title;
    }
    var dragging = false;
    scrub.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        stopAuto();
        try { scrub.setPointerCapture(e.pointerId); } catch (err) {}
        go(indexAt(e.clientX));
        showTip(e.clientX);
    });
    scrub.addEventListener('pointermove', function (e) {
        if (dragging) {
            scrub.classList.add('is-drag');
            go(indexAt(e.clientX), 0, true);
        }
        if (dragging || e.pointerType === 'mouse') showTip(e.clientX);
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false;
        scrub.classList.remove('is-drag');
        if (!scrub.matches(':hover')) tip.hidden = true;
    }
    scrub.addEventListener('pointerup', endDrag);
    scrub.addEventListener('pointercancel', endDrag);
    scrub.addEventListener('pointerleave', function () { if (!dragging) tip.hidden = true; });

    /* ------------------------------------------------------------------ autoplay */
    var auto = false, autoT = 0;
    function autoBar(on) {
        var old = track.querySelector('.scrub__auto');
        if (old) old.remove();
        if (!on) return;
        var u = el('u', 'scrub__auto');
        u.style.animationDuration = AUTO_MS + 'ms';
        track.appendChild(u);
    }
    function schedule() {
        clearTimeout(autoT);
        autoBar(true);
        autoT = setTimeout(function () {
            if (!auto) return;
            if (!PX.lightbox.isOpen() && !document.hidden && state.view === 'plates') {
                if (cur >= steps.length - 1) { stopAuto(); return; }
                go(cur + 1, 1);
            }
            schedule();
        }, AUTO_MS);
    }
    function setAuto(on) {
        auto = on && PX.motion;
        clearTimeout(autoT);
        autoB.setAttribute('aria-pressed', String(auto));
        autoB.innerHTML = auto ? PX.icon.pause : PX.icon.play;
        if (auto) {
            if (cur >= steps.length - 1) go(0, -1);
            toBook();
            schedule();
        } else autoBar(false);
    }
    function stopAuto() { if (auto) setAuto(false); }
    autoB.addEventListener('click', function () { setAuto(!auto); });
    document.addEventListener('pointerdown', function (e) {
        if (auto && !(e.target.closest && e.target.closest('#auto'))) stopAuto();
    });
    window.addEventListener('touchmove', stopAuto, { passive: true });

    /* ------------------------------------------------------------------ contents */
    function renderContents() {
        var host = sections.contents;
        host.innerHTML = '<h2 class="toc__head">Contents</h2>';
        steps.forEach(function (s, i) {
            if (s.type !== 'ch') return;
            var row = el('div', 'toc__ch');
            var left = el('div', '',
                '<p class="toc__num">' + s.roman + '</p>' +
                '<button class="toc__title" type="button" data-step="' + i + '">' + s.set.title + '</button>' +
                '<p class="toc__n mono">' + PX.pad(s.count) + ' Plates</p>');
            var grid = el('div', 'toc__grid');
            for (var j = i + 1; j < steps.length && steps[j].type === 'p'; j++) {
                var st = steps[j], b = el('button', 'tp');
                b.type = 'button';
                b.setAttribute('data-step', String(j));
                b.setAttribute('aria-label', 'Plate ' + st.k + ', ' + PX.setTitle(st.p.set));
                var im = el('span', 'tp__im');
                im.setAttribute('data-pid', st.p.id);
                im.appendChild(PX.frame(st.p, { alt: '', min: 480, sizes: '112px' }));
                b.appendChild(im);
                b.appendChild(el('span', 'tp__n mono', PX.pad(st.k)));
                grid.appendChild(b);
            }
            row.appendChild(left);
            row.appendChild(grid);
            host.appendChild(row);
        });
    }
    sections.contents.addEventListener('click', function (e) {
        var b = e.target.closest('[data-step]');
        if (!b) return;
        var i = +b.getAttribute('data-step');
        cur = clamp(i, 0, steps.length - 1);
        PX.set('n', cur ? String(cur + 1) : null);
        state.view = 'plates';
        PX.set('view', null);
        press(viewsEl, 'plates');
        VIEWS.forEach(function (v) { sections[v].hidden = v !== 'plates'; });
        sheet.innerHTML = '';
        buildScrub();
        toBook();
        renderSlide(1, false);
        stage.focus({ preventScroll: true });
    });

    /* ------------------------------------------------------------------ columns (from option E) */
    var mod = function (n, m) { return ((n % m) + m) % m; };
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    function colFig(p, dup) {
        var f = el('figure', 'ci'), b = el('button', 'ck'), c = el('figcaption', 'mono');
        b.type = 'button';
        b.setAttribute('data-pid', p.id);
        b.setAttribute('data-cur', 'View');
        b.setAttribute('aria-label', PX.alt(p));
        b.style.aspectRatio = p.w + ' / ' + p.h;
        b.appendChild(PX.frame(p, { alt: '', eager: true, min: 480, sizes: '(max-width:760px) 50vw, 33vw' }));
        if (dup) {
            f.setAttribute('aria-hidden', 'true');
            b.tabIndex = -1;
        }
        c.innerHTML = '<span>' + PX.pad(kOf(p)) + '</span><i>' + PX.setTitle(p.set) + '</i>';
        f.appendChild(b);
        f.appendChild(c);
        return f;
    }
    function colCount() { return innerWidth < 760 ? 2 : 3; }
    function buckets(l, n) {
        var out = [], hs = [], i;
        for (i = 0; i < n; i++) { out.push([]); hs.push(0); }
        l.forEach(function (p) {
            var k = hs.indexOf(Math.min.apply(null, hs));
            out[k].push(p);
            hs[k] += p.h / p.w + 0.1;
        });
        /* fewer photographs than columns: a column borrows the whole list rather than standing empty */
        return out.map(function (b) { return b.length ? b : l.slice(); });
    }

    function columns(host, l) {
        if (!l.length) return null;

        /* reduced motion: a plain grid, nothing pinned, each photograph once */
        if (!PX.motion) {
            var st = el('section', 'cs cs--static'), grid = el('div', 'cs__cols wrap'), n0 = 0;
            st.appendChild(grid);
            host.appendChild(st);
            var flat = function () {
                var n = colCount();
                if (n === n0) return;
                n0 = n;
                grid.innerHTML = '';
                grid.style.setProperty('--n', n);
                var seen = {};
                buckets(l, n).forEach(function (b) {
                    var col = el('div', 'cs__col'), g = el('div', 'cs__grp');
                    b.forEach(function (p) { if (!seen[p.id]) { seen[p.id] = 1; g.appendChild(colFig(p, false)); } });
                    col.appendChild(g);
                    grid.appendChild(col);
                });
            };
            flat();
            addEventListener('resize', flat);
            return function () { removeEventListener('resize', flat); };
        }

        var sec = el('section', 'cs'), stage = el('div', 'cs__stage'), colsEl = el('div', 'cs__cols wrap'),
            mark = el('div', 'cs__mark'), prog = el('i', 'cs__prog');
        mark.setAttribute('aria-hidden', 'true');
        mark.innerHTML = '<div class="cs__word">Photographs</div><p class="cs__count mono"><b></b><i></i><span></span><em>/ ' + PX.pad(l.length) + '</em></p>';
        stage.appendChild(colsEl);
        stage.appendChild(mark);
        stage.appendChild(prog);
        sec.appendChild(stage);
        host.appendChild(sec);
        var noEl = $('b', mark), setEl = $('span', mark);
        var index = {};
        l.forEach(function (p, i) { index[p.id] = i; });

        var RATE = [1, 0.8, 1.16], cols = [], L = 0, vh = 0, lastW = 0;
        var cam = 0, target = 0, drift = 0, dragOff = 0, dragV = 0, slow = 1, slowT = 1;
        var raf = 0, lastT = 0, onScreen = true, dragging = false, down = false, py = 0, sy = 0, cur = null;

        function build() {
            lastW = innerWidth;
            vh = stage.clientHeight || innerHeight;
            L = Math.max(2400, Math.round(innerHeight * 3));
            sec.style.height = 'calc(100svh + ' + L + 'px)';
            colsEl.innerHTML = '';
            cols = [];
            cur = null;
            var n = colCount();
            colsEl.style.setProperty('--n', n);
            buckets(l, n).forEach(function (b, i) {
                var col = el('div', 'cs__col'), run = el('div', 'cs__run'), g1 = el('div', 'cs__grp'), g2 = el('div', 'cs__grp');
                col.style.setProperty('--i', i);
                col.style.setProperty('--from', (i % 2 ? -70 : 70) + 'px');
                g2.setAttribute('aria-hidden', 'true');
                run.appendChild(g1);
                col.appendChild(run);
                colsEl.appendChild(col);
                var items = [], pass = 0;
                var fill = function () {
                    b.forEach(function (p) {
                        var f = colFig(p, pass > 0);
                        g1.appendChild(f);
                        items.push({ p: p, el: f });
                    });
                    pass++;
                };
                fill();
                /* one copy must be taller than the stage, or the loop would show its seam */
                while (g1.offsetHeight < vh * 1.15 && pass < 10) fill();
                var H = g1.offsetHeight;
                items.forEach(function (it) {
                    it.mid = it.el.offsetTop + it.el.firstChild.offsetHeight / 2;
                    g2.appendChild(colFig(it.p, true));
                });
                run.appendChild(g2);
                cols.push({ run: run, H: H || 1, items: items, dir: i % 2 ? -1 : 1, rate: RATE[i % 3], phase: i * 0.37 * H });
            });
            place();
        }

        function travel(c) { return (cam * 0.5 + drift) * c.rate * c.dir + c.phase; }

        function place() {
            for (var i = 0; i < cols.length; i++) {
                var c = cols[i];
                c.y = -mod(travel(c), c.H);
                c.run.style.transform = 'translate3d(0,' + c.y.toFixed(1) + 'px,0)';
            }
            /* the counter follows whichever photograph in the middle column is crossing the centre line */
            var m = cols[Math.min(1, cols.length - 1)];
            if (m) {
                var best = null, bd = 1e9;
                for (var j = 0; j < m.items.length; j++) {
                    var d = Math.abs(mod(m.y + m.items[j].mid - vh / 2 + m.H / 2, m.H) - m.H / 2);
                    if (d < bd) { bd = d; best = m.items[j].p; }
                }
                if (best && best !== cur) {
                    cur = best;
                    noEl.textContent = PX.pad(kOf(best));
                    setEl.textContent = PX.setTitle(best.set);
                }
            }
        }

        function read() {
            var top = -sec.getBoundingClientRect().top;
            target = Math.max(-innerHeight, Math.min(L + innerHeight, top)) + dragOff;
            prog.style.transform = 'scaleX(' + clamp(top / L, 0, 1).toFixed(4) + ')';
        }

        function tick(t) {
            raf = 0;
            if (!onScreen || document.hidden || PX.lightbox.isOpen()) return;
            var dt = lastT ? Math.min(50, t - lastT) : 16;
            lastT = t;
            if (!dragging && Math.abs(dragV) > 0.1) { dragOff += dragV; dragV *= 0.93; }
            read();
            cam += (target - cam) * 0.085;
            slow += (slowT - slow) * 0.08;
            if (!dragging) drift += dt * 0.03 * slow;
            place();
            raf = requestAnimationFrame(tick);
        }
        function kick() {
            if (!raf && onScreen && !document.hidden) { lastT = 0; raf = requestAnimationFrame(tick); }
        }
        /* a backgrounded tab gets no frames: land the columns where the scroll says they should be */
        function onScroll() {
            if (document.hidden) { read(); cam = target; place(); }
            else kick();
        }

        /* hovering a photograph slows the idle travel to a near stop */
        function over(e) { slowT = e.target.closest && e.target.closest('.ck') ? 0.04 : 1; }
        function out() { slowT = 1; }
        if (fine) {
            stage.addEventListener('pointerover', over);
            stage.addEventListener('pointerleave', out);
        }

        /* mouse drag moves the columns; touch already does by scrolling the page */
        function pdown(e) {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            down = true;
            suppress = false;
            py = sy = e.clientY;
            dragV = 0;
        }
        function pmove(e) {
            if (!down) return;
            var dy = e.clientY - py;
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
        }
        function pup() {
            if (!down) return;
            down = false;
            if (dragging) {
                dragging = false;
                stage.classList.remove('is-drag');
                /* the click that follows this pointerup is the only one to swallow */
                setTimeout(function () { suppress = false; }, 0);
            }
        }
        stage.addEventListener('pointerdown', pdown);
        addEventListener('pointermove', pmove);
        addEventListener('pointerup', pup);
        addEventListener('pointercancel', pup);

        /* tabbing to a photograph brings it to the centre line */
        function focusin(e) {
            var b = e.target.closest && e.target.closest('.ck');
            if (!b || down || !b.matches(':focus-visible')) return;
            stage.scrollTop = 0;
            var s = stage.getBoundingClientRect(), r = b.getBoundingClientRect(), c = null;
            for (var i = 0; i < cols.length; i++) if (cols[i].run.contains(b)) c = cols[i];
            if (!c) return;
            var shift = (r.top + r.height / 2 - (s.top + s.height / 2)) / (0.5 * c.rate * c.dir);
            dragOff += shift;
            cam += shift;
            read();
            place();
            kick();
        }
        stage.addEventListener('focusin', focusin);

        var io = new IntersectionObserver(function (en) {
            onScreen = en[0].isIntersecting;
            if (onScreen) kick();
        });
        io.observe(sec);
        var rt = 0;
        function onResize() {
            clearTimeout(rt);
            rt = setTimeout(function () {
                if (innerWidth !== lastW) build();
                else { vh = stage.clientHeight || innerHeight; place(); }
            }, 180);
        }
        var prevClose = PX.lightbox.onClose;
        PX.lightbox.onClose = kick;
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', kick);

        build();
        read();
        cam = target;
        place();
        kick();

        return function () {
            removeEventListener('scroll', onScroll);
            removeEventListener('resize', onResize);
            removeEventListener('pointermove', pmove);
            removeEventListener('pointerup', pup);
            removeEventListener('pointercancel', pup);
            document.removeEventListener('visibilitychange', kick);
            PX.lightbox.onClose = prevClose;
            io.disconnect();
            cancelAnimationFrame(raf);
            clearTimeout(rt);
            suppress = false;
        };
    }

    sections.columns.addEventListener('click', function (e) {
        var b = e.target.closest('[data-pid]');
        if (!b || suppress) return;
        PX.lightbox.open(b.getAttribute('data-pid'), b);
    });

    show(false);
});
