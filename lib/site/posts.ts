import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/* =====================================================================
   Blog posts: content/blog/<dir>/index.mdx (real frontmatter), newest first.
   Ported from design-options/tools/sitebuild/writing_pages.js (loadPosts) so slugs, titles and
   reading times match the prototype exactly. Editorial overrides (renamed slug/title, deks,
   pull quotes, notes) live in EDITORIAL, keyed by folder name. Body rendering: post-render.ts.
   ===================================================================== */

const BLOG = join(process.cwd(), 'content/blog');

export const CAT: Record<string, string> = {
    engineering: 'Engineering',
    design: 'Design',
    remix: 'Remix',
    go: 'Go',
    react: 'React',
    javascript: 'JavaScript',
    frameworks: 'Frameworks',
    review: 'Review',
    family: 'Family',
    health: 'Health',
};
export const CAT_ORDER = Object.keys(CAT);
export const catLabel = (c: string) => CAT[c] || c.charAt(0).toUpperCase() + c.slice(1);

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDate = (d: Date) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
/** "05 Mar 2024" (strftime %d %b %Y), used by the writing index rows */
export const fmtDate2 = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const fmtMonth = (d: Date) => `${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Cloudinary URL for an image id. Local paths ("/assets/...", served from public/) pass through unchanged. */
export const cld = (id: string, w: number, extra?: string) =>
    id.startsWith('/')
        ? id
        : `https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto${extra ? ',' + extra : ''},w_${w}/${encodeURI(id)}`;

export type Editorial = {
    slug?: string;
    title?: string;
    /** [ink part, muted part] or a single string (auto-split) */
    dek?: string | [string, string];
    pull?: { after: string; ink: string; rest: string };
    note?: { label: string; text: string };
    /** the body is only a summary: render the "Short note" callout (linking the Go posts) above it */
    shortNote?: boolean;
};

/* Editorial layer, verbatim from design-options/tools/sitebuild/writing_pages.js. Everything here is either
   verbatim from the post or a one-line dek written from the post's own intro (only where the frontmatter
   subtitle belongs to another post). dek: [ink part, muted part] or a string (auto-split). pull: verbatim
   sentence, placed after the paragraph whose source text starts with `after`. note: callout at the top of the body. */
export const EDITORIAL: Record<string, Editorial> = {
    'why-i-built-primeflow-a-developers-reaction-to-a-real-problem': {
        slug: 'why-i-built-reevit',
        title: 'Why I Built Reevit: A Developer’s Reaction to a Real Problem',
        dek: [
            'It began with an e-commerce app for a client selling natural spice products,',
            'and a payment webhook that sometimes fired and sometimes went total silence.',
        ],
        note: { label: 'Editor’s note', text: 'Primeflow has since been renamed Reevit. The post below keeps its original wording.' },
        pull: { after: 'Inspired by the enterprise architectures', ink: 'It was a painful amount of work', rest: ' for something that should’ve been simple.' },
    },
    'mock-testing-with-go-mockery': {
        dek: [
            'Mocking the interfaces SQLC generates with Mockery,',
            'so the repository and HTTP handler of a Go e-commerce API can be tested in isolation.',
        ],
        pull: {
            after: 'I noticed you’re overwhelmed',
            ink: 'Is this a lot to take in? Yes, it is!',
            rest: ' But it’s also super important to test your code thoroughly.',
        },
    },
    'transitioning-to-backend-engineering': {
        dek: ['After years as a frontend engineer, I picked Go', 'for its speed and performance, and started the move to backend engineering.'],
        pull: {
            after: 'As I mentioned earlier, I chose Go',
            ink: 'I know I’m still a total newbie,',
            rest: ' having only used Go for a few months, but I feel like I’ve made the right choice.',
        },
    },
    'migrating-a-project-from-legacy-routes-to-typesafe-named-routes': {
        dek: ['How Complete Farmer’s Grower Dashboard moved to TypeScript', 'and replaced its sprawling legacy routes with type-safe named routes.'],
    },
    'understanding-the-call-apply-and-bind-functions-in-javascript': {
        dek: [
            'JavaScript provides three powerful functions - call, apply, and bind,',
            ' that allow you to manipulate the context (this value) of a function and pass arguments to it.',
        ],
    },
    'my-2021-in-review': {
        dek: ['I had set goals and made plans for how 2021 would unfold,', 'but as the year progressed, not everything went according to plan.'],
    },
    'reusable-form-hook-with-remix-hook-form': {
        dek: ['One custom hook around Remix Hook Form and Zod,', 'so every form in the app doesn’t have to wire the library up on its own.'],
    },
    'how-i-got-here-pt-1-the-childhood': {
        dek: ['One thing I haven’t spoken much about is how I got here.', 'How did I get here?'],
        pull: { after: 'It all began with my parents', ink: 'For every step I take forward,', rest: ' it feels like I’m forced three steps backward.' },
    },
    'how-i-got-here-pt-2-the-software-development-journey': {
        pull: { after: 'Day by day, I practiced relentlessly', ink: 'Sleep became secondary', rest: ' to my thirst for knowledge.' },
    },
    'how-i-got-here-pt-3-the-love-life': {
        pull: { after: 'As I navigate through life', ink: 'Love has the ability to heal,', rest: ' inspire, and bring people together.' },
    },
    '2023-mid-year-review': {
        pull: {
            after: 'As I try to move on from the past',
            ink: 'As I try to move on from the past,',
            rest: ' I am learning to be more forgiving of myself and to accept my mistakes as part of my journey.',
        },
    },
    'my-2024-in-review': {
        pull: { after: 'October brought us all back', ink: 'Look, I won’t sugarcoat it', rest: ' - this wasn’t my easiest year.' },
    },
    'how-to-think-in-remix': {
        pull: {
            after: 'During the development of a recent project',
            ink: 'I realized the need to unlearn some of my established practices',
            rest: ' and embrace new ways of thinking.',
        },
    },
};

/** Editorial overrides for a post (by folder name). */
export const editorialFor = (p: { dir: string }): Editorial => EDITORIAL[p.dir] || {};

export type PostMeta = {
    dir: string;
    slug: string;
    title: string;
    subtitle: string;
    date: Date;
    updated: Date | null;
    categories: string[];
    cover: string;
    bannerAlt: string;
    bannerCredit: string;
    body: string;
    words: number;
    minutes: number;
};

function unquote(v: string) {
    v = v.trim();
    if (v.length > 1 && (v[0] === '"' || v[0] === "'") && v[v.length - 1] === v[0]) v = v.slice(1, -1);
    return v;
}

function parseFrontmatter(raw: string) {
    const m = raw.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
    if (!m) return { fm: {} as Record<string, string>, categories: [] as string[], body: raw };
    const head = m[1];
    const fm: Record<string, string> = {};
    head.split('\n').forEach((line) => {
        const mm = line.match(/^([A-Za-z][\w]*):\s*(.*)$/);
        if (mm && mm[2] !== '' && !mm[2].startsWith('[')) fm[mm[1]] = unquote(mm[2]);
    });
    const cm = head.match(/^categories:\s*\[([\s\S]*?)\]/m);
    const categories = cm
        ? cm[1]
              .split(',')
              .map((s) => unquote(s))
              .filter(Boolean)
        : [];
    return { fm, categories, body: raw.slice(m[0].length) };
}

/* Python's round() (half to even), so reading times match the prototype */
function pyRound(x: number) {
    const f = Math.floor(x),
        d = x - f;
    if (d > 0.5) return f + 1;
    if (d < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
}

let cache: PostMeta[] | null = null;

export function getPosts(): PostMeta[] {
    if (cache && process.env.NODE_ENV === 'production') return cache;
    const dirs = readdirSync(BLOG)
        .filter((d) => existsSync(join(BLOG, d, 'index.mdx')))
        .sort();
    const posts = dirs.map((dir) => {
        const raw = readFileSync(join(BLOG, dir, 'index.mdx'), 'utf8').replace(/\r/g, '');
        const { fm, categories, body } = parseFrontmatter(raw);
        const ed = EDITORIAL[dir] || {};
        const wordsBody = raw.split(/^---$/m).slice(2).join('---').trim();
        const words = wordsBody ? wordsBody.split(/\s+/).filter(Boolean).length : 0;
        const date = new Date(fm.date);
        const updated = fm.updated ? new Date(fm.updated) : null;
        return {
            dir,
            slug: ed.slug || dir,
            title: ed.title || fm.title,
            subtitle: fm.subtitle || '',
            date,
            updated: updated && isoDate(updated) !== isoDate(date) ? updated : null,
            categories,
            cover: fm.cover || '',
            bannerAlt: fm.bannerAlt || '',
            bannerCredit: fm.bannerCredit || '',
            body: body.replace(/^\s+|\s+$/g, ''),
            words,
            minutes: words ? Math.max(1, pyRound(words / 230)) : 0,
        };
    });
    posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    cache = posts;
    return posts;
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
