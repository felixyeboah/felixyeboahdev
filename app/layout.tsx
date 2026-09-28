import { siteConfig } from '@/config/site';
import { Footer } from '@/core/site/chrome';
import { Nav } from '@/core/site/nav';
import { SiteRuntime } from '@/core/site/runtime';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './site.css';

const geist = Geist({ subsets: ['latin'], weight: 'variable', variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-geist-mono', display: 'swap' });

const ICON =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23F2EFE9'/%3E%3Ctext x='16' y='20.5' font-family='Arial' font-weight='700' font-size='12' text-anchor='middle' fill='%230B0B0C'%3EFY%3C/text%3E%3C/svg%3E";

export const viewport: Viewport = {
    themeColor: '#0B0B0C',
    viewportFit: 'cover',
};

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: 'Felix Yeboah — Software Engineer & Designer, Accra',
        template: '%s — Felix Yeboah',
    },
    description:
        'Felix Yeboah is a self-taught software engineer and UI/UX designer in Accra, Ghana. Ten years designing interfaces and engineering the systems behind them.',
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author, url: siteConfig.url }],
    creator: siteConfig.author,
    icons: { icon: ICON },
    alternates: { types: { 'application/rss+xml': '/writing/feed.xml' } },
    openGraph: {
        type: 'website',
        locale: siteConfig.siteLanguage,
        url: siteConfig.url,
        siteName: siteConfig.name,
    },
    twitter: {
        card: 'summary_large_image',
        site: siteConfig.twitter,
        creator: siteConfig.twitter,
    },
};

/* site.css names the families literally ("Geist", "Geist Mono") so glyphs Geist lacks (e.g. →) fall back to the
   system fonts exactly as in the prototype, not to next/font's size-adjusted Arial. */
/* Runs before first paint, like the prototype's blocking site.js: html.js, and html.motion unless reduced motion. */
const BOOT = `(function(){var r=document.documentElement;r.classList.add('js');if(!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))r.classList.add('motion')})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${geist.variable} ${geistMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
            </head>
            <body id="top">
                {/* First thing in <body>: parsed and run before any content paints. Kept out of <head>, where
                    browser extensions inject their own scripts and would throw off hydration. */}
                <script dangerouslySetInnerHTML={{ __html: BOOT }} />
                <a className="skip" href="#main">
                    Skip to content
                </a>
                <div className="grain" aria-hidden="true" />
                <Nav />
                {children}
                <Footer />
                <SiteRuntime />
            </body>
        </html>
    );
}
