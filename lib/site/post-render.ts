import imagesCache from '@/lib/site/cache/images.json';
import tweetsCache from '@/lib/site/cache/tweets.json';
import {
    type Editorial,
    type PostMeta,
    catLabel,
    cld,
    editorialFor,
    fmtDate,
    isoDate,
} from '@/lib/site/posts';

/* =====================================================================
   Post body renderer: MDX (markdown + a few JSX components) -> HTML string.
   ---------------------------------------------------------------------
   TypeScript port of design-options/tools/sitebuild/writing_pages.js (the approved "Editorial"
   template's renderer), so every post renders the same markup as the prototype:
     - fenced code pre-highlighted at build time (Go, SQL, Bash, YAML, JS/TS), filename tabs, marked lines
     - <Callout>/<Info>/<Warn> callouts, <Image> + markdown figures (dimensions from cache/images.json),
       <StaticTweet> cards (snapshots from cache/tweets.json; never fetched here)
     - rank-based heading levels, unique heading ids, editorial pull quotes and notes
     - internal links to the old routes (/blog/<x>, /case-studies/<x>) mapped to /writing/<slug>, /work/<slug>
   The caches are the prototype's, copied verbatim; nothing here touches the network.
   Server-only (imports lib/site/posts.ts, which reads content/ with fs). Pure functions: the page
   (app/writing/[slug]/page.tsx) owns everything around the body.
   ===================================================================== */

export const SITE_URL = 'https://felixyeboah.dev';
export const CANON = SITE_URL + '/writing/';
/** Feed readers need absolute URLs; local paths ("/assets/...") are made absolute on the live site. */
const absUrl = (u: string) => (u.startsWith('/') ? SITE_URL + u : u);
export const AUTHOR_IMG = 'felixyeboah.dev/IMG_7337_tmsrzq';

type ImageRec = {
    url?: string;
    status?: number;
    type?: string;
    w?: number;
    h?: number;
    error?: string;
};
type Tweet = {
    id: string;
    name?: string;
    handle?: string;
    date: string;
    text: string;
    links?: { url: string; expanded: string; display: string }[];
    hasMedia?: boolean;
};
const images = imagesCache as Record<string, ImageRec>;
const tweets = tweetsCache as Record<string, Tweet>;

export const esc = (s: unknown) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
const attr = (s: unknown) => esc(s).replace(/"/g, '&quot;');
export const isoMonth = (d: Date) => d.toISOString().slice(0, 7);

/** unknown = assume fine (same rule as the prototype build) */
export function imageOk(key: string) {
    const r = images[key];
    return !r || !r.status || r.status < 400;
}
export const imageRec = (key: string): ImageRec => images[key] || {};

/* =====================================================================
   Code tokenisers (5 classes + lime PASS)
   ===================================================================== */
type Tok = [string, string];

const GO_KW = new Set(
    'package import func return if else var const type struct interface defer go range for map chan select case switch default break continue fallthrough goto'.split(
        ' ',
    ),
);
const GO_LIT = new Set(['nil', 'true', 'false', 'iota']);
const GO_BUILTIN_T = new Set(
    'string bool error int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64 byte rune any'.split(
        ' ',
    ),
);
const GO_PKGS = new Set(
    'context uuid db models sql http json bytes errors mocks user utils httptest testing assert time'.split(
        ' ',
    ),
);
function tokGo(code: string): Tok[] {
    const re =
        /(\/\/[^\n]*)|(`[^`]*`)|("(?:[^"\\\n]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_])/g;
    const out: Tok[] = [];
    let m: RegExpExecArray | null;
    const prev: string[] = [];
    let lineStart = true;
    while ((m = re.exec(code))) {
        const v = m[0];
        if (m[1]) out.push(['c', v]);
        else if (m[2] || m[3]) out.push(['s', v]);
        else if (m[4]) out.push(['n', v]);
        else if (m[5]) {
            let t = '';
            const rest = code.slice(re.lastIndex).match(/^[ \t]*(.)/);
            const next = rest ? rest[1] : '';
            const p1 = prev[prev.length - 1],
                p2 = prev[prev.length - 2];
            const cap = /^[A-Z]/.test(v);
            if (GO_KW.has(v)) t = 'k';
            else if (GO_LIT.has(v)) t = 'n';
            else if (GO_BUILTIN_T.has(v)) t = 't';
            else if (next === '(') t = 'f';
            else if (p1 === '.') t = cap && GO_PKGS.has(p2) ? 't' : '';
            else if (cap) t = next === ':' || lineStart ? '' : 't';
            out.push([t, v]);
        } else out.push(['', v]);
        if (!m[6]) {
            prev.push(v);
            lineStart = false;
        }
        if (m[6] && v.includes('\n')) lineStart = true;
    }
    return out;
}
const SQL_KW = new Set(
    'INSERT INTO VALUES RETURNING SELECT FROM WHERE UPDATE SET DELETE AND OR NOT NULL LIMIT ORDER BY'.split(
        ' ',
    ),
);
function tokSql(code: string): Tok[] {
    const re =
        /(--[^\n]*)|('(?:[^'\n])*')|(\$\d+)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_$])/g;
    const out: Tok[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(code))) {
        const v = m[0];
        if (m[1]) out.push(['c', v]);
        else if (m[2]) out.push(['s', v]);
        else if (m[3]) out.push(['n', v]);
        else if (m[4]) out.push([SQL_KW.has(v) ? 'k' : '', v]);
        else out.push(['', v]);
    }
    return out;
}
function tokBash(code: string): Tok[] {
    const out: Tok[] = [];
    code.split('\n').forEach((line, i) => {
        if (i) out.push(['', '\n']);
        let mm: RegExpMatchArray | null;
        if ((mm = line.match(/^(===\s+RUN)(\s+.*)$/))) {
            out.push(['c', mm[1]], ['', mm[2]]);
            return;
        }
        if (
            (mm = line.match(
                /^(---\s+)(PASS|FAIL)(:\s+\S+)(\s+)(\([\d.]+s\))$/,
            ))
        ) {
            out.push(
                ['c', mm[1]],
                [mm[2] === 'PASS' ? 'ok' : 'k', mm[2]],
                ['', mm[3]],
                ['', mm[4]],
                ['n', mm[5]],
            );
            return;
        }
        if (/^(PASS|ok)$/.test(line)) {
            out.push(['ok', line]);
            return;
        }
        if (/^Process finished/.test(line)) {
            out.push(['c', line]);
            return;
        }
        if (/^\s*#/.test(line)) {
            out.push(['c', line]);
            return;
        }
        let first = true;
        line.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) {
                out.push(['', w]);
                return;
            }
            if (w === '$') {
                out.push(['c', w]);
                return;
            }
            if (first) {
                out.push(['f', w]);
                first = false;
                return;
            }
            if (/^-/.test(w)) out.push(['k', w]);
            else if (/[\/@.]/.test(w)) out.push(['s', w]);
            else out.push(['', w]);
        });
    });
    return out;
}
function tokYaml(code: string): Tok[] {
    const out: Tok[] = [];
    code.split('\n').forEach((line, i) => {
        if (i) out.push(['', '\n']);
        if (/^\s*#/.test(line)) {
            out.push(['c', line]);
            return;
        }
        const mm = line.match(/^(\s*-?\s*)([^:#\n]+?)(:)(\s*)(.*)$/);
        if (!mm) {
            out.push(['', line]);
            return;
        }
        out.push(['', mm[1]], ['t', mm[2]], ['', mm[3]], ['', mm[4]]);
        if (mm[5])
            out.push([
                /^(true|false|True|False|\d+)$/.test(mm[5]) ? 'n' : 's',
                mm[5],
            ]);
    });
    return out;
}
const JS_KW = new Set(
    'import export default from as function return const let var if else for while do switch case break continue new try catch finally throw typeof instanceof in of class extends async await yield this type interface enum implements keyof readonly void delete static satisfies declare namespace'.split(
        ' ',
    ),
);
const JS_LIT = new Set(['null', 'undefined', 'true', 'false', 'NaN']);
const JS_T = new Set(
    'string number boolean any unknown never object Record Partial Pick Exclude Omit Promise Array Object JSON Request Response Function'.split(
        ' ',
    ),
);
function tokJs(code: string): Tok[] {
    const re =
        /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:[^`\\]|\\.)*`|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z0-9_$])/g;
    const out: Tok[] = [];
    let m: RegExpExecArray | null;
    let prevSig = '';
    while ((m = re.exec(code))) {
        const v = m[0];
        if (m[1]) out.push(['c', v]);
        else if (m[2]) out.push(['s', v]);
        else if (m[3]) out.push(['n', v]);
        else if (m[4]) {
            const next =
                (code.slice(re.lastIndex).match(/^[ \t]*(.)/) || [])[1] || '';
            let t = '';
            if (prevSig === '<' || prevSig === '</')
                t = 't'; /* JSX tag / generic */
            else if (JS_KW.has(v)) t = 'k';
            else if (JS_LIT.has(v)) t = 'n';
            else if (JS_T.has(v)) t = 't';
            else if (next === '(') t = 'f';
            else if (/^[A-Z]/.test(v) && prevSig !== '.') t = 't';
            out.push([t, v]);
        } else out.push(['', v]);
        if (!m[5]) prevSig = m[6] && v === '/' && prevSig === '<' ? '</' : v;
    }
    return out;
}
const TOK: Record<string, (code: string) => Tok[]> = {
    go: tokGo,
    sql: tokSql,
    bash: tokBash,
    sh: tokBash,
    shell: tokBash,
    yaml: tokYaml,
    yml: tokYaml,
    js: tokJs,
    jsx: tokJs,
    ts: tokJs,
    tsx: tokJs,
    'diff-ts': tokJs,
};
const LANG: Record<string, string> = {
    go: 'Go',
    sql: 'SQL',
    bash: 'Bash',
    sh: 'Shell',
    shell: 'Shell',
    yaml: 'YAML',
    yml: 'YAML',
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    'diff-ts': 'TypeScript diff',
    text: 'Text',
};

function toLines(tokens: Tok[]) {
    const lines: string[][] = [[]];
    tokens.forEach(([t, v]) => {
        v.split('\n').forEach((piece, i) => {
            if (i) lines.push([]);
            if (!piece) return;
            lines[lines.length - 1].push(
                t ? `<span class="${t}">${esc(piece)}</span>` : esc(piece),
            );
        });
    });
    return lines.map((l) => l.join(''));
}
function parseHl(s: string | undefined | null) {
    const set = new Set<number>();
    if (!s) return set;
    s.split(',').forEach((r) => {
        const [a, b] = r.trim().split('-').map(Number);
        if (!a) return;
        for (let i = a; i <= (b || a); i++) set.add(i);
    });
    return set;
}

export const ICON = {
    file: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 1.75h5.25L12.5 5v9.25H4z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 1.75V5.25h3.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    term: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4.5 6.5 8 3 11.5M8.5 12h4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    snip: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tree: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 2.5v9.5h4M3 7h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><rect x="8.5" y="5" width="5" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="8.5" y="10" width="5" height="4" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>',
    copy: '<svg class="i-copy" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.25" y="5.25" width="8" height="8" rx="1.75" stroke="currentColor" stroke-width="1.2"/><path d="M10.75 3.25v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" stroke="currentColor" stroke-width="1.2"/></svg><svg class="i-ok" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8.5 3.2 3L13 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ne: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5l7-7m0 0H5.5m6 0v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.2"/><path d="M8 7.25v4M8 4.9v.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    warn: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2.2 14.2 13H1.8z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 6.6v3.2M8 11.4v.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    x: '<svg class="tweet__x" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>',
    img: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="10" r="1.8" stroke="currentColor" stroke-width="1.4"/><path d="m4 18 5.5-5 4 3.5L16 14l4 3.5M4 4l16 16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* =====================================================================
   Render context
   ===================================================================== */
type Ctx = {
    feed: boolean;
    slugMap: Record<string, string>;
    levelMap: Record<number, number>;
    ids: Set<string>;
    figures: { key: string; url: string; cloud?: string }[];
    tweetIds: Set<string>;
    stats: {
        code: number;
        images: number;
        tweets: number;
        missing: string[];
        skipped: string[];
    };
    warn: (msg: string) => void;
};
type Block = {
    t: string;
    html: string;
    raw?: string;
    text?: string;
    id?: string;
};

function parseFenceMeta(meta: string) {
    let title = '';
    let m: RegExpMatchArray | null;
    if ((m = meta.match(/filename:\s*["']([^"']+)["']/))) title = m[1];
    else if ((m = meta.match(/title=(?:"([^"]*)"|'([^']*)'|(.+))$/)))
        title = (m[1] || m[2] || m[3] || '').trim();
    const hlm = meta.replace(/\{\{[\s\S]*?\}\}/g, '').match(/\{([\d,\-\s]+)\}/);
    return { title, hl: parseHl(hlm && hlm[1]) };
}
function codeBlock(langRaw: string, meta: string, lines: string[], ctx: Ctx) {
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const code = lines.join('\n');
    const lang = (langRaw || '').toLowerCase();
    const { title, hl } = parseFenceMeta(meta || '');
    if (ctx.feed)
        return `<pre><code${lang ? ` class="language-${attr(lang)}"` : ''}>${esc(code)}</code></pre>`;
    const tree =
        lines.length > 2 &&
        lines.filter((l) => /[├│└]|\|--/.test(l)).length >= lines.length * 0.5;
    const isDiff = lang.startsWith('diff');
    const tok = tree ? null : TOK[lang];
    const html = toLines(tok ? tok(code) : [['', code]]);
    const label = tree
        ? 'Text'
        : LANG[lang] || (lang ? lang.toUpperCase() : 'Text');
    const isFile = /\.[a-z]{1,5}$/i.test(title);
    const icon = tree
        ? ICON.tree
        : isFile
          ? ICON.file
          : /^(bash|sh|shell)$/.test(lang)
            ? ICON.term
            : ICON.snip;
    const name = title || (tree ? 'File tree' : label);
    const ln = html.length > 6;
    const body = html
        .map((l, i) => {
            const cls = ['l'];
            if (hl.has(i + 1)) cls.push('hl');
            if (isDiff && /^\+/.test(lines[i])) cls.push('add');
            else if (isDiff && /^-/.test(lines[i])) cls.push('del');
            return `<span class="${cls.join(' ')}">${l}</span>`;
        })
        .join('');
    ctx.stats.code++;
    return (
        `<figure class="code${ln ? ' code--ln' : ''}" data-lang="${attr(lang || 'text')}" data-lines="${html.length}">` +
        `<figcaption class="code__bar"><span class="code__tab">${icon}<span class="code__name">${esc(name)}</span></span>` +
        `<span class="code__lang mono">${esc(label)}${hl.size ? ` <span class="code__hl">· ${hl.size} lines marked</span>` : ''}</span>` +
        `<button class="code__copy mono" type="button" aria-label="Copy code${title ? ': ' + attr(title) : ''}">${ICON.copy}<span>Copy</span></button></figcaption>` +
        `<div class="code__body"><pre tabindex="0" aria-label="${attr(name)}"><code>${body}</code></pre></div></figure>`
    );
}

/* =====================================================================
   Inline markdown: code spans, links, strong/em, typographic apostrophes
   ===================================================================== */

/* old case-study slugs -> current /work slugs (same table as next.config.ts redirects) */
const WORK_RENAMED: Record<string, string> = {
    'miss-cookie': 'miss-cookie-spices',
    dnaweds: 'desmond-weds-akyeamaa',
    'seven-sports': '7even-sports-group',
};

function linkHref(url: string, ctx: Ctx): { href: string; ext: boolean } {
    let m: RegExpMatchArray | null;
    if (
        (m = url.match(
            /^(?:https?:\/\/(?:www\.)?felixyeboah\.dev)?\/blog\/([\w-]+)\/?(#.*)?$/,
        ))
    ) {
        const slug = ctx.slugMap[m[1]];
        if (slug)
            return {
                href: ctx.feed ? CANON + slug : '/writing/' + slug,
                ext: false,
            };
        ctx.warn(`unknown internal post link ${url}`);
        return {
            href: ctx.feed ? SITE_URL + '/writing' : '/writing',
            ext: false,
        };
    }
    if (
        (m = url.match(
            /^(?:https?:\/\/(?:www\.)?felixyeboah\.dev)?\/case-studies\/?([\w-]*)\/?(#.*)?$/,
        ))
    ) {
        const path = m[1] ? '/work/' + (WORK_RENAMED[m[1]] || m[1]) : '/work';
        return { href: ctx.feed ? SITE_URL + path : path, ext: false };
    }
    if (/^https?:\/\//.test(url)) return { href: url, ext: true };
    if (/^mailto:/.test(url)) return { href: url, ext: false };
    ctx.warn(`relative link kept as-is: ${url}`);
    return { href: url, ext: false };
}
function emph(s: string) {
    s = s.replace(/(\w)'(\w)/g, '$1’$2');
    s = esc(s);
    s = s.replace(
        /\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g,
        '<strong><em>$1</em></strong>',
    );
    s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
    s = s.replace(
        /(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g,
        '$1<strong>$2</strong>',
    );
    s = s.replace(/(^|[^\w*])\*(?=\S)([^*]*?\S)\*(?![\w*])/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^\w])_(?=\S)([^_]*?\S)_(?!\w)/g, '$1<em>$2</em>');
    return s;
}
function inline(src: string, ctx: Ctx) {
    const ph: string[] = [];
    const hold = (h: string) => '\u0001' + (ph.push(h) - 1) + '\u0002';
    let s = src;
    /* code spans (any backtick run length) */
    s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, _t, c: string) =>
        hold(`<code>${esc(c.replace(/^ (.*) $/, '$1'))}</code>`),
    );
    /* images inline (rare) -> just the alt text as a link */
    s = s.replace(
        /!\[([^\]]*)\]\(([^)\s]+)\)/g,
        (_, alt: string, url: string) =>
            hold(
                `<a href="${attr(url)}" target="_blank" rel="noopener">${esc(alt || 'image')}</a>`,
            ),
    );
    /* links (URLs may contain one level of balanced parentheses) */
    s = s.replace(
        /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)/g,
        (_, text: string, url: string) => {
            const { href, ext } = linkHref(url, ctx);
            return hold(
                `<a href="${attr(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${emph(text)}</a>`,
            );
        },
    );
    s = emph(s);
    return s
        .replace(/\u0001(\d+)\u0002/g, (_, i) => ph[+i])
        .replace(/\u0001(\d+)\u0002/g, (_, i) => ph[+i]);
}
const plain = (s: string) =>
    s
        .replace(/`+([^`]*)`+/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');
const stripEmoji = (s: string) =>
    s
        .replace(/^[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\s]+/u, '')
        .replace(
            /[\s\u{FE0F}]*[\p{Extended_Pictographic}][\u{FE0F}\u{200D}\p{Extended_Pictographic}]*\s*$/u,
            '',
        )
        .trim();
const slugify = (s: string) =>
    s
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'section';
/** text content of a rendered inline HTML fragment (what the browser's textContent would give) */
const textOf = (html: string) =>
    html
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

/* =====================================================================
   Block parser (recursive; containers: Callout, Info, blockquote, list items)
   ===================================================================== */
const RE_FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w+#.-]*)\s*(.*)$/;
const RE_HEAD = /^(#{1,6})(?:\s+(.*?))?\s*#*\s*$/;
const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_HR = /^\s*(?:-\s*){3,}$|^\s*(?:\*\s*){3,}$|^\s*(?:_\s*){3,}$/;
const RE_IMG = /^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/;
const RE_JSX = /^\s*<([A-Z][A-Za-z0-9]*)\b/;

function isFence(line: string) {
    const m = line.match(RE_FENCE);
    return !!m && !/`{3}/.test(m[4]);
}
function blockStart(line: string, inPara: boolean) {
    if (
        isFence(line) ||
        RE_HEAD.test(line) ||
        RE_HR.test(line) ||
        RE_IMG.test(line) ||
        RE_JSX.test(line) ||
        /^\s*>/.test(line)
    )
        return true;
    const lm = line.match(RE_LIST);
    if (lm) return !inPara || !/^\d/.test(lm[2]) || /^1[.)]$/.test(lm[2]);
    return false;
}
function parseAttrs(s: string) {
    const a: Record<string, string> = {};
    let m: RegExpExecArray | null;
    const re = /([A-Za-z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
    while ((m = re.exec(s)))
        a[m[1]] =
            m[2] != null
                ? m[2]
                : m[3] != null
                  ? m[3]
                  : String(m[4])
                        .trim()
                        .replace(/^["']|["']$/g, '');
    return a;
}
function tagEnd(s: string, from: number) {
    let q: string | null = null,
        depth = 0;
    for (let k = from; k < s.length; k++) {
        const c = s[k];
        if (q) {
            if (c === q) q = null;
            continue;
        }
        if (c === '"' || c === "'") q = c;
        else if (c === '{') depth++;
        else if (c === '}') depth--;
        else if (c === '>' && depth <= 0) return k;
    }
    return -1;
}
function dedent(lines: string[]) {
    const ind = Math.min(
        ...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length),
        99,
    );
    return lines.map((l) => l.slice(Math.min(ind, l.match(/^\s*/)![0].length)));
}

function renderBlocks(src: string, ctx: Ctx, depth: number): Block[] {
    const L = src.split('\n');
    const out: Block[] = [];
    let i = 0,
        para: string[] = [];
    const flush = () => {
        if (!para.length) return;
        const raw = para.join('\n').trim();
        para = [];
        if (!raw) return;
        out.push({
            t: 'p',
            raw,
            html: `<p>${inline(raw.replace(/[ \t]*\n[ \t]*/g, ' '), ctx)}</p>`,
        });
    };
    while (i < L.length) {
        const line = L[i];
        let m: RegExpMatchArray | null;
        /* fenced code */
        if ((m = line.match(RE_FENCE)) && !/`{3}/.test(m[4])) {
            flush();
            const fch = m[2][0],
                flen = m[2].length,
                indent = m[1].length;
            const close = new RegExp(
                '^\\s*' + (fch === '`' ? '`' : '~') + '{' + flen + ',}\\s*$',
            );
            const buf: string[] = [];
            i++;
            while (i < L.length && !close.test(L[i])) {
                buf.push(
                    indent
                        ? L[i].replace(new RegExp('^ {0,' + indent + '}'), '')
                        : L[i],
                );
                i++;
            }
            i++;
            out.push({ t: 'code', html: codeBlock(m[3], m[4], buf, ctx) });
            continue;
        }
        /* blank */
        if (!line.trim()) {
            flush();
            i++;
            continue;
        }
        /* headings */
        if ((m = line.match(RE_HEAD))) {
            flush();
            i++;
            const text = stripEmoji((m[2] || '').trim());
            if (!text) {
                ctx.stats.skipped.push('empty heading');
                continue;
            }
            const lvl = ctx.levelMap[m[1].length] || Math.min(4, m[1].length);
            let id = slugify(plain(text));
            while (ctx.ids.has(id)) id += '-2';
            ctx.ids.add(id);
            const inner = inline(text, ctx);
            out.push({
                t: 'h' + lvl,
                html: `<h${lvl} id="${id}">${inner}</h${lvl}>`,
                text: textOf(inner),
                id,
            });
            continue;
        }
        /* hr */
        if (RE_HR.test(line)) {
            flush();
            out.push({ t: 'hr', html: '<hr>' });
            i++;
            continue;
        }
        /* standalone markdown image */
        if ((m = line.match(RE_IMG))) {
            flush();
            out.push({
                t: 'figure',
                html: figure({ src: m[2], alt: m[1], caption: m[3] }, ctx),
            });
            i++;
            continue;
        }
        /* JSX components */
        if ((m = line.match(RE_JSX))) {
            flush();
            const tag = m[1];
            /* collect the opening tag (may span lines; quote- and brace-aware) */
            let open = line,
                j = i;
            const from = open.indexOf('<' + tag) + tag.length + 1;
            let end = tagEnd(open, from);
            while (end === -1 && j + 1 < L.length && j - i < 40) {
                j++;
                open += '\n' + L[j];
                end = tagEnd(open, from);
            }
            if (end === -1) {
                ctx.warn(`unterminated <${tag}> tag kept as text`);
                para.push(line.replace(/</g, '‹'));
                i++;
                flush();
                continue;
            }
            const selfClose = open[end - 1] === '/';
            const attrs = parseAttrs(
                open.slice(from, selfClose ? end - 1 : end),
            );
            const headEnd = end;
            let inner = '';
            if (selfClose) {
                i = j + 1;
                const rest = open.slice(end + 1).trim();
                if (rest) {
                    out.push(component(tag, attrs, '', ctx, depth));
                    para.push(rest);
                    flush();
                    continue;
                }
            } else {
                const after = open.slice(headEnd + 1);
                const sameLineClose = after.indexOf('</' + tag + '>');
                if (sameLineClose !== -1) {
                    inner = after.slice(0, sameLineClose);
                    i = j + 1;
                } else {
                    const buf = after.trim() ? [after] : [];
                    let k = j + 1,
                        depthTag = 1;
                    while (k < L.length) {
                        const lk = L[k];
                        if (
                            new RegExp('^\\s*<' + tag + '\\b(?![^>]*/>)').test(
                                lk,
                            )
                        )
                            depthTag++;
                        const ci = lk.indexOf('</' + tag + '>');
                        if (ci !== -1 && --depthTag === 0) {
                            if (lk.slice(0, ci).trim())
                                buf.push(lk.slice(0, ci));
                            break;
                        }
                        buf.push(lk);
                        k++;
                    }
                    if (k >= L.length)
                        ctx.warn(
                            `unclosed <${tag}>, rendered to the end of the post`,
                        );
                    inner = dedent(buf).join('\n');
                    i = k + 1;
                }
            }
            out.push(component(tag, attrs, inner, ctx, depth));
            continue;
        }
        /* blockquote */
        if (/^\s*>/.test(line)) {
            flush();
            const buf: string[] = [];
            while (
                i < L.length &&
                L[i].trim() &&
                (/^\s*>/.test(L[i]) || !blockStart(L[i], true))
            ) {
                buf.push(L[i].replace(/^\s*>\s?/, ''));
                i++;
            }
            const inner = renderBlocks(buf.join('\n'), ctx, depth + 1)
                .map((b) => b.html)
                .join('');
            out.push({
                t: 'blockquote',
                html: `<blockquote>${inner}</blockquote>`,
                raw: buf.join(' '),
            });
            continue;
        }
        /* lists */
        if ((m = line.match(RE_LIST)) && blockStart(line, para.length > 0)) {
            flush();
            const ordered = /^\d/.test(m[2]);
            const base = m[1].length;
            const start = ordered ? parseInt(m[2], 10) : 1;
            const items: string[][] = [];
            let cur: string[] | null = null;
            while (i < L.length) {
                const ln = L[i],
                    lm = ln.match(RE_LIST);
                if (
                    lm &&
                    lm[1].length <= base + 1 &&
                    /^\d/.test(lm[2]) === ordered
                ) {
                    cur = [lm[3]];
                    items.push(cur);
                    i++;
                    continue;
                }
                if (!ln.trim()) {
                    let k = i + 1;
                    while (k < L.length && !L[k].trim()) k++;
                    const nl = L[k] || '',
                        nm = nl.match(RE_LIST);
                    if (
                        k < L.length &&
                        ((nm &&
                            nm[1].length <= base + 1 &&
                            /^\d/.test(nm[2]) === ordered) ||
                            nl.match(/^\s*/)![0].length > base + 1)
                    ) {
                        cur!.push('');
                        i++;
                        continue;
                    }
                    break;
                }
                const indent = ln.match(/^\s*/)![0].length;
                if (indent > base + 1) {
                    cur!.push(ln.slice(Math.min(indent, base + 2)));
                    i++;
                    continue;
                }
                if (!blockStart(ln, true) && cur![cur!.length - 1].trim()) {
                    cur!.push(ln.trim());
                    i++;
                    continue;
                } /* lazy continuation */
                break;
            }
            const lis = items
                .map((it) => {
                    const text = it.join('\n').replace(/\s+$/, '');
                    const simple = !it
                        .slice(1)
                        .some(
                            (l) => RE_LIST.test(l) || isFence(l) || !l.trim(),
                        );
                    if (simple)
                        return `<li>${inline(text.replace(/[ \t]*\n[ \t]*/g, ' '), ctx)}</li>`;
                    const blocks = renderBlocks(text, ctx, depth + 1);
                    const html =
                        blocks.length === 1 && blocks[0].t === 'p'
                            ? blocks[0].html.slice(3, -4)
                            : blocks.map((b) => b.html).join('');
                    return `<li>${html}</li>`;
                })
                .join('');
            const tagName = ordered ? 'ol' : 'ul';
            out.push({
                t: tagName,
                html: `<${tagName}${ordered && start !== 1 ? ` start="${start}"` : ''}>${lis}</${tagName}>`,
            });
            continue;
        }
        /* raw HTML-ish line starting with a lowercase tag: keep the text, escaped */
        para.push(line);
        i++;
        /* a paragraph ends where another block starts */
        while (i < L.length && L[i].trim() && !blockStart(L[i], true)) {
            para.push(L[i]);
            i++;
        }
        flush();
    }
    flush();
    return out;
}

export function calloutHTML(
    variant: string,
    label: string | undefined,
    innerHTML: string,
) {
    const warn = variant === 'warning' || variant === 'danger';
    const lab = label || (warn ? 'Warning' : 'Info');
    return `<aside class="callout callout--${warn ? 'warning' : 'info'}" role="note"><p class="callout__label mono">${warn ? ICON.warn : ICON.info}${esc(lab)}</p>${innerHTML}</aside>`;
}
function component(
    tag: string,
    a: Record<string, string>,
    inner: string,
    ctx: Ctx,
    depth: number,
): Block {
    const kids = () => renderBlocks(inner, ctx, depth + 1);
    switch (tag) {
        case 'Info':
        case 'Warn':
        case 'Callout': {
            const variant = tag === 'Warn' ? 'warning' : a.variant || 'info';
            const blocks = kids();
            if (ctx.feed)
                return {
                    t: 'callout',
                    html: `<blockquote>${a.label ? `<p><strong>${esc(a.label)}</strong></p>` : ''}${blocks.map((b) => b.html).join('')}</blockquote>`,
                };
            return {
                t: 'callout',
                html: calloutHTML(
                    variant,
                    a.label,
                    blocks.map((b) => b.html).join(''),
                ),
            };
        }
        case 'Image':
            return {
                t: 'figure',
                html: figure(
                    {
                        cloud: a.src,
                        alt: a.alt || '',
                        caption: a.caption || a.alt || '',
                    },
                    ctx,
                ),
            };
        case 'StaticTweet':
            return { t: 'tweet', html: tweetCard(a.id, ctx) };
        default: {
            ctx.warn(
                `unknown component <${tag}>: children rendered, wrapper dropped`,
            );
            ctx.stats.skipped.push('<' + tag + '>');
            const blocks = inner ? kids() : [];
            return { t: 'unknown', html: blocks.map((b) => b.html).join('') };
        }
    }
}

function figure(
    f: { cloud?: string; src?: string; alt: string; caption?: string },
    ctx: Ctx,
) {
    let src: string, key: string, w: number, h: number;
    let srcset = '';
    if (f.cloud) {
        key = 'fig:' + f.cloud;
        src = cld(f.cloud, 1400, 'c_limit');
        const rec = images[key] || {};
        w = rec.w ? Math.min(rec.w, 1400) : 1400;
        h = rec.w ? Math.round(((rec.h || 0) * w) / rec.w) : 885;
        srcset = ` srcset="${attr(cld(f.cloud, 700, 'c_limit'))} 700w, ${attr(src)} 1400w" sizes="(max-width: 760px) 92vw, 680px"`;
    } else {
        key = 'fig:' + f.src;
        src = f.src || '';
        const rec = images[key] || {};
        w = rec.w || 1400;
        h = rec.h || 885;
    }
    ctx.figures.push({ key, url: src, cloud: f.cloud });
    const caption = f.caption || f.alt;
    if (ctx.feed)
        return imageOk(key)
            ? `<figure><img src="${attr(absUrl(src))}" alt="${attr(f.alt)}">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`
            : caption
              ? `<p><em>[Image: ${esc(caption)}]</em></p>`
              : '';
    if (!imageOk(key)) {
        ctx.stats.missing.push(f.cloud || f.src || '');
        return `<figure class="figure figure--missing"><div class="figure__frame" role="img" aria-label="${attr(f.alt ? 'Image no longer available: ' + f.alt : 'Image no longer available')}">${ICON.img}<span>Image no longer available</span></div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
    }
    ctx.stats.images++;
    return `<figure class="figure"><div class="figure__frame"><img src="${attr(src)}"${srcset} width="${w}" height="${h}" alt="${attr(f.alt)}" loading="lazy" decoding="async"></div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}

function tweetText(t: Tweet) {
    let html = esc(t.text);
    (t.links || []).forEach((l) => {
        html = html
            .split(esc(l.url))
            .join(
                `<a href="${attr(l.expanded)}" target="_blank" rel="noopener">${esc(l.display)}</a>`,
            );
    });
    return html
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
}
function tweetCard(id: string | undefined, ctx: Ctx) {
    if (!id) {
        ctx.stats.skipped.push('StaticTweet without id');
        return '';
    }
    ctx.tweetIds.add(id);
    const t = tweets[id];
    const url =
        t && t.handle
            ? `https://x.com/${t.handle}/status/${id}`
            : `https://x.com/i/status/${id}`;
    if (ctx.feed)
        return t
            ? `<blockquote><p><strong>${esc(t.name)}</strong> (@${esc(t.handle)})</p>${tweetText(t)}<p><a href="${attr(url)}">View on X</a></p></blockquote>`
            : `<p><a href="${attr(url)}">View the post on X</a></p>`;
    ctx.stats.tweets++;
    if (!t) {
        return (
            `<figure class="tweet"><div class="tweet__head"><span class="tweet__av" aria-hidden="true">X</span><span class="tweet__who"><b>A post on X</b><span>Embedded post</span></span>${ICON.x}</div>` +
            `<figcaption class="tweet__foot"><span>Open the original post</span><a class="link-arrow link-arrow--ne" href="${attr(url)}" target="_blank" rel="noopener">View on X ${ICON.ne}</a></figcaption></figure>`
        );
    }
    const d = new Date(t.date);
    const initial =
        Array.from(
            (t.name || t.handle || 'X').replace(/[^\p{L}\p{N}]/gu, ''),
        )[0] || 'X';
    return (
        `<figure class="tweet"><div class="tweet__head"><span class="tweet__av" aria-hidden="true">${esc(initial.toUpperCase())}</span><span class="tweet__who"><b>${esc(t.name)}</b><span>@${esc(t.handle)}</span></span>${ICON.x}</div>` +
        `<blockquote cite="${attr(url)}">${tweetText(t)}</blockquote>` +
        `<figcaption class="tweet__foot"><time datetime="${isoDate(d)}">${fmtDate(d)}</time><a class="link-arrow link-arrow--ne" href="${attr(url)}" target="_blank" rel="noopener">View on X ${ICON.ne}</a></figcaption></figure>`
    );
}

/* rank-based heading map: the levels a post actually uses become h2, h3, h4 (h1 is the title) */
function headingLevels(body: string) {
    const used = new Set<number>();
    let inFence = false;
    body.split('\n').forEach((l) => {
        if (isFence(l)) {
            inFence = !inFence;
            return;
        }
        const m = !inFence && l.match(RE_HEAD);
        if (m && (m[2] || '').trim()) used.add(m[1].length);
    });
    const map: Record<number, number> = {};
    [...used].sort().forEach((lv, k) => {
        map[lv] = Math.min(2 + k, 4);
    });
    return map;
}

function pullHTML(p: NonNullable<Editorial['pull']>) {
    return `<figure class="pull" aria-hidden="true" data-reveal><svg class="pull__mark" viewBox="0 0 44 44" fill="none"><path d="M8 30c0-8 4-14 11-17l1.5 2.6C16 18 14 21.4 14 25h6v11H8v-6Zm18 0c0-8 4-14 11-17l1.5 2.6C34 18 32 21.4 32 25h6v11H26v-6Z" fill="currentColor"/></svg><blockquote><p>${esc(p.ink)}<span class="pull__rest">${esc(p.rest)}</span></p></blockquote></figure>`;
}

/** old-folder-name and current slug -> current slug, for /blog/<x> links */
export function slugMapOf(posts: PostMeta[]) {
    const map: Record<string, string> = Object.fromEntries(
        posts.map((p) => [p.dir, p.slug]),
    );
    posts.forEach((p) => {
        map[p.slug] = p.slug;
    });
    return map;
}

export type TocItem = { id: string; n: string; t: string };
export type Rendered = {
    /** the body HTML (blocks joined by newlines, exactly like the prototype) */
    html: string;
    /** the post opens on a paragraph (drop cap) */
    firstIsPara: boolean;
    /** top-level h2s, in order: the mini TOC (shown with two or more) */
    toc: TocItem[];
    warnings: string[];
};

export function renderPost(
    post: PostMeta,
    all: PostMeta[],
    opts: { feed?: boolean } = {},
): Rendered {
    const warnings: string[] = [];
    const ctx: Ctx = {
        feed: !!opts.feed,
        slugMap: slugMapOf(all),
        levelMap: headingLevels(post.body),
        ids: new Set(['article-body', 'post-title', 'main', 'top']),
        figures: [],
        tweetIds: new Set(),
        stats: { code: 0, images: 0, tweets: 0, missing: [], skipped: [] },
        warn: (msg) => warnings.push(msg),
    };
    const blocks = post.body ? renderBlocks(post.body, ctx, 0) : [];
    const html: string[] = [];
    const ed = editorialFor(post);
    if (ed.note)
        html.push(
            ctx.feed
                ? `<p><em>${esc(ed.note.label)}: ${esc(ed.note.text)}</em></p>`
                : calloutHTML(
                      'info',
                      ed.note.label,
                      `<p>${esc(ed.note.text)}</p>`,
                  ),
        );
    let pullPlaced = false;
    blocks.forEach((b) => {
        html.push(b.html);
        if (
            !ctx.feed &&
            ed.pull &&
            !pullPlaced &&
            b.t === 'p' &&
            b
                .raw!.replace(/'/g, '’')
                .startsWith(ed.pull.after.replace(/'/g, '’'))
        ) {
            html.push(pullHTML(ed.pull));
            pullPlaced = true;
        }
    });
    if (!ctx.feed && ed.pull && !pullPlaced)
        warnings.push('pull quote anchor not found: ' + ed.pull.after);
    const firstIsPara = !ed.note && blocks.length > 0 && blocks[0].t === 'p';
    const toc = blocks
        .filter((b) => b.t === 'h2')
        .map((b, i) => ({
            id: b.id!,
            n: (i + 1 < 10 ? '0' : '') + (i + 1),
            t: b.text!,
        }));
    return { html: html.join('\n'), firstIsPara, toc, warnings };
}

/** Render an inline markdown fragment (the cover credit line) to HTML. */
export function inlineHTML(src: string, all: PostMeta[]) {
    const ctx: Ctx = {
        feed: false,
        slugMap: slugMapOf(all),
        levelMap: {},
        ids: new Set(),
        figures: [],
        tweetIds: new Set(),
        stats: { code: 0, images: 0, tweets: 0, missing: [], skipped: [] },
        warn: () => {},
    };
    return inline(src, ctx);
}

/* =====================================================================
   Page-level helpers (dek, related, short note, credit)
   ===================================================================== */
export function splitDek(p: PostMeta): [string, string] {
    const ed = editorialFor(p);
    if (Array.isArray(ed.dek))
        return [ed.dek[0].trim(), ed.dek[1] ? ' ' + ed.dek[1].trim() : ''];
    let s = (typeof ed.dek === 'string' ? ed.dek : p.subtitle)
        .trim()
        .replace(/(\w)'(\w)/g, '$1’$2');
    if (!s) return ['', ''];
    if (!/[.!?”"]$/.test(s)) s += '.';
    const sm = s.match(/^(.+?[.!?])\s+(.+)$/);
    if (sm) return [sm[1], ' ' + sm[2]];
    if (s.length > 64) {
        const c = s.indexOf(', ');
        if (c > 20 && c < s.length - 20)
            return [s.slice(0, c + 1), s.slice(c + 1)];
    }
    return [s, ''];
}
export const dekText = (p: PostMeta) => {
    const [a, b] = splitDek(p);
    return (a + b).replace(/\s+/g, ' ').trim();
};

export function related(
    p: PostMeta,
    all: PostMeta[],
    prev: PostMeta | null,
    next: PostMeta | null,
) {
    const pool = all.filter((q) => q !== p);
    const shared = (q: PostMeta) =>
        q.categories.filter((c) => p.categories.includes(c)).length;
    const specific = (q: PostMeta) =>
        p.categories.length > 1 &&
        q.categories.includes(p.categories[p.categories.length - 1])
            ? 1
            : 0;
    const adj = (q: PostMeta) => (q === prev || q === next ? 1 : 0);
    return pool
        .slice()
        .sort(
            (a, b) =>
                specific(b) - specific(a) ||
                shared(b) - shared(a) ||
                adj(a) - adj(b) ||
                b.date.getTime() - a.date.getTime(),
        )
        .slice(0, 3);
}

export const isShortNote = (p: PostMeta) =>
    !!editorialFor(p).shortNote || !p.body.trim();

/** The "Short note" callout (links every Go post), placed above a summary-only body. */
export function shortNoteHTML(p: PostMeta, all: PostMeta[]) {
    const go = all
        .filter((q) => q !== p && q.categories.includes('go'))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    const links = go.map(
        (q) => `<a href="/writing/${q.slug}">${esc(q.title)}</a>`,
    );
    const more = links.length
        ? ` For the longer story of learning Go through real projects, read ${links.length > 1 ? links.slice(0, -1).join(', ') + ' and ' + links[links.length - 1] : links[0]}.`
        : '';
    return calloutHTML(
        'info',
        'Short note',
        `<p>This post is a short note: the summary above is the whole entry.${more}</p>`,
    );
}

export function creditHTML(credit: string, all: PostMeta[]) {
    if (!credit) return '';
    const s = /^(photo|image|illustration)\b/i.test(credit)
        ? credit
        : 'Image: ' + credit;
    return inlineHTML(s, all);
}

/** The post-end block. It lives inside .prose (the CSS styles `.prose > p:has(+ .post-end)`), so it is
    appended to the body HTML rather than rendered as a React sibling. */
export function postEndHTML(p: PostMeta) {
    const url = CANON + p.slug;
    const tags = p.categories
        .map(
            (c) =>
                `<a class="chip" href="/writing?cat=${encodeURIComponent(c)}">${esc(catLabel(c))}</a>`,
        )
        .join('');
    return `    <footer class="post-end">
      <div class="post-end__tags"><span class="mono">Filed under</span>${tags}</div>
      <div class="post-end__share mono">
        <a class="link-arrow link-arrow--ne" href="https://x.com/intent/post?text=${encodeURIComponent(p.title)}&amp;url=${encodeURIComponent(url)}&amp;via=sudocode_" target="_blank" rel="noopener">Share on X ${ICON.ne}</a>
        <button class="link-arrow" type="button" data-copy="${attr(url)}" data-copy-toast="Link copied to clipboard">Copy link</button>
      </div>
    </footer>`;
}

/* =====================================================================
   RSS 2.0 (same document as the prototype's writing/feed.xml)
   ===================================================================== */
const rfc822 = (d: Date) => d.toUTCString().replace('GMT', '+0000');
const xmlEsc = (s: unknown) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
const cdata = (s: string) =>
    '<![CDATA[' + String(s).split(']]>').join(']]]]><![CDATA[>') + ']]>';

export function feedXML(posts: PostMeta[]) {
    const items = posts
        .map((p) => {
            const url = CANON + p.slug;
            const r = renderPost(p, posts, { feed: true });
            const cover =
                p.cover && imageOk('cover:' + p.cover)
                    ? `<p><img src="${absUrl(cld(p.cover, 1600))}" alt="${attr(p.bannerAlt)}"></p>\n`
                    : '';
            const note = isShortNote(p) ? `<p>${esc(dekText(p))}</p>` : '';
            return `    <item>
      <title>${xmlEsc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <dc:creator>Felix Yeboah</dc:creator>
${p.categories.map((c) => `      <category>${xmlEsc(catLabel(c))}</category>`).join('\n')}
      <description>${xmlEsc(dekText(p))}</description>
      <content:encoded>${cdata(cover + note + r.html)}</content:encoded>
    </item>`;
        })
        .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Felix Yeboah: Writing</title>
    <link>${SITE_URL}/writing</link>
    <description>Notes from the work: engineering, Remix, Go, and the occasional year in review. By Felix Yeboah, a software engineer and designer in Accra.</description>
    <language>en</language>
    <atom:link href="${CANON}feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>
    <managingEditor>me@felixyeboah.dev (Felix Yeboah)</managingEditor>
    <image><url>${cld(AUTHOR_IMG, 144, 'c_fill,h_144')}</url><title>Felix Yeboah: Writing</title><link>${SITE_URL}/writing</link></image>
${items}
  </channel>
</rss>
`;
}
