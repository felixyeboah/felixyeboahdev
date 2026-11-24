/* Small versions of a project cover for list thumbnails (made by scripts/covers.mjs).
   "/assets/covers/reevit.jpg" -> thumbs/reevit-320.webp, -640.webp, -960.webp */
const WIDTHS = [320, 640, 960];

export function coverThumb(cover: string) {
    const base = cover.replace('/assets/covers/', '/assets/covers/thumbs/').replace(/\.jpg$/, '');
    return {
        src: `${base}-320.webp`,
        srcset: WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(', '),
        /* 160px beside the text, 120px on small screens, full width below 420px (see .thumb in column.css) */
        sizes: '(max-width: 420px) calc(100vw - 32px), (max-width: 640px) 120px, 160px',
    };
}
