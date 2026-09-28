import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FooterRss } from '@/core/site/footer-rss';
import { LINKS } from '@/lib/site/fy';

/** Shared footer (identical on every page). */
export function Footer() {
    return (
        <footer className="footer">
            <div className="footer__word" aria-hidden="true">
                Felix Yeboah
            </div>
            <div className="wrap footer__row mono">
                <span>
                    &copy; <span data-year>{new Date().getFullYear()}</span> Felix Yeboah
                </span>
                <span>Designed &amp; built in Accra</span>
                <nav className="footer__links" aria-label="Elsewhere">
                    <a href={LINKS.email}>Email</a>
                    <a href={LINKS.github} target="_blank" rel="noopener">
                        GitHub
                    </a>
                    <a href={LINKS.x} target="_blank" rel="noopener">
                        X / Twitter
                    </a>
                    <FooterRss />
                </nav>
                <a href="#top">Back to top &uarr;</a>
            </div>
        </footer>
    );
}

/**
 * Page-specific CSS, rendered as an inline <style> inside the page (like the prototype's per-page <style>),
 * so it mounts and unmounts with the page and never leaks into another route. Files live in styles/pages/.
 * Every route is statically generated, so this read happens at build time only.
 */
const cssCache = new Map<string, string>();
export function PageStyle({ name }: { name: string | string[] }) {
    const names = Array.isArray(name) ? name : [name];
    const css = names
        .map((n) => {
            if (!cssCache.has(n) || process.env.NODE_ENV !== 'production')
                cssCache.set(n, readFileSync(join(process.cwd(), 'styles/pages', `${n}.css`), 'utf8'));
            return cssCache.get(n)!;
        })
        .join('\n');
    return <style data-page-style={names.join(' ')} dangerouslySetInnerHTML={{ __html: css }} />;
}
