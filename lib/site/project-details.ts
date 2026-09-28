/* =====================================================================
   Project pages (/work/<slug>): per-project case-study content + theme.
   Port of design-options/tools/sitebuild/work_pages.py (DATA + THEMES, themes resolved to the exact
   colours the prototype shipped, after its WCAG AA nudges). Order, names, categories, URLs, covers and
   short descriptions live in projects.ts; the template is app/work/[slug]/.

   One template, every block optional. The page renders, in this order, whatever a project has:

     hero        always: breadcrumb, kicker (category · Year credit · status), title, tagline, credits, stage
     brief       (NN) The brief in one line: statement + up to three story columns (A/B/C)
     chapters    (NN) alternating text/screenshot rows (cropped 2160x1350 screens)
     compose     (NN) desktop frame + phone (the "mobile" block): 2160x1350 desktop, 780x1688 phone
     diagram     (NN) a bespoke diagram component (kind: 'reevit-route'); absorbs `notes` when both exist
     notes       (NN) numbered cards + optional chip row (only as its own section when there is no diagram)
     gallery     (NN) grid of framed images (Cloudinary id OR local src)
     facts       (NN) big numbers + optional status panel
     quote       pull quote (unnumbered)
     next        always: next project tile (wraps 15 -> 1), then "All work"
   (NN) = section number, counted over the blocks actually present.

   Field reference (all optional unless marked *):
     rich          true = a full write-up; only changes the <title>: "Name: Case study" vs "Name: <category>"
     description   meta description (default: the project's desc from projects.ts)
     theme*        resolved colours -> --p-* custom properties on <main class="case">. tone 'light' = light hero band
                   (also sets html[data-case-tone="light"] for the nav). heroAccent is what the band's accents use.
     tagline*      'ink' or ['ink', 'muted'] (muted part renders softer). Long (> 70 chars) -> .is-long
     formerly      "Formerly X" line under the tagline
     status        live pill in the kicker (e.g. 'Live')
     credits       [{ k, v, note? }]. Default: [{ k: 'Category', v: category }]. A 'Year' credit also shows in
                   the kicker. A "Live" row (the project URL) is always appended.
     stage         hero screenshot. Defaults: src = cover (1600x1000), url = domain, cap = ['<domain> · homepage', ''].
                   alt* always.
     brief         { statement*, muted?, story?: [{ h*, body?: Rich[], list?: [{ b?, t* }] }] }
     chapters      { label*, title*, aside* (lines), items*: [{ label, title, body, chips?, broad?, src, url,
                   crop?: [x, y, w, h] (fractions of the 2160x1350 image, default whole image), alt, cap, note }] }
     compose       { label, title, aside (lines), desktop (2160x1350 src), url, mobile (780x1688 src), alt (phone),
                   sr (figure caption for screen readers), cap: [left, right] }. compose.mobile is also used as the
                   hover peek on the "Next project" tile that points at this project (override with nextPeek).
     diagram       { kind: 'reevit-route', label, title, aside }
     notes         { label*, title*, aside?, items*: [{ t, b }], chipsLabel?, chips? }
     gallery       { label*, title*, aside? (default "<N> images / from the project write-up"), items*: GalleryItem[] }
                   GalleryItem: { id (Cloudinary public id -> 800/1600/2400w srcset) OR src (local, e.g.
                   '/assets/case/waytu-s1.jpg', optional srcSet), w*, h*, alt*, cap*, note?, span? (grid columns of 12,
                   default 6), wide? (full-bleed mockup), bar? (browser-bar URL -> rendered in a frame) }
     facts         { label*, title*, aside*, items*: [{ pre?, v*, unit?, l*, p? }],
                   status?: { pill?, big*, muted?, listTitle*, list*: [{ t: Rich, tag }] } }
     quote         { label, text, em?, by, role, mark (avatar letters) }
     nextNote      extra meta on this page's "Next project" tile ("Category · nextNote")
     nextBg        framing of THIS project's cover when it is someone's next tile: { zoom, pos } (default 1.04, '50% 45%')
     nextPeek      phone screenshot shown on hover when THIS project is the next tile (default compose.mobile;
                   false disables)

   Text types: Title = 'ink' | ['ink', 'soft'] (soft renders in <span class="soft">); Lines = string[] joined
   with <br>; Rich = 'text' | Array<'text' | { text, href }> (href = internal route, rendered as a.tlink).
   ===================================================================== */

import { PROJECTS, type Project } from '@/lib/site/projects';

export type Link = { text: string; href: string };
export type Rich = string | Array<string | Link>;
export type Title = string | [ink: string, soft: string];
export type Lines = string[];

export type Theme = {
    tone: 'dark' | 'light';
    accent: string;
    onAccent: string;
    accentText: string;
    heroAccent: string;
    tint: string;
    tint2: string;
    tintInk: string;
    tintMuted: string;
    glow: string;
};

export type Credit = { k: string; v: string; note?: string };

export type Stage = {
    alt: string;
    src?: string;
    w?: number;
    h?: number;
    url?: string;
    cap?: [string, string];
};

export type StoryCol = {
    h: string;
    body?: Rich[];
    list?: Array<{ b?: string; t: string }>;
};

export type Brief = { statement: string; muted?: string; story?: StoryCol[] };

export type Chapter = {
    label: string;
    title: string;
    body: string;
    chips?: string[];
    broad?: boolean;
    src: string;
    url: string;
    crop?: [x: number, y: number, w: number, h: number];
    alt: string;
    cap: string;
    note: string;
};

export type Chapters = { label: string; title: Title; aside: Lines; items: Chapter[] };

export type Compose = {
    label: string;
    title: Title;
    aside: Lines;
    desktop: string;
    url: string;
    mobile: string;
    alt: string;
    sr: string;
    cap: [string, string];
};

export type Diagram = { kind: 'reevit-route'; label: string; title: Title; aside: Lines };

export type Notes = {
    label: string;
    title: Title;
    aside?: Lines;
    items: Array<{ t: string; b: string }>;
    chipsLabel?: string;
    chips?: string[];
};

type GalleryImage = { id: string; src?: never; srcSet?: never } | { src: string; srcSet?: string; id?: never };
export type GalleryItem = GalleryImage & {
    w: number;
    h: number;
    alt: string;
    cap: string;
    note?: string;
    span?: number;
    wide?: boolean;
    bar?: string;
};

export type Gallery = { label: string; title: Title; aside?: Lines; items: GalleryItem[] };

export type Fact = { pre?: string; v: string; unit?: string; l: string; p?: string };
export type Status = {
    pill?: string;
    big: string;
    muted?: string;
    listTitle: string;
    list: Array<{ t: Rich; tag: string }>;
};
export type Facts = { label: string; title: Title; aside: Lines; items: Fact[]; status?: Status };

export type Quote = { label: string; text: string; em?: string; by: string; role: string; mark: string };

export type ProjectDetail = {
    theme: Theme;
    tagline: string | [ink: string, muted: string];
    rich?: boolean;
    description?: string;
    formerly?: string;
    status?: string;
    credits?: Credit[];
    stage: Stage;
    brief?: Brief;
    chapters?: Chapters;
    compose?: Compose;
    diagram?: Diagram;
    notes?: Notes;
    gallery?: Gallery;
    facts?: Facts;
    quote?: Quote;
    nextNote?: string;
    nextBg?: { zoom: number; pos: string };
    nextPeek?: string | false;
};

/* Title sizing: approximate advance widths (em) for Geist 500, so CSS can cap the size of long single words.
   Same numbers as work_pages.py fw(); --fw on .ptitle (tracking .07, .06 for long names) and .next__t (.065). */
function wordEm(word: string, tracking: number) {
    let w = 0;
    for (const c of word) {
        if ("iljI.,:;!|'’".includes(c)) w += 0.27;
        else if ('frt'.includes(c)) w += 0.37;
        else if ('mwMW'.includes(c)) w += 0.86;
        else if (c !== c.toLowerCase() && c === c.toUpperCase()) w += 0.68;
        else if (/\d/.test(c)) w += 0.6;
        else if (c === '&') w += 0.7;
        else w += 0.57;
        w -= tracking;
    }
    return w;
}
export const fw = (name: string, tracking: number) =>
    Math.round((Math.max(...name.split(/\s+/).map((x) => wordEm(x, tracking))) * 1.06 + 0.06) * 100) / 100;

/** Multi-word names over 10 characters get the long title treatment. */
export const isLong = (name: string) => name.includes(' ') && name.length > 10;

export const DETAILS: Record<string, ProjectDetail> = {
    'reevit': {
        rich: true,
        description: 'Reevit: payments that don’t miss. Every charge goes through the merchant’s own Paystack, Hubtel or Flutterwave, and fails over inside the same tap. Designed and engineered by Felix Yeboah.',
        formerly: 'Primeflow',
        status: 'Live',
        tagline: ['Payments that don’t miss.', 'One provider goes down, the customer never knows.'],
        credits: [
            { k: 'Role', v: 'Founder & engineer' },
            { k: 'Services', v: 'Product design, frontend, backend, infrastructure' },
            { k: 'Providers', v: 'Paystack, Hubtel, Flutterwave', note: 'and five more' },
            { k: 'Year', v: '2025', note: 'serving early merchants' },
        ],
        stage: {
            src: '/assets/case/reevit-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'reevit.io',
            alt: 'Reevit homepage: the headline “One provider goes down. Your customers never know.” above the merchant dashboard snapshot',
            cap: ['reevit.io · homepage and merchant dashboard', 'Figures in the product UI are demo data'],
        },
        brief: {
            statement: 'Payments that keep working',
            muted: 'when the provider behind them doesn’t.',
            story: [
                {
                    h: 'The problem',
                    body: [
                        [
                            'Felix was building the store for ',
                            { text: 'Miss Cookie Spices', href: '/work/miss-cookie-spices' },
                            ' when payments started failing. The provider’s webhook had gone unreliable: sometimes it fired, sometimes total silence.',
                        ],
                        'Switching providers meant rewriting almost the whole integration.',
                    ],
                },
                {
                    h: 'The question',
                    body: [
                        'If one client hit this, how many developers were quietly accepting broken payment flows?',
                        'Enterprise teams have orchestration layers like Primer. Builders starting from scratch had nothing that simple.',
                    ],
                },
                {
                    h: 'The approach',
                    body: ['A universal remote for payments.'],
                    list: [
                        { b: 'Integrate once.', t: 'One snippet, any provider behind it.' },
                        {
                            b: 'One shape.',
                            t: 'Same request and response, so switching never touches business logic.',
                        },
                        { b: 'No downtime.', t: 'Whichever provider is answering takes the charge.' },
                    ],
                },
            ],
        },
        chapters: {
            label: 'The product',
            title: 'Everything after the customer taps Pay.',
            aside: ['Four screens', 'from reevit.io'],
            items: [
                {
                    label: 'Failover',
                    title: 'A declined charge isn’t a lost sale.',
                    body: 'When a provider declines or stops answering, the same charge moves to the next one in the merchant’s chain, inside the same tap. Nobody has to ask the customer to try again.',
                    src: '/assets/case/reevit-s2.jpg',
                    url: 'reevit.io/#features',
                    crop: [0.055, 0.235, 0.45, 0.56],
                    alt: 'Routing recovery card: payments recovered after failover, first-try and after-failover approval rates',
                    cap: 'Routing recovery',
                    note: 'Product UI · demo data',
                },
                {
                    label: 'Recurring',
                    title: 'Retries that change lanes.',
                    body: 'Subscriptions and instalments retry on a schedule, and on a different provider when one keeps declining. The invoice gets paid without anyone chasing it.',
                    src: '/assets/case/reevit-s3.jpg',
                    url: 'reevit.io/#features',
                    crop: [0.355, 0.1, 0.285, 0.33],
                    alt: 'Invoice card: card declined Monday, declined again Wednesday, paid Friday by charging MTN MoMo',
                    cap: 'Invoice retry timeline',
                    note: 'Product UI · demo data',
                },
                {
                    label: 'Checkout',
                    title: 'No website needed.',
                    body: 'A payment link on WhatsApp, a QR on the counter, or the drop-in checkout. Mobile money and cards work on day one.',
                    chips: ['WhatsApp', 'QR code', 'Mobile money', 'Cards'],
                    src: '/assets/case/reevit-s6.jpg',
                    url: 'reevit.io/#checkout',
                    crop: [0.36, 0.07, 0.58, 0.65],
                    alt: 'Hosted checkout asking for a mobile money number, above the steps: share the link anywhere, get paid',
                    cap: 'Hosted checkout + payment links',
                    note: 'Product UI · demo data',
                },
                {
                    label: 'Dashboard',
                    title: 'Every provider, one screen.',
                    body: 'Payments, routing decisions, webhooks and provider health in one place, in test and live mode. Workflows can run the moment a payment lands.',
                    broad: true,
                    src: '/assets/case/reevit-s7.jpg',
                    url: 'dashboard · snapshot',
                    crop: [0.075, 0.079, 0.57, 0.43],
                    alt: 'Merchant dashboard snapshot: volume, success rate and recovered totals above a live activity feed of payments across Paystack and Hubtel',
                    cap: 'Dashboard · snapshot',
                    note: 'Product UI · demo data',
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: 'Built for the phone the customer is holding.',
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/reevit-s0.jpg',
            url: 'reevit.io',
            mobile: '/assets/case/reevit-mobile.jpg',
            alt: 'Reevit homepage on a phone: the headline and dashboard preview reflowed for a 390px screen',
            sr: 'Reevit on desktop and on a phone.',
            cap: ['Same product, same checkout, desktop and phone', 'reevit.io, live'],
        },
        diagram: {
            kind: 'reevit-route',
            label: 'How the routing works',
            title: ['One charge. Two providers.', 'One tap.'],
            aside: ['No code change,', 'nothing asked of the customer'],
        },
        notes: {
            label: 'Under the hood',
            title: ['Built so one provider can', 'fail quietly.'],
            items: [
                {
                    t: 'Health-checked routing',
                    b: 'Real-time provider health checks decide the fallback order, so a charge skips a provider that is already struggling.',
                },
                {
                    t: 'Fraud rules first',
                    b: 'Merchant-level rules for country, amount limits and BIN blocklists run before a charge leaves.',
                },
                {
                    t: 'Envelope encryption',
                    b: 'Merchant keys are sealed with a data key wrapped by a KMS-managed key, decrypted in memory at call time and never logged.',
                },
                {
                    t: 'Normalised webhooks',
                    b: 'Every provider’s events arrive in one shape, so switching providers never rewrites business logic.',
                },
            ],
            chipsLabel: 'Providers',
            chips: ['Paystack', 'Hubtel', 'Flutterwave', 'Stripe', 'PawaPay', 'Moolre', 'Monnify', 'M-Pesa'],
        },
        facts: {
            label: 'Where it stands',
            title: 'Live, and taking payments for its first merchants.',
            aside: ['Product facts,', 'not performance claims'],
            items: [
                { v: '1', l: 'Integration', p: 'One snippet. Every provider in the chain sits behind it.' },
                {
                    v: '8',
                    l: 'Providers supported',
                    p: 'Across Ghana, Nigeria and Kenya, from Paystack to M-Pesa.',
                },
                {
                    pre: 'GHS',
                    v: '0',
                    l: 'Held by Reevit',
                    p: 'Money settles in the merchant’s own provider accounts. Always.',
                },
                {
                    v: '2',
                    unit: 'min',
                    l: 'To connect Paystack',
                    p: 'Paste the keys, add a fallback, take a live payment.',
                },
            ],
            status: {
                pill: 'Live · early merchants',
                big: 'Designed, built and run by one person,',
                muted: 'from the dashboard to the key management.',
                listTitle: 'Next on the roadmap',
                list: [
                    { t: 'Bring your own keys', tag: 'Planned' },
                    { t: 'Custom email and SMS notifications', tag: 'Planned' },
                    { t: 'Slack and Teams alerts', tag: 'Planned' },
                    { t: 'Post-payment actions', tag: 'Planned' },
                ],
            },
        },
        quote: {
            label: 'Why it exists',
            text: 'Not glamorous. Just useful.',
            em: 'And sometimes, that’s all innovation really needs to be.',
            by: 'Felix Yeboah',
            role: 'Founder, Reevit · from the launch post',
            mark: 'FY',
        },
        nextNote: 'Where Reevit started',
        nextBg: { zoom: 1.06, pos: '50% 30%' },
        theme: {
            tone: 'dark',
            accent: '#5CE1C6',
            onAccent: '#04201A',
            accentText: '#72E8D1',
            heroAccent: '#72E8D1',
            tint: '#0F1C1A',
            tint2: '#0A1110',
            tintInk: '#EAF5F2',
            tintMuted: '#9BB3AE',
            glow: 'rgba(92,225,198,.22)',
        },
    },
    'miss-cookie-spices': {
        rich: true,
        description: 'Miss Cookie Spices: a custom online store for freshly blended Ghanaian spices, with Hubtel payments and SMS. Built by Felix Yeboah.',
        status: 'Live',
        tagline: ['Great food starts with great spices.', 'A storefront built for mobile money.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Services', v: 'Custom e-commerce build' },
            { k: 'Stack', v: 'Remix, Prisma, Tailwind CSS', note: 'Hubtel payments + SMS, Fly.io' },
            { k: 'Year', v: '2023', note: 'built over four months' },
        ],
        stage: {
            src: '/assets/case/miss-cookie-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'misscookieghana.com',
            alt: 'Miss Cookie Spices homepage: a pouch of Pounded Palm Nut under the headline “Pounded Palm Nut”',
            cap: ['misscookieghana.com · homepage', 'An early Reevit merchant'],
        },
        brief: {
            statement: 'An online store for freshly blended spices,',
            muted: 'that stays easy to run.',
            story: [
                {
                    h: 'The business',
                    body: [
                        'Miss Cookie is a small Accra business making freshly blended local spice mixes, from fish and shrimp powders to wet bases for chicken, grills and kelewele.',
                        'Its first day of production, in 2017, made 25 jars on a personal blender that had to stop and cool down every few minutes.',
                    ],
                },
                {
                    h: 'The problem',
                    body: [
                        'The business needed a store that could reach customers outside the shop, accept payments online and send SMS notifications, without becoming something only a developer could manage.',
                        [
                            'Later, payments started failing when the provider’s webhook became unreliable. Solving that properly became ',
                            { text: 'Reevit', href: '/work/reevit' },
                            '.',
                        ],
                    ],
                },
                {
                    h: 'The approach',
                    body: ['A custom store, not a template.'],
                    list: [
                        { b: 'One platform.', t: 'Built on Remix and Prisma.' },
                        { b: 'Easy to run.', t: 'The team manages products, orders and customers themselves.' },
                        { b: 'Payments and SMS.', t: 'Hubtel handles both.' },
                    ],
                },
            ],
        },
        chapters: {
            label: 'The store',
            title: 'Find your flavour.',
            aside: ['Four screens', 'from misscookieghana.com'],
            items: [
                {
                    label: 'Categories',
                    title: 'Four ways into the pantry.',
                    body: 'Dry rubs, wet bases, fresh herbs, and the shortcuts for busy nights. Each card shows how many products sit behind it.',
                    chips: ['Dry spices', 'Wet spices', 'Herbs & spices', 'Cook Sharp Sharp'],
                    broad: true,
                    src: '/assets/case/miss-cookie-s1.jpg',
                    url: 'misscookieghana.com',
                    crop: [0.015, 0.075, 0.97, 0.6],
                    alt: 'Shop by category: Dry Spices, Wet Spices, Herbs & Spices and Cook Sharp Sharp, each with its product count',
                    cap: 'Shop by category',
                    note: 'misscookieghana.com',
                },
                {
                    label: 'Shop',
                    title: 'Buy from the grid.',
                    body: 'Size, quantity and Add to bag sit on every product card, from fish powder to pure ginger.',
                    src: '/assets/case/miss-cookie-s2.jpg',
                    url: 'misscookieghana.com',
                    crop: [0.015, 0.085, 0.675, 0.58],
                    alt: 'Product cards for Fish Powder, Shrimp Powder and Mix for Chicken, each with size options, quantity and an Add to bag button',
                    cap: 'Featured spices',
                    note: 'misscookieghana.com',
                },
                {
                    label: 'Cook by dish',
                    title: 'Shop by dish.',
                    body: '“Pick the pot you’re reaching for,” and the store shows the blends that belong in it: jollof, light soup, a weeknight stew.',
                    src: '/assets/case/miss-cookie-s5.jpg',
                    url: 'misscookieghana.com',
                    crop: [0.015, 0.17, 0.648, 0.56],
                    alt: 'Spice your cuisine: dish categories such as Comfort Classics and Protein Seasonings',
                    cap: 'Spice your cuisine',
                    note: 'misscookieghana.com',
                },
                {
                    label: 'Recipes',
                    title: 'Recipes next to the shelf.',
                    body: 'Ghanaian home cooking built on the blends the store sells. Cook along, then add the spices to your bag in one step.',
                    src: '/assets/case/miss-cookie-s7.jpg',
                    url: 'misscookieghana.com',
                    crop: [0.015, 0.1, 0.46, 0.6],
                    alt: 'Recipe cards for Tasty Fried Fish with Miss Cookie Grill Mix and Garlic Garden Eggs Stew',
                    cap: 'Recipe inspiration',
                    note: 'misscookieghana.com',
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The same shelf,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/miss-cookie-s0.jpg',
            url: 'misscookieghana.com',
            mobile: '/assets/case/miss-cookie-mobile.jpg',
            alt: 'Miss Cookie Spices on a phone, showing the Pounded Palm Nut hero with search and the cart one tap away',
            sr: 'Miss Cookie Spices on desktop and on a phone.',
            cap: ['Search and the cart one tap away, on desktop and phone', 'misscookieghana.com, live'],
        },
        facts: {
            label: 'Where it stands',
            title: ['Since 2017.', 'Online since 2023.'],
            aside: ['From the live store', 'and the brand’s own story'],
            items: [
                {
                    v: '4',
                    l: 'Ways into the pantry',
                    p: 'Dry spices, wet spices, herbs and spices, and Cook Sharp Sharp.',
                },
                { v: '84', l: 'Products on the shelf', p: 'Across those four categories on the live store.' },
                { pre: 'GH₵', v: '80', l: 'Unlocks free delivery', p: 'Orders over GH₵80 are delivered free.' },
                { v: '25', l: 'Jars on day one', p: 'The first production run in 2017, on a personal blender.' },
            ],
            status: {
                pill: 'Live · an early Reevit merchant',
                big: 'A custom store the team runs themselves,',
                muted: 'with Hubtel for payments and SMS.',
                listTitle: 'Since 2017',
                list: [
                    { t: 'First day of production: 25 jars', tag: '2017' },
                    { t: 'Custom online store, built over four months', tag: '2023' },
                    {
                        t: [
                            'The payment webhook turns unreliable. The fix becomes ',
                            { text: 'Reevit', href: '/work/reevit' },
                        ],
                        tag: 'Later',
                    },
                    { t: 'Live, and one of Reevit’s early merchants', tag: 'Now' },
                ],
            },
        },
        quote: {
            label: 'Their mission',
            text: 'We are driven by one goal:',
            em: 'to make cooking easier, quicker and less stressful.',
            by: 'Miss Cookie Spices',
            role: 'Brand mission, from misscookieghana.com',
            mark: 'MC',
        },
        nextBg: { zoom: 1.12, pos: '50% 55%' },
        theme: {
            tone: 'light',
            accent: '#2F5D3A',
            onAccent: '#F5EDDD',
            accentText: '#9FCC8A',
            heroAccent: '#2F5D3A',
            tint: '#F1E8D8',
            tint2: '#E6D8C0',
            tintInk: '#1D3423',
            tintMuted: '#4A5743',
            glow: 'rgba(232,150,46,.26)',
        },
    },
    'waytu': {
        rich: true,
        tagline: ['Community-driven ride-sharing', 'that pairs nearby commuters for a cheaper, greener trip.'],
        credits: [
            { k: 'Category', v: 'Ride-sharing' },
            { k: 'Built with', v: 'Astro, Tailwind CSS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Netlify', note: 'detected on the live site' },
            { k: 'Status', v: 'Pre-launch', note: 'waitlist open, apps coming soon' },
        ],
        stage: {
            src: '/assets/case/waytu-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'waytu.io',
            alt: 'Waytu homepage: “Community-driven ride-sharing” with Join the Waitlist and Read White Paper beside a commuter checking his phone in a car',
        },
        brief: {
            statement: 'A launch site for a ride-sharing app,',
            muted: 'built to fill the waitlist before the apps ship.',
            story: [
                {
                    h: 'The product',
                    body: [
                        'Waytu pairs commuters who live near each other and travel the same way, so they can share the car and split the cost.',
                        'Founded in Accra in 2024, it is launching there first.',
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'Five pages (home, about, how it works, safety and contact) and the legal pages.',
                        'Every call to action opens the same waitlist form. It asks whether you own a car and would share rides in it, so the team can tell drivers from riders before launch.',
                    ],
                },
                {
                    h: 'Trust first',
                    body: ['A stranger’s car is a hard sell, so safety gets a page of its own.'],
                    list: [
                        { b: 'Verified.', t: 'Sign-up with a phone number and a government-issued ID.' },
                        { b: 'Tracked.', t: 'Live location shared with trusted contacts during a ride.' },
                        { b: 'Rated.', t: 'Riders and drivers review each other after every trip.' },
                        { b: 'Fair.', t: 'Costs split on distance and fuel.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The pitch,', 'on the phone it’s for.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/waytu-s0.jpg',
            url: 'waytu.io',
            mobile: '/assets/case/waytu-mobile.jpg',
            alt: 'Waytu on a phone: the headline, Join the Waitlist and Read White Paper, and “Coming soon to App Store, Google Play”',
            sr: 'Waytu on desktop and on a phone.',
            cap: ['The waitlist one tap away, on desktop and phone', 'waytu.io, live'],
        },
        notes: {
            label: 'On the site',
            title: ['Built to answer', '“is this safe?”'],
            items: [
                { t: 'One waitlist, two audiences', b: 'A single form, reachable from any page, takes contact details and whether the person has a car to share.' },
                { t: 'Four steps', b: 'Sign up and verify, find or offer a ride, connect, then rate and review: on the homepage and on a page of its own.' },
                { t: 'A safety page', b: 'Identity checks, live tracking, an emergency button, and guidance for before, during and after a ride.' },
                { t: 'Somewhere to ask', b: 'A contact form with subjects from safety to partnerships, and live chat on every page.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Astro', 'Tailwind CSS', 'Lenis', 'Tawk.to', 'Google Analytics', 'Netlify'],
        },
        gallery: {
            label: 'The site',
            title: ['Home, safety', 'and the waitlist.'],
            aside: ['Four screens', 'from waytu.io'],
            items: [
                { src: '/assets/case/waytu-s1.jpg', w: 2160, h: 1350, alt: 'Feature cards: Real-time Matching with a matched route line, a green Eco-friendly card, Community Driven and Cost Sharing', cap: 'Features', note: 'Home', span: 6, bar: 'waytu.io' },
                { src: '/assets/case/waytu-s2.jpg', w: 2160, h: 1350, alt: '“Start your journey in four simple steps”: Sign Up, Find or Offer, Connect & Ride, and Rate & Review with a Great Ride! badge', cap: 'Four steps', note: 'Home', span: 6, bar: 'waytu.io' },
                { src: '/assets/case/waytu-s3.jpg', w: 2160, h: 1350, alt: 'Safety page: “Your Safety is Our Priority” above cards for identity verification, real-time tracking and an emergency button', cap: 'Safety', note: '/safety', span: 6, bar: 'waytu.io/safety' },
                { src: '/assets/case/waytu-s4.jpg', w: 2160, h: 1350, alt: 'Join the Waitlist form: name, email, a Ghana phone number, “Do you own a car?” and “Interested in sharing rides in your car?”', cap: 'Waitlist form', note: 'Every page', span: 6, bar: 'waytu.io' },
            ],
        },
        nextBg: { zoom: 1.5, pos: '92% 40%' },
        theme: {
            tone: 'dark',
            accent: '#3EAE04',
            onAccent: '#111F09',
            accentText: '#82E052',
            heroAccent: '#82E052',
            tint: '#131D0E',
            tint2: '#0C1109',
            tintInk: '#EEF4EC',
            tintMuted: '#95A68C',
            glow: 'rgba(62,174,4,0.22)',
        },
    },
    'drobotix': {
        rich: true,
        tagline: ['Drone technology, training and support', 'that help farmers spray and survey at scale.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Client', v: 'Dawncraft Designs' },
            { k: 'Stack', v: 'Remix, Tailwind CSS, Sanity CMS', note: 'Vercel' },
            { k: 'Year', v: '2024', note: 'built over three weeks' },
        ],
        stage: { alt: 'Drobotix homepage: a crop-spraying drone over a green field above the Drobotix wordmark' },
        brief: {
            statement: 'A fast site for a growing drone company,',
            muted: 'that the team can update without writing code.',
            story: [
                {
                    h: 'The company',
                    body: [
                        'Drobotix sells and services drones that help in farming. Its mission is to empower farmers with cutting-edge technology, knowledge and unwavering support.',
                        'With great customer service behind the technology, it helps farmers increase their yields and reduce their costs.',
                    ],
                },
                {
                    h: 'The process',
                    body: [
                        'Felix worked with Dawncraft Designs to design and build the site with Remix and Tailwind CSS.',
                        'Sanity CMS manages the content, and the site is deployed on Vercel.',
                    ],
                },
                {
                    h: 'The outcome',
                    body: [
                        'A website that is easy to update and maintain: fast, responsive and easy to navigate.',
                        'Drobotix now has a solid online presence that helps it reach more customers.',
                    ],
                },
            ],
        },
        gallery: {
            label: 'The pages',
            title: ['Landing, services', 'and project pages.'],
            items: [
                {
                    id: 'projects/drobotix_q2ctah',
                    w: 1600,
                    h: 1200,
                    alt: 'The Drobotix homepage on a laptop: a spraying drone over a field above the yellow DROBOTIX wordmark',
                    cap: 'Drobotix website',
                    note: 'Mockup',
                    span: 12,
                    wide: true,
                },
                {
                    id: 'projects/CleanShot_June_23_from_Squoosh_5_owvxmq',
                    w: 1600,
                    h: 1372,
                    alt: 'Landing page: a spraying drone over a field, the DROBOTIX wordmark and “Grow your farm the smart way”',
                    cap: 'Landing page',
                    note: 'Design board',
                    span: 4,
                },
                {
                    id: 'projects/CleanShot_June_23_from_Squoosh_4_tmm89g',
                    w: 1600,
                    h: 1215,
                    alt: 'Services page layouts, including the states of the “See how we can support you” carousel',
                    cap: 'Services page',
                    note: 'Design board',
                    span: 4,
                },
                {
                    id: 'projects/CleanShot_June_23_from_Squoosh_3_guddcc',
                    w: 1600,
                    h: 1549,
                    alt: 'Project page layouts: a customer story beside full-page desktop and mobile views',
                    cap: 'Project page',
                    note: 'Design board',
                    span: 4,
                },
            ],
        },
        nextBg: { zoom: 1.02, pos: '50% 45%' },
        theme: {
            tone: 'dark',
            accent: '#E3C341',
            onAccent: '#171405',
            accentText: '#E8CB55',
            heroAccent: '#E8CB55',
            tint: '#1B1910',
            tint2: '#11100B',
            tintInk: '#F5F0DC',
            tintMuted: '#ADA582',
            glow: 'rgba(227,195,65,.2)',
        },
    },
    'studio-theon': {
        rich: true,
        tagline: ['A creative digital agency site', 'with a storefront for seasonal souvenirs and gifts.'],
        credits: [
            { k: 'Category', v: 'Agency' },
            { k: 'Built with', v: 'Next.js, Payload CMS, Tailwind CSS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Vercel', note: 'detected on the live site' },
        ],
        stage: {
            src: '/assets/case/studio-theon-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'studiotheon.com',
            alt: 'Studio Theon homepage: “Get beautifully crafted seasonal souvenirs” and Shop Now over green gift boxes, under the green Theon bar',
        },
        brief: {
            statement: 'An agency site that is also a print shop and a school,',
            muted: 'under one navigation.',
            story: [
                {
                    h: 'The studio',
                    body: [
                        'StudioTheon calls itself a DesignTech company: brand identity, UI/UX, motion, web and mobile development, print and packaging.',
                        [
                            'Its portfolio runs from full branding for 360 Furnishings and ',
                            { text: 'Dasheen Atelier', href: '/work/dasheen-atelier' },
                            ' to visual identities for ChowPae, Farmwell and Ayekoo Honey.',
                        ],
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'The navigation follows the business: Services, Projects, About, Products, Careers and Learn.',
                        'Each client project gets a case page (overview, problem, research, design stages, result), and every service is listed with its starting timeline.',
                    ],
                },
                {
                    h: 'Beyond client work',
                    list: [
                        { b: 'Brandler.', t: 'A print shop for business cards, stickers, packaging and merchandise.' },
                        { b: 'Insait.', t: 'An accelerated programme in four tracks, from graphic design and motion to programming.' },
                        { b: 'Workshops.', t: 'Short courses in animation, UI/UX, brand identity and design technology.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The same storefront,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/studio-theon-s0.jpg',
            url: 'studiotheon.com',
            mobile: '/assets/case/studio-theon-mobile.jpg',
            alt: 'Studio Theon on a phone: the seasonal souvenirs slide and Shop Now under the green Theon bar',
            sr: 'Studio Theon on desktop and on a phone.',
            cap: ['The hero carousel, on desktop and phone', 'studiotheon.com, live'],
        },
        notes: {
            label: 'Inside the site',
            title: ['An agency, a print shop', 'and a school.'],
            items: [
                { t: 'Case studies', b: 'Client projects told as problem, research, design stages and result.' },
                { t: 'Brandler storefront', b: 'Product categories, sample packs and help pages under one shop.' },
                { t: 'Insait programme', b: 'Tracks, a scholarship offer and instructors, with a route to apply.' },
                { t: 'Contact and careers', b: 'A project form that asks for the service and budget and takes an attachment, and a list of open roles.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'GSAP', 'Lenis', 'Vercel'],
        },
        gallery: {
            label: 'The site',
            title: ['Work, shop', 'and school.'],
            aside: ['Five screens', 'from studiotheon.com'],
            items: [
                { src: '/assets/case/studio-theon-s1.jpg', w: 2160, h: 1350, alt: '“Featured Work”: the 360 Furnishings brand board, with wood-grain typography cards, a chair and the 360 logo', cap: 'Featured work', note: 'Home', span: 12, bar: 'studiotheon.com' },
                { src: '/assets/case/studio-theon-s2.jpg', w: 2160, h: 1350, alt: 'Project grid: 360 Furnishings, Dasheen Atelier and ChowPae above Farmwell, Ayekoo Honey and logiciele Labs', cap: 'Projects', note: '/projects', span: 6, bar: 'studiotheon.com/projects' },
                { src: '/assets/case/studio-theon-s3.jpg', w: 2160, h: 1350, alt: 'Brandler storefront: business cards, postcards, brochures, stickers, notepads, flyers, drinkables and notebooks', cap: 'Brandler shop', note: '/brandler', span: 6, bar: 'studiotheon.com/brandler' },
                { src: '/assets/case/studio-theon-s4.jpg', w: 2160, h: 1350, alt: 'Insait hero: “Growing people to build the future through the Insait Accelerated Programme” with Apply Now', cap: 'Insait programme', note: '/modules', span: 6, bar: 'studiotheon.com/modules/insait-accelerated-program' },
                { src: '/assets/case/studio-theon-s5.jpg', w: 2160, h: 1350, alt: 'Design Services: Brand Innovation, Web & Mobile Application Design and Website Design, each “From 1 week”', cap: 'Services', note: '/services', span: 6, bar: 'studiotheon.com/services' },
            ],
        },
        nextBg: { zoom: 1.25, pos: '50% 85%' },
        theme: {
            tone: 'dark',
            accent: '#49C91C',
            onAccent: '#101E0B',
            accentText: '#77E052',
            heroAccent: '#77E052',
            tint: '#161616',
            tint2: '#0D0D0D',
            tintInk: '#F0F0F0',
            tintMuted: '#A3A4A3',
            glow: 'rgba(73,201,28,0.22)',
        },
    },
    'dasheen-atelier': {
        rich: true,
        tagline: ['Made-to-measure bridal and traditional wear,', 'finished by hand in Accra.'],
        credits: [
            { k: 'Category', v: 'Fashion' },
            { k: 'Built with', v: 'Next.js, Payload CMS', note: 'detected on the live site' },
            { k: 'Payments', v: 'Reevit', note: 'hosted checkout, detected on the live site' },
        ],
        stage: {
            src: '/assets/case/dasheen-atelier-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'dasheenatelier.com',
            alt: 'Dasheen Atelier homepage: “Dressed for life’s greatest moments” beside a bride in a beaded off-shoulder gown, framed in a doorway',
        },
        brief: {
            statement: 'A fashion house, a shop and a school,',
            muted: 'on one site.',
            story: [
                {
                    h: 'The house',
                    body: [
                        'Dasheen Atelier makes made-to-measure bridal and traditional wear in Accra: wedding gowns, bridesmaids, mothers of the bride, and kente, lace and ceremonial pieces.',
                        'Every garment is patterned to the client’s measurements, refined across fittings and finished by hand.',
                    ],
                },
                {
                    h: 'The shop',
                    body: [
                        'The collection sells online, each piece made to order in a custom size.',
                        [
                            'A gown offers Add to cart or Book a fitting. The cart opens as a drawer, and checkout takes delivery details before handing payment to ',
                            { text: 'Reevit', href: '/work/reevit' },
                            '.',
                        ],
                    ],
                    list: [
                        { b: 'Appointments.', t: 'Service, schedule, details, confirm: four steps across six session types.' },
                        { b: 'Measurements.', t: 'A guide to the right measurements for womenswear or menswear.' },
                    ],
                },
                {
                    h: 'The school',
                    body: [
                        'A one-year professional certificate in morning and evening cohorts, taught over six modules from sewing foundations to bespoke finishing.',
                        'Applicants apply in two steps; students sign in to a portal for their programme and documents.',
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['Book an appointment', 'from a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/dasheen-atelier-s0.jpg',
            url: 'dasheenatelier.com',
            mobile: '/assets/case/dasheen-atelier-mobile.jpg',
            alt: 'Dasheen Atelier on a phone: “Dressed for life’s greatest moments” with Book an appointment and Explore the collection',
            sr: 'Dasheen Atelier on desktop and on a phone.',
            cap: ['The same hero, on desktop and phone', 'dasheenatelier.com, live'],
        },
        notes: {
            label: 'Under the hood',
            title: ['Made to order,', 'end to end.'],
            items: [
                { t: 'Made-to-order catalogue', b: 'Sixteen styles across bridal, bridesmaids, mothers and traditional, each sold in a custom size.' },
                { t: 'Booking in four steps', b: 'A service, a slot, your details; a summary panel fills in as you go.' },
                { t: 'Reevit checkout', b: 'Payment runs through Reevit, so card details never touch the store’s own servers.' },
                { t: 'Admissions and portal', b: 'A two-step application for the school and a sign-in for students and clients.' },
                { t: 'Careers', b: 'Open roles for beaders, fashion fellows and seamstresses, each on its own page.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'Reevit', 'GSAP', 'Lenis', 'Swiper', 'ImageKit'],
        },
        gallery: {
            label: 'The site',
            title: ['Shop, book,', 'learn.'],
            aside: ['Five screens', 'from dasheenatelier.com'],
            items: [
                { src: '/assets/case/dasheen-atelier-s1.jpg', w: 2160, h: 1350, alt: '“Find your occasion”: Bridal, Bridesmaids, Mothers and Traditional category cards under the deep green header', cap: 'Shop by occasion', note: 'Home', span: 12, bar: 'dasheenatelier.com' },
                { src: '/assets/case/dasheen-atelier-s2.jpg', w: 2160, h: 1350, alt: 'The Velloria Gown: GH₵9,700, made to order in a custom size, with Add to cart and Book a fitting', cap: 'Product page', note: '/products', span: 6, bar: 'dasheenatelier.com/products/the-velloria-gown' },
                { src: '/assets/case/dasheen-atelier-s5.jpg', w: 2160, h: 1350, alt: 'Secure checkout: “Where should we send your order?” with contact and delivery fields beside the order summary and Pay securely', cap: 'Checkout on Reevit', note: '/checkout', span: 6, bar: 'dasheenatelier.com/checkout' },
                { src: '/assets/case/dasheen-atelier-s3.jpg', w: 2160, h: 1350, alt: 'Booking step one, “What can we help you with?”: styling, tailoring, bridal consultation and VIP shopping beside a booking summary', cap: 'Appointments', note: '/book', span: 6, bar: 'dasheenatelier.com/book' },
                { src: '/assets/case/dasheen-atelier-s4.jpg', w: 2160, h: 1350, alt: 'Fashion school: “Learn the craft of couture” over a student sketching with a tape measure round her neck', cap: 'Fashion school', note: '/school', span: 6, bar: 'dasheenatelier.com/school' },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#B08565',
            onAccent: '#181410',
            accentText: '#BC977C',
            heroAccent: '#BC977C',
            tint: '#101B1A',
            tint2: '#0B100F',
            tintInk: '#ECF4F3',
            tintMuted: '#86A29E',
            glow: 'rgba(176,133,101,0.22)',
        },
    },
    'dronehub': {
        rich: true,
        tagline: ['Drones, payloads and services', 'for enterprises and professionals across Africa.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Client', v: 'Dawncraft Designs' },
            { k: 'Built with', v: 'Next.js, Payload CMS, Tailwind CSS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Vercel', note: 'detected on the live site' },
        ],
        stage: {
            src: '/assets/case/dronehub-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'dronehubafrica.com',
            alt: 'Dronehub homepage: “Built for Enterprise” with a DJI Matrice 400 over construction cranes, beside the carousel list from DJI Dock 3 to Matrice 4T',
        },
        brief: {
            statement: 'A dealer’s catalogue, service desk and library,',
            muted: 'organised around who is buying.',
            story: [
                {
                    h: 'The company',
                    body: [
                        'Dronehub Africa sells and services DJI drones from Accra, and describes itself as a DJI Authorised Dealer.',
                        'Its customers are enterprises, professionals and resellers: survey and mining teams, security and energy operators, filmmakers and farmers.',
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'The navigation splits by buyer. For Enterprises and For Professionals each get a landing page with their own product picks and services, beside a shared resources library.',
                        'The homepage opens on a carousel of new hardware (Dock 3, Matrice 400, Mini 5 Pro, Zenmuse L3, Matrice 4T), then product tabs for drones, payloads, services, software and extras.',
                    ],
                },
                {
                    h: 'After the sale',
                    list: [
                        { b: 'Services.', t: 'Consulting, rental, training, repair, maintenance, detection and custom solutions, each on its own page.' },
                        { b: 'Reserve.', t: 'Every product card carries Reserve now beside Learn more.' },
                        { b: 'Talk.', t: 'Schedule a call opens a Calendly booking from the header of every page.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The same carousel,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/dronehub-s0.jpg',
            url: 'dronehubafrica.com',
            mobile: '/assets/case/dronehub-mobile.jpg',
            alt: 'Dronehub on a phone: the DJI Mini 5 Pro slide of the hero carousel, “Pro in Mini”, with Explore DJI Mini 5 Pro',
            sr: 'Dronehub on desktop and on a phone.',
            cap: ['The hero carousel, on desktop and phone', 'dronehubafrica.com, live'],
        },
        notes: {
            label: 'Under the hood',
            title: ['A catalogue', 'run from a CMS.'],
            items: [
                { t: 'Product catalogue', b: 'Drones, payloads, software and extras, with a category page for each series from Mavic to Agras and FlyCart.' },
                { t: 'Product pages', b: 'Key specifications, an overview, applications by industry, warranty terms and a brochure download.' },
                { t: 'Industry pages', b: 'Eight industries, from mining to delivery, each with matched products, services and software.' },
                { t: 'Resources', b: 'Guides, news and blog posts in one library, filterable by type.' },
                { t: 'Content in Payload', b: 'Products, pages and articles are managed in Payload, with media served through ImageKit.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'Lenis', 'Radix UI', 'ImageKit', 'Calendly', 'Vercel'],
        },
        gallery: {
            label: 'The site',
            title: ['Products, industries', 'and service.'],
            aside: ['Six screens', 'from dronehubafrica.com'],
            items: [
                { src: '/assets/case/dronehub-s1.jpg', w: 2160, h: 1350, alt: '“Drone Solutions Designed To Give Your Business The Competitive Edge.”: tabs for drones, payloads, services, software and extras above Matrice 400 and Mavic 3 Multispectral cards', cap: 'Product tabs', note: 'Home', span: 12, bar: 'dronehubafrica.com' },
                { src: '/assets/case/dronehub-s2.jpg', w: 2160, h: 1350, alt: '“Industries We Serve”: illustrated cards for mining, geospatial, security and energy', cap: 'Industries', note: 'Home', span: 4, bar: 'dronehubafrica.com' },
                { src: '/assets/case/dronehub-s3.jpg', w: 2160, h: 1350, alt: 'Enterprise page: “Why struggle when you can fly smarter”, setting common frustrations against what Dronehub Enterprise offers', cap: 'Enterprise', note: '/enterprise', span: 4, bar: 'dronehubafrica.com/enterprise' },
                { src: '/assets/case/dronehub-s6.jpg', w: 2160, h: 1350, alt: 'Repairs: “How We Operate” in three steps (consultation, diagnosis, repair) with photographs of the team', cap: 'Repairs', note: '/services/repairs', span: 4, bar: 'dronehubafrica.com/services/repairs' },
                { src: '/assets/case/dronehub-s4.jpg', w: 2160, h: 1350, alt: 'DJI Matrice 400 product page: the drone, an overview, applications by industry and Reserve Now', cap: 'Product page', note: '/products', span: 6, bar: 'dronehubafrica.com/products/dji-matrice-400' },
                { src: '/assets/case/dronehub-s5.jpg', w: 2160, h: 1350, alt: '“Explore the Latest Drone Resources”: filters for guides, blog and news above article cards', cap: 'Resources', note: '/resources', span: 6, bar: 'dronehubafrica.com/resources' },
            ],
        },
        quote: {
            label: 'In their words',
            text: 'The professional design and user-friendly interface have significantly enhanced our online presence.',
            em: 'We’ve seen a noticeable increase in inquiries and client engagement since the launch.',
            by: 'DroneHub Ghana',
            role: 'Client feedback on the original launch, from the project write-up',
            mark: 'DH',
        },
        theme: {
            tone: 'dark',
            accent: '#1646C8',
            onAccent: '#0B101E',
            accentText: '#6C8CE5',
            heroAccent: '#6C8CE5',
            tint: '#0F131C',
            tint2: '#0A0C11',
            tintInk: '#ECEEF4',
            tintMuted: '#838BA0',
            glow: 'rgba(22,70,200,0.22)',
        },
    },
    'uavops': {
        rich: true,
        tagline: ['High-precision aerial intelligence', 'that helps organisations make faster, safer and better-informed decisions.'],
        credits: [
            { k: 'Category', v: 'Aerial data intelligence' },
            { k: 'Built with', v: 'Next.js, Payload CMS, Tailwind CSS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Vercel', note: 'detected on the live site' },
        ],
        stage: {
            src: '/assets/case/uavops-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'uavops.vercel.app',
            alt: 'UAVOps homepage: “Make Better Decisions with Reliable Aerial Data” under a hovering drone, with a survey area drawn over the landscape and industry tabs below',
        },
        brief: {
            statement: 'Drone survey work, explained to the people who buy it,',
            muted: 'with a short path to starting a project.',
            story: [
                {
                    h: 'The company',
                    body: [
                        'UAVOps collects and processes aerial data for organisations across Africa: research, forestry, mining, agriculture, oil and gas, energy, construction and surveying.',
                        'Clients receive working files: orthomosaics, NDVI layers, terrain models and 3D visualisations.',
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'The homepage opens on an industry switcher, names the problem (incomplete, outdated data), then sets out the method: plan, collect, process and analyse, act.',
                        'The services page lists each service line with its deliverables and a Request service button.',
                    ],
                },
                {
                    h: 'Getting started',
                    list: [
                        { b: 'Request.', t: 'A multi-step project form: contact, industry, then scope, dates, site and outputs.' },
                        { b: 'Talk.', t: 'Book a call opens a 30-minute Calendly slot.' },
                        { b: 'Read.', t: 'A resources library of news, guides and case studies, filterable by type.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The same switcher,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/uavops-s0.jpg',
            url: 'uavops.vercel.app',
            mobile: '/assets/case/uavops-mobile.jpg',
            alt: 'UAVOps on a phone: the drone, “Make Better Decisions with Reliable Aerial Data” and the industry tabs',
            sr: 'UAVOps on desktop and on a phone.',
            cap: ['Start a project and Book a call, on desktop and phone', 'uavops.vercel.app, live'],
        },
        notes: {
            label: 'On the site',
            title: ['Every service,', 'one request form.'],
            items: [
                { t: 'Industry switcher', b: 'Tabs under the hero move between eight industries, from research to surveying.' },
                { t: 'Plan, collect, process, act', b: 'The method step by step, with mission-planning and processed-map imagery.' },
                { t: 'Deliverables per service', b: 'Each service line lists what the client gets, from orthomosaic maps to boundary surveys.' },
                { t: 'Content in Payload', b: 'News, guides and case studies are published from the CMS into one resources library.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'GSAP', 'Lenis', 'ImageKit', 'Calendly', 'Vercel'],
        },
        gallery: {
            label: 'The site',
            title: ['Problem, method,', 'services.'],
            aside: ['Five screens', 'from uavops.vercel.app'],
            items: [
                { src: '/assets/case/uavops-s2.jpg', w: 2160, h: 1350, alt: '“Planning”: a survey grid illustration beside a processed site map and mission-planning software', cap: 'Plan, collect, process', note: 'Home', span: 12, bar: 'uavops.vercel.app' },
                { src: '/assets/case/uavops-s1.jpg', w: 2160, h: 1350, alt: '“Decisions Are Only as Good as the Data Behind Them”: cards on limited visibility, slow data collection and data that doesn’t drive action', cap: 'The problem', note: 'Home', span: 6, bar: 'uavops.vercel.app' },
                { src: '/assets/case/uavops-s3.jpg', w: 2160, h: 1350, alt: 'Services hero: “Aerial Data, Tailored to Your Mission” over a quadcopter against the sky', cap: 'Services', note: '/services', span: 6, bar: 'uavops.vercel.app/services' },
                { src: '/assets/case/uavops-s4.jpg', w: 2160, h: 1350, alt: 'Service lines for aerial data, infrastructure monitoring and environmental work beside a terrain image and a deliverables panel', cap: 'Service lines', note: '/services', span: 6, bar: 'uavops.vercel.app/services' },
                { src: '/assets/case/uavops-s5.jpg', w: 2160, h: 1350, alt: 'Resources: a featured article on 2026 drone data trends above the latest blog posts', cap: 'Resources', note: '/resources', span: 6, bar: 'uavops.vercel.app/resources' },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#2F7FA8',
            onAccent: '#0E171B',
            accentText: '#60ACD2',
            heroAccent: '#60ACD2',
            tint: '#12171A',
            tint2: '#0B0E0F',
            tintInk: '#ECF1F3',
            tintMuted: '#8898A0',
            glow: 'rgba(47,127,168,0.22)',
        },
    },
    'blavior': {
        rich: true,
        tagline: ['A real estate connection platform,', 'opening with a waitlist for agents, developers and property owners.'],
        credits: [
            { k: 'Category', v: 'Real estate' },
            { k: 'Built with', v: 'Next.js, Tailwind CSS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Cloudflare', note: 'via OpenNext, detected on the live site' },
            { k: 'Status', v: 'Pre-launch', note: 'waitlist open' },
        ],
        stage: {
            src: '/assets/case/blavior-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'blavior.io',
            alt: 'Blavior waitlist page: “Sell Faster Today with Confidence” and a name, email and role form in a white panel beside a coastal property at dusk',
        },
        brief: {
            statement: 'A waitlist page for a property platform,',
            muted: 'that sorts sign-ups before launch.',
            story: [
                {
                    h: 'The product',
                    body: [
                        'Blavior is a real estate connection platform: a place to find, sell or invest in property through verified agents, developers and property owners.',
                        'It has not opened yet. The live site is the waitlist.',
                    ],
                },
                {
                    h: 'The page',
                    body: [
                        'One screen, one job. The headline rotates through what the platform is for, from selling faster to getting matched.',
                        'The form asks for a name, an email and a role, so the list is segmented from the first sign-up.',
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The form rises', 'over the photograph.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/blavior-s1.jpg',
            url: 'blavior.io',
            mobile: '/assets/case/blavior-mobile.jpg',
            alt: 'Blavior on a phone: the waitlist panel slides up over the photograph, with the rotating headline and the sign-up form',
            sr: 'Blavior on desktop and on a phone.',
            cap: ['The role menu open on desktop; the form over the photograph on a phone', 'blavior.io, live'],
        },
        notes: {
            label: 'On the page',
            title: ['One screen,', 'one list.'],
            items: [
                { t: 'A single view', b: 'No menu and no second page: the pitch, the form and the photograph share one screen.' },
                { t: 'Sign-up by role', b: 'Agents, developers and property owners pick their role, so the list arrives sorted.' },
                { t: 'A rotating headline', b: 'Four lines take turns above the form, each ending “with Confidence”.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Tailwind CSS', 'Radix UI', 'Cloudinary', 'Cloudflare'],
        },
        theme: {
            tone: 'dark',
            accent: '#3FB8C4',
            onAccent: '#0E1A1B',
            accentText: '#63C5CF',
            heroAccent: '#63C5CF',
            tint: '#11191A',
            tint2: '#0B0F10',
            tintInk: '#ECF3F3',
            tintMuted: '#93A7A9',
            glow: 'rgba(63,184,196,0.22)',
        },
    },
    'the-rumson': {
        rich: true,
        tagline: ['Elevated Ghanaian comfort food in the heart of Labone,', 'with online ordering for dine-in, takeaway and delivery.'],
        credits: [
            { k: 'Category', v: 'Restaurant' },
            { k: 'Built with', v: 'Next.js, React, Better Auth', note: 'detected on the live site' },
            { k: 'Payments', v: 'Reevit', note: 'with Paystack, detected on the live site' },
        ],
        stage: {
            src: '/assets/case/the-rumson-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'therumson.com',
            alt: 'The Rumson homepage: “Food worth coming back for.” in dark green and red, with Order now and Find us beside an “Est. 2024” card',
        },
        brief: {
            statement: 'A restaurant site that takes the order',
            muted: 'and the booking, not just the menu.',
            story: [
                {
                    h: 'The restaurant',
                    body: [
                        'The Rumson serves Ghanaian comfort food in Labone, Accra, from 11am to 11pm: goat pepper soup, kelewele with groundnuts, oxtail sauce, jollof.',
                        'It opened in 2024 for dine-in, takeaway and delivery.',
                    ],
                },
                {
                    h: 'Ordering',
                    body: [
                        'The menu works like a shop: search, a price filter, sorting and ten categories from small plates to drinks.',
                        [
                            'Every dish has its own page with dietary tags. Checkout runs in three steps (details, delivery, payment), with payment through ',
                            { text: 'Reevit', href: '/work/reevit' },
                            '.',
                        ],
                    ],
                },
                {
                    h: 'The table',
                    list: [
                        { b: 'Reservations.', t: 'Party size, a date, lunch or dinner seatings every half hour, the occasion and any requests.' },
                        { b: 'Accounts.', t: 'Sign-up and sign-in for membership and a faster checkout.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['Order now,', 'full width on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/the-rumson-s0.jpg',
            url: 'therumson.com',
            mobile: '/assets/case/the-rumson-mobile.jpg',
            alt: 'The Rumson on a phone: “Food worth coming back for.” with full-width Order now and Find us buttons',
            sr: 'The Rumson on desktop and on a phone.',
            cap: ['Order now first, on desktop and phone', 'therumson.com, live'],
        },
        notes: {
            label: 'Under the hood',
            title: ['Menu, cart and table,', 'in one place.'],
            items: [
                { t: 'A menu that filters', b: 'Search, a price range, sorting and category tabs over the full menu.' },
                { t: 'Dish pages', b: 'Dietary tags, a quantity picker, and Add to cart or Order now.' },
                { t: 'Three-step checkout', b: 'Details, delivery method, then payment, with delivery by region and city or free self-pickup.' },
                { t: 'Reevit payments', b: 'The checkout hands the charge to Reevit, with Paystack behind it.' },
                { t: 'Table bookings', b: 'Lunch and dinner slots every half hour, with the occasion and special requests.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'React 19', 'Better Auth', 'Reevit', 'Paystack', 'Turso', 'Cloudflare'],
        },
        gallery: {
            label: 'The site',
            title: ['From the menu', 'to the checkout.'],
            aside: ['Four screens', 'from therumson.com'],
            items: [
                { src: '/assets/case/the-rumson-s1.jpg', w: 2160, h: 1350, alt: '“What’s on the table”: goat pepper soup, grilled skewers and kelewele with groundnuts, each with a description and a price in cedis', cap: 'Kitchen highlights', note: 'Home', span: 12, bar: 'therumson.com' },
                { src: '/assets/case/the-rumson-s2.jpg', w: 2160, h: 1350, alt: 'Menu page: search, price and sort controls above ten category tabs and the first dish photographs', cap: 'The menu', note: '/menu', span: 4, bar: 'therumson.com/menu' },
                { src: '/assets/case/the-rumson-s3.jpg', w: 2160, h: 1350, alt: 'Kelewele with Groundnuts: Chef’s pick, vegetarian and gluten-free tags, GH₵49, Add to cart and Order now', cap: 'Dish page', note: '/menu', span: 4, bar: 'therumson.com/menu' },
                { src: '/assets/case/the-rumson-s5.jpg', w: 2160, h: 1350, alt: 'Checkout step one: customer details and delivery address beside the order, tax, self-pickup and a promo code field', cap: 'Checkout', note: '/checkout', span: 4, bar: 'therumson.com/checkout' },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#C62128',
            onAccent: '#1D0C0C',
            accentText: '#E4676D',
            heroAccent: '#E4676D',
            tint: '#131816',
            tint2: '#0C0F0D',
            tintInk: '#EEF2F0',
            tintMuted: '#87978F',
            glow: 'rgba(198,33,40,0.22)',
        },
    },
    '7even-sports-group': {
        rich: true,
        tagline: ['Empowering Ghana’s grassroots athletes', 'through leagues, development programmes and global exposure.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Client', v: '7even Sports Group' },
            { k: 'Stack', v: 'Remix, React, TypeScript, Prisma', note: 'PostgreSQL, Cloudinary, Paystack, AWS' },
            { k: 'Year', v: '2024' },
        ],
        stage: {
            alt: '7even Sports Group homepage: “A club for every code.” beside photos of league matches and a trophy',
        },
        brief: {
            statement: 'Ghana’s grassroots sporting dreams,',
            muted: 'woven together with global opportunities.',
            story: [
                {
                    h: 'The process',
                    body: [
                        'Detailed discussions with stakeholders pointed to a robust system that could handle every part of sports management, from fixture scheduling to real-time match tracking.',
                        'The result is a competition management platform for organisations, teams and players.',
                    ],
                },
                {
                    h: 'The outcome',
                    body: [
                        'The platform manages over 50 active competitions across multiple sports, handling thousands of matches and player statistics in real time.',
                        'Organisations coordinate their tournaments, while teams and players get performance analytics and automated fixture scheduling.',
                    ],
                },
            ],
        },
        notes: {
            label: 'Key features',
            title: ['From fixture scheduling', 'to real-time match tracking.'],
            items: [
                {
                    t: 'Competition management',
                    b: 'Create and run multiple competitions in custom formats, handle team registrations and invitations, generate fixtures automatically and track standings live.',
                },
                {
                    t: 'Team management',
                    b: 'Team profiles with performance analytics, roster management, historical statistics, and an application and verification flow for new teams.',
                },
                {
                    t: 'Match management',
                    b: 'Real-time match tracking and scoring, team and player statistics, player ratings, and match reports.',
                },
                {
                    t: 'Analytics and reporting',
                    b: 'Performance analytics for competitions, teams and players, customisable dashboards, historical trends and charts.',
                },
                {
                    t: 'User experience',
                    b: 'Real-time updates, role-based access for each type of user, a mobile-responsive design and a full notification system.',
                },
            ],
            chipsLabel: 'Stack',
            chips: ['Remix', 'React', 'TypeScript', 'Prisma', 'PostgreSQL', 'Cloudinary', 'Paystack', 'AWS'],
        },
        gallery: {
            label: 'The site',
            title: ['Building and uniting communities', 'through sports.'],
            items: [
                {
                    id: 'projects/7even-sports-banner',
                    w: 1600,
                    h: 906,
                    alt: '7even Sports homepage hero: “Building communities through sports” with Get started and Join community buttons',
                    cap: 'Homepage',
                    note: '7evensportsgroup.com',
                    span: 6,
                    bar: '7evensportsgroup.com',
                },
                {
                    id: 'projects/7even-mission',
                    w: 1600,
                    h: 905,
                    alt: '“Beyond the field: uniting communities through sport”, beside a player kissing a trophy',
                    cap: 'Mission',
                    note: '7evensportsgroup.com',
                    span: 6,
                    bar: '7evensportsgroup.com',
                },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#B88807',
            onAccent: '#1F1909',
            accentText: '#E0BA52',
            heroAccent: '#E0BA52',
            tint: '#1D190E',
            tint2: '#110F09',
            tintInk: '#F4F2EC',
            tintMuted: '#A69F8C',
            glow: 'rgba(184,136,7,0.22)',
        },
    },
    'css': {
        rich: true,
        tagline: ['Communication and connectivity solutions', 'for businesses.'],
        credits: [
            { k: 'Category', v: 'Connectivity solutions' },
            { k: 'Company', v: 'Connectivity Support Systems Ltd', note: 'Accra' },
            { k: 'Built with', v: 'Next.js, Payload CMS, Tailwind CSS', note: 'detected on the live site' },
        ],
        stage: {
            src: '/assets/case/css-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'techbycss.com',
            alt: 'CSS homepage: “We specialize in Communication & Connectivity Solutions” in large white type over a black-to-teal gradient',
        },
        brief: {
            statement: 'A one-page profile for a connectivity company,',
            muted: 'from USSD and bulk SMS to internet for events.',
            story: [
                {
                    h: 'The company',
                    body: [
                        'Connectivity Support Systems (CSS) is an Accra company that provides communication and connectivity tools to businesses, organisations and institutions.',
                        'It names finance, healthcare and e-commerce as the industries it serves.',
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'A single scrolling page with four anchors: About, Solutions, Why us and Get in touch.',
                        'It moves from the company statement to its mission, vision and values, then nine solutions, and ends on the address.',
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The same statement,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/css-s0.jpg',
            url: 'techbycss.com',
            mobile: '/assets/case/css-mobile.jpg',
            alt: 'CSS on a phone: “We specialize in Communication & Connectivity Solutions” centred over the teal gradient',
            sr: 'CSS on desktop and on a phone.',
            cap: ['One statement, on desktop and phone', 'techbycss.com, live'],
        },
        notes: {
            label: 'The solutions',
            title: ['Nine services,', 'one page.'],
            items: [
                { t: 'Reach without data', b: 'USSD menus for balances, subscriptions and surveys, and bulk SMS for promotional and transactional messages.' },
                { t: 'Payments', b: 'Mobile money and online gateways built into business applications.' },
                { t: 'Software', b: 'Web and mobile applications, and APIs that connect payment platforms, CRMs and shops.' },
                { t: 'Infrastructure', b: 'Cloud hosting for applications and data, and security from encryption to intrusion detection.' },
                { t: 'Events', b: 'On-demand internet for events, conferences and corporate gatherings.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'GSAP', 'Lenis', 'Swiper'],
        },
        gallery: {
            label: 'The page',
            title: ['Statement, values,', 'solutions.'],
            aside: ['Four screens', 'from techbycss.com'],
            items: [
                { src: '/assets/case/css-s3.jpg', w: 2160, h: 1350, alt: 'Solution cards: USSD Solutions, Bulk SMS Services and Payment Platform Integration above web, mobile and API development', cap: 'Solutions', note: '#solutions', span: 12, bar: 'techbycss.com' },
                { src: '/assets/case/css-s1.jpg', w: 2160, h: 1350, alt: '“About Our Company”: a line-art arrow beside “We are a cutting-edge company dedicated to providing seamless communication and connectivity solutions”', cap: 'About', note: '#about', span: 4, bar: 'techbycss.com' },
                { src: '/assets/case/css-s2.jpg', w: 2160, h: 1350, alt: 'The vision, “Become the leading provider of communication and connectivity solutions in Africa”, beside value cards', cap: 'Vision and values', note: '#about', span: 4, bar: 'techbycss.com' },
                { src: '/assets/case/css-s4.jpg', w: 2160, h: 1350, alt: 'Solution cards for cloud hosting and data, cybersecurity, and on-demand internet for events', cap: 'More solutions', note: '#solutions', span: 4, bar: 'techbycss.com' },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#5DC3A6',
            onAccent: '#0F1A17',
            accentText: '#6AC8AD',
            heroAccent: '#6AC8AD',
            tint: '#0F161C',
            tint2: '#0A0D11',
            tintInk: '#ECF0F4',
            tintMuted: '#9AA6B2',
            glow: 'rgba(93,195,166,0.22)',
        },
    },
    'the-arck-interior': {
        rich: true,
        tagline: ['Thoughtfully designed kitchens and living spaces', 'that reflect your personality and style.'],
        credits: [
            { k: 'Category', v: 'Interior design' },
            { k: 'Built with', v: 'Next.js, Payload CMS', note: 'detected on the live site' },
            { k: 'Hosting', v: 'Vercel', note: 'detected on the live site' },
        ],
        stage: {
            src: '/assets/case/the-arck-interior-s0.jpg',
            w: 2160,
            h: 1350,
            url: 'thearckinteriorltd.com',
            alt: 'The Arck Interior homepage: “Home is where style meets comfort” over a dark kitchen with walnut cabinetry and a lit splashback, with Get free consultation',
        },
        brief: {
            statement: 'A showroom for kitchens and living spaces',
            muted: 'that ends in a free consultation.',
            story: [
                {
                    h: 'The studio',
                    body: [
                        'The Arck Interior designs and fits kitchens, living rooms and offices, along with wardrobes, TV units and vanity units, from its base off the Kwashieman–Ofankor highway in Accra.',
                        'By its own account, it has been doing so for more than six years.',
                    ],
                },
                {
                    h: 'The site',
                    body: [
                        'One long homepage carries the pitch: the hero kitchen, a gallery, four service cards and the process.',
                        'Each service card opens a detailed list. Kitchen design, for one, runs from layout and custom cabinetry to countertops.',
                    ],
                },
                {
                    h: 'The process',
                    body: ['Five steps; by the studio’s estimate, most projects finish within 8 to 12 weeks.'],
                    list: [
                        { b: 'Consultation.', t: 'An in-home visit to measure the space and agree the budget.' },
                        { b: '3D design.', t: 'Renderings and floor plans before any work starts.' },
                        { b: 'Refine, source, install.', t: 'Feedback rounds, then materials, trades and installation, managed for the client.' },
                    ],
                },
            ],
        },
        compose: {
            label: 'Every screen',
            title: ['The kitchen,', 'on a phone.'],
            aside: ['Desktop 1440', 'Mobile 390'],
            desktop: '/assets/case/the-arck-interior-s0.jpg',
            url: 'thearckinteriorltd.com',
            mobile: '/assets/case/the-arck-interior-mobile.jpg',
            alt: 'The Arck Interior on a phone: “Home is where style meets comfort” over the walnut kitchen, with Get free consultation',
            sr: 'The Arck Interior on desktop and on a phone.',
            cap: ['A free consultation one tap away, on desktop and phone', 'thearckinteriorltd.com, live'],
        },
        notes: {
            label: 'On the site',
            title: ['From first visit', 'to installation.'],
            items: [
                { t: 'Service detail', b: 'Kitchen, living room, consultation and specialty services each open a full list of what is included.' },
                { t: 'Five-step process', b: 'Consultation, 3D design, refinement, sourcing and planning, then installation.' },
                { t: 'Consultation form', b: 'Opens over the page from any Get in touch button, beside the address, phone and email.' },
                { t: 'Category pages', b: 'A menu drawer leads to kitchens, wardrobes, TV units, offices and vanity units.' },
            ],
            chipsLabel: 'Stack',
            chips: ['Next.js', 'Payload CMS', 'GSAP', 'Lenis', 'Radix UI', 'Vercel'],
        },
        gallery: {
            label: 'The site',
            title: ['Services, process', 'and the first call.'],
            aside: ['Five screens', 'from thearckinteriorltd.com'],
            items: [
                { src: '/assets/case/the-arck-interior-s2.jpg', w: 2160, h: 1350, alt: '“Complete Design Solutions for Your Home”: photo cards for kitchens, living rooms, full-service consultation and custom solutions', cap: 'Services', note: 'Home', span: 12, bar: 'thearckinteriorltd.com' },
                { src: '/assets/case/the-arck-interior-s1.jpg', w: 2160, h: 1350, alt: '“Crafting Spaces That Inspire Daily Living” and the studio introduction above two kitchen photographs', cap: 'Introduction', note: 'Home', span: 6, bar: 'thearckinteriorltd.com' },
                { src: '/assets/case/the-arck-interior-s3.jpg', w: 2160, h: 1350, alt: '“Your Dream Space in Five Simple Steps”: consultation, 3D design, feedback and refine, sourcing and planning, installation', cap: 'Process', note: 'Home', span: 6, bar: 'thearckinteriorltd.com' },
                { src: '/assets/case/the-arck-interior-s4.jpg', w: 2160, h: 1350, alt: 'Kitchen Design & Renovation dialog listing space planning, custom cabinetry and countertops over the dimmed service cards', cap: 'Service detail', note: 'Dialog', span: 6, bar: 'thearckinteriorltd.com' },
                { src: '/assets/case/the-arck-interior-s5.jpg', w: 2160, h: 1350, alt: 'Consultation form, “Create your dream space with us.”, with name, email, phone and message beside the studio’s address and contacts', cap: 'Consultation form', note: 'Dialog', span: 6, bar: 'thearckinteriorltd.com' },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#A0662E',
            onAccent: '#1B140E',
            accentText: '#D19861',
            heroAccent: '#D19861',
            tint: '#1A1611',
            tint2: '#100D0B',
            tintInk: '#F4F0EC',
            tintMuted: '#A19487',
            glow: 'rgba(160,102,46,0.22)',
        },
    },
    'desmond-weds-akyeamaa': {
        rich: true,
        tagline: ['A wedding site for Desmond and Akyeamaa', 'to share their love story with invited guests.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Client', v: 'Desmond & Akyeamaa' },
            { k: 'Stack', v: 'Remix, Prisma, PostgreSQL', note: 'Tailwind CSS, GSAP, Fly.io' },
            { k: 'Year', v: '2023', note: 'built over six months' },
        ],
        stage: { alt: 'Desmond Weds Akyeamaa: an invite-code sign-in beside a photo of the proposal' },
        brief: {
            statement: 'A wedding website that tells the couple’s love story',
            muted: 'in their own words and designs.',
            story: [
                {
                    h: 'The brief',
                    body: [
                        'Desmond and Akyeamaa wanted to redefine the wedding experience and share their journey to marriage with their guests.',
                        'From their story and the timeline and gallery of their journey to the RSVPs, the site had to be a one-stop shop for the wedding.',
                    ],
                },
                {
                    h: 'The process',
                    body: [
                        'A series of meetings with the couple shaped the design and functionality.',
                        'The aim: a site that was easy to use and held all the information guests needed.',
                    ],
                },
                {
                    h: 'The outcome',
                    body: [
                        'The site handled RSVPs from over 200 guests and carried everything needed for the day.',
                        'It stayed easy to manage and maintain, and helped Desmond and Akyeamaa have a beautiful wedding.',
                    ],
                },
            ],
        },
        gallery: {
            label: 'The pages',
            title: ['Onboarding, story', 'and travel pages.'],
            items: [
                {
                    id: 'projects/dnaweds_oyk1mx',
                    w: 1600,
                    h: 1200,
                    alt: 'The Desmond Weds Akyeamaa homepage on a laptop: the couple in a golden field under the D&A monogram',
                    cap: 'Desmond Weds Akyeamaa',
                    note: 'Mockup',
                    span: 12,
                    wide: true,
                },
                {
                    id: 'projects/onboarding-pages',
                    w: 1600,
                    h: 1236,
                    alt: 'Design board of the user onboarding, login, password reset and email screens',
                    cap: 'Onboarding pages',
                    note: 'Design board',
                    span: 6,
                },
                {
                    id: 'projects/landing-page',
                    w: 1600,
                    h: 1487,
                    alt: 'Landing page: the couple under the D&A monogram, a verse from 1 Corinthians 13:13, and “Two Hearts”',
                    cap: 'Landing page',
                    note: 'Design board',
                    span: 6,
                },
                {
                    id: 'projects/story-page',
                    w: 1600,
                    h: 1410,
                    alt: 'Desktop layouts for Desmond’s story and Akyeamaa’s story',
                    cap: 'Their story',
                    note: 'Design board',
                    span: 6,
                },
                {
                    id: 'projects/travel-page',
                    w: 1600,
                    h: 1406,
                    alt: 'Travel page: “Akwaaba: Welcome to Ghana”, with Independence Square and facts about Ghana',
                    cap: 'Travel information',
                    note: 'Design board',
                    span: 6,
                },
            ],
        },
        theme: {
            tone: 'dark',
            accent: '#E8C9B4',
            onAccent: '#1B130E',
            accentText: '#E8C9B4',
            heroAccent: '#E8C9B4',
            tint: '#131419',
            tint2: '#0C0C0F',
            tintInk: '#EDEEF2',
            tintMuted: '#9C9FAB',
            glow: 'rgba(232,201,180,0.16)',
        },
    },
    'undisciplined': {
        rich: true,
        tagline: ['Education that’s about understanding', 'and applying knowledge to solve real-world problems.'],
        credits: [
            { k: 'Role', v: 'Developer' },
            { k: 'Client', v: 'Dawncraft Designs' },
            { k: 'Stack', v: 'Remix, Tailwind CSS', note: 'GSAP, Framer Motion' },
            { k: 'Year', v: '2024', note: 'built over three months' },
        ],
        stage: { alt: 'Undisciplined homepage: “Connecting culture & technology” framed by green line art' },
        brief: {
            statement: 'A website that reflects a unique identity,',
            muted: 'and offers an immersive experience.',
            story: [
                {
                    h: 'The challenge',
                    body: [
                        'Undisciplined explores interdisciplinary creative work for an audience interested in art, culture, technology and unconventional ideas.',
                    ],
                    list: [
                        { b: 'Brand.', t: 'Reflect the eclectic, interdisciplinary nature of the platform.' },
                        { b: 'Content.', t: 'Present a wide range of content types as one cohesive whole.' },
                        { b: 'Engagement.', t: 'An interactive, immersive experience that holds the audience.' },
                        { b: 'Search.', t: 'Better visibility on search engines.' },
                    ],
                },
                {
                    h: 'The process',
                    body: [
                        'Felix worked with Dawncraft Designs and the owner to understand the vision, audience and content strategy.',
                    ],
                    list: [
                        {
                            b: 'Build.',
                            t: 'A responsive, interactive site built with Remix, Sanity, Tailwind and TypeScript.',
                        },
                        { b: 'Rich media.', t: 'Dynamic galleries, video players and podcast embeds.' },
                        {
                            b: 'Testing.',
                            t: 'Tested across devices and browsers for compatibility and performance.',
                        },
                    ],
                },
                {
                    h: 'The outcome',
                    list: [
                        {
                            b: 'Content.',
                            t: 'A 45% increase in content views and interactions across articles, videos, podcasts and galleries.',
                        },
                        { b: 'Search.', t: 'A 40% improvement in organic search rankings.' },
                        {
                            b: 'Feedback.',
                            t: 'Users praised the visual appeal, the ease of navigation and the immersive experience.',
                        },
                    ],
                },
            ],
        },
        gallery: {
            label: 'The pages',
            title: ['Landing, explore', 'and story pages.'],
            items: [
                {
                    id: 'projects/undisciplined_cbc48a',
                    w: 1600,
                    h: 1200,
                    alt: 'The Undisciplined homepage on a laptop: “Connecting culture & technology”',
                    cap: 'Undisciplined website',
                    note: 'Mockup',
                    span: 12,
                    wide: true,
                },
                {
                    id: 'projects/screen_one',
                    w: 1600,
                    h: 1399,
                    alt: 'Landing and course-map screens with orbiting topic nodes on a dark starfield',
                    cap: 'Landing page',
                    note: 'Design board',
                    span: 4,
                },
                {
                    id: 'projects/screen_two',
                    w: 1600,
                    h: 1397,
                    alt: 'Explore screens: topic panels beside a glowing green orb, and artefact cards',
                    cap: 'Exploring page',
                    note: 'Design board',
                    span: 4,
                },
                {
                    id: 'projects/screen_three',
                    w: 1600,
                    h: 1012,
                    alt: 'Our Story and Contact Us pages in dark green line art',
                    cap: 'Story page',
                    note: 'Design board',
                    span: 4,
                },
            ],
        },
        quote: {
            label: 'In their words',
            text: 'The website created for Undisciplined perfectly captures the essence of our platform.',
            em: 'The innovative design and seamless user experience have significantly boosted our engagement and content reach.',
            by: 'Undisciplined',
            role: 'Client feedback, from the project write-up',
            mark: 'U',
        },
        theme: {
            tone: 'dark',
            accent: '#8ED813',
            onAccent: '#171F0A',
            accentText: '#ABE052',
            heroAccent: '#ABE052',
            tint: '#151616',
            tint2: '#0D0D0D',
            tintInk: '#EFF0F0',
            tintMuted: '#AAABAC',
            glow: 'rgba(142,216,19,0.22)',
        },
    },
};

export const getDetail = (slug: string) => DETAILS[slug];

/** The project after this one (order is 1-based, wraps 15 -> 1). */
export const nextProject = (p: Project) => PROJECTS[p.order % PROJECTS.length];
