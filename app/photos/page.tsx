import type { Metadata } from 'next';
import { Cormorant_Garamond } from 'next/font/google';

import { siteConfig } from '@/config/site';
import { PageStyle } from '@/core/site/chrome';
import { HAS_SAMPLES, PHOTOS, SETS, pad3, photoFull } from '@/lib/site/photos';

import { Book } from './book';
import { roman } from './kit';

/* Photographs. Data comes from the manifest behind lib/site/photos.ts (see that file for how to add pictures). */

export const metadata: Metadata = {
    title: { absolute: 'Photos — Felix Yeboah' },
    description: 'Photographs by Felix Yeboah.',
    alternates: { canonical: '/photos' },
    /* placeholder stock is on the page until the real photographs replace it; keep that out of search */
    ...(HAS_SAMPLES ? { robots: { index: false, follow: true } } : {}),
};

/* The book's display face. The variable is set on <main>, which is also where the page stylesheet reads it. */
const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    style: ['normal', 'italic'],
    variable: '--font-cormorant',
    display: 'swap',
});

export default function PhotosPage() {
    const own = PHOTOS.filter((p) => !p.sample);
    const years = (PHOTOS.map((p) => p.date?.slice(0, 4)).filter(Boolean) as string[]).sort();
    const span = years.length ? [years[0], years[years.length - 1]].filter((y, i, a) => a.indexOf(y) === i).join('–') : null;
    const chapters = SETS.filter((s) => PHOTOS.some((p) => p.set === s.id)).length;
    const edition: [string, string][] = [
        ['Frames', pad3(PHOTOS.length)],
        ['Chapters', roman(chapters)],
        ...(span ? ([['Years', span]] as [string, string][]) : []),
    ];

    const jsonLd = own.length
        ? {
              '@context': 'https://schema.org',
              '@type': 'ImageGallery',
              name: 'Photographs by Felix Yeboah',
              url: siteConfig.url + '/photos',
              author: { '@type': 'Person', name: siteConfig.author, url: siteConfig.url },
              image: own.slice(0, 24).map((p) => ({
                  '@type': 'ImageObject',
                  contentUrl: siteConfig.url + photoFull(p),
                  width: p.w,
                  height: p.h,
                  creator: { '@type': 'Person', name: siteConfig.author },
                  ...(p.title ? { name: p.title } : {}),
                  ...(p.location ? { contentLocation: p.location } : {}),
              })),
          }
        : null;

    return (
        <main id="main" className={cormorant.variable} data-fy-skip="peek reveal magnetic">
            <PageStyle name="photos" />
            <Book photos={PHOTOS} sets={SETS} edition={edition} />
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
        </main>
    );
}
