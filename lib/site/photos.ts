/* =====================================================================
   Photographs: data for /photos.
   ---------------------------------------------------------------------
   Source of truth is the manifest written by `bun run photos` (scripts/photos.mjs):
     photos/<set>/*.jpg (+ optional set.json)  ->  public/photos/<id>-<width>.webp
                                                   lib/site/cache/photos.json
   To add pictures: drop originals in photos/<set>/, run `bun run photos`, commit the outputs.
   Every image URL goes through photoSrc(), so moving the files to a CDN is a one-line change.
   ===================================================================== */
import manifest from './cache/photos.json';

export type PhotoExif = {
    camera?: string;
    lens?: string;
    focal?: string;
    aperture?: string;
    shutter?: string;
    iso?: number;
};

export type Photo = {
    id: string;
    set: string;
    /** pixel size of the original, after EXIF rotation */
    w: number;
    h: number;
    /** variant widths that exist for this photo */
    widths: number[];
    color: string;
    /** five colours, dark to light */
    palette: string[];
    /** hue 0-360, saturation 0-1, lightness 0-1 of the most vivid palette colour */
    hsl: [number, number, number];
    lqip: string;
    date: string | null;
    title: string | null;
    location: string | null;
    credit: string | null;
    source: string | null;
    exif: PhotoExif | null;
    /** placeholder stock, not the owner's work */
    sample?: boolean;
};

export type PhotoSet = { id: string; title: string; count: number };

export const PHOTOS = manifest.photos as unknown as Photo[];
export const SETS = manifest.sets as PhotoSet[];
export const HAS_SAMPLES = PHOTOS.some((p) => p.sample);

export const photoSrc = (p: Photo, width: number) => `/photos/${p.id}-${width}.webp`;

/** Smallest variant at least `min` wide, else the largest there is. */
export const pickWidth = (p: Photo, min: number) => p.widths.find((w) => w >= min) ?? p.widths[p.widths.length - 1];

export const photoSrcSet = (p: Photo) => p.widths.map((w) => `${photoSrc(p, w)} ${w}w`).join(', ');

export const photoFull = (p: Photo) => photoSrc(p, p.widths[p.widths.length - 1]);

export const pad3 = (n: number) => String(n).padStart(3, '0');

export function photoDate(p: Photo) {
    if (!p.date) return null;
    const d = new Date(p.date + 'T00:00:00Z');
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Rainbow order; near-greys go last, dark to light. */
export function byColour(a: Photo, b: Photo) {
    const grey = (p: Photo) => p.hsl[1] < 0.14;
    if (grey(a) !== grey(b)) return grey(a) ? 1 : -1;
    if (grey(a)) return a.hsl[2] - b.hsl[2];
    return a.hsl[0] - b.hsl[0] || a.hsl[2] - b.hsl[2];
}
