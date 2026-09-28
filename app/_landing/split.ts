/* Landing hero headline: masked word-by-word reveal (the prototype's FY.splitWords on h1[data-split]).

   The prototype split the headline synchronously from a script at the end of <body>, before first paint.
   To keep that (no flash of the unsplit headline before hydration), the landing page ships the same
   splitter as an inline script right after <main>. <HeroTitle> then renders the identical split markup
   on the client, so hydration matches the already-split DOM and React stays the owner of the tree.
   Both only run with html.motion (reduced motion keeps the plain headline, as in the prototype). */

export const HERO_TEXT = 'I design interfaces people love — ';
export const HERO_SOFT = 'and engineer the systems behind them.';

export type Token = { word: string; i: number } | ' ';

/** Same tokenisation as splitWords(): whitespace runs collapse to one space, each word gets a running --i. */
export function tokens(text: string, start: number): Token[] {
    let i = start;
    const out: Token[] = [];
    text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) out.push(' ');
        else out.push({ word: part, i: i++ });
    });
    return out;
}

export const heroLabel = (HERO_TEXT + HERO_SOFT).replace(/\s+/g, ' ').trim();

/** Inline, pre-paint version of lib/site/fy.ts splitWords() for the SSR'd headline. The style attribute is
    written exactly as React serialises style={{ '--i': n }}, so hydration sees no difference. */
export const HERO_SPLIT_SCRIPT = `(function(){var d=document;if(!d.documentElement.classList.contains('motion'))return;var el=d.querySelector('h1[data-split]');if(!el||el.classList.contains('is-split'))return;var i=0;function walk(node){Array.prototype.slice.call(node.childNodes).forEach(function(n){if(n.nodeType===3){var f=d.createDocumentFragment();n.textContent.split(/(\\s+)/).forEach(function(p){if(!p)return;if(/^\\s+$/.test(p)){f.appendChild(d.createTextNode(' '));return}var w=d.createElement('span');w.className='w';var s=d.createElement('span');s.textContent=p;s.setAttribute('style','--i:'+i++);w.appendChild(s);f.appendChild(w)});node.replaceChild(f,n)}else if(n.nodeType===1)walk(n)})}walk(el);el.setAttribute('aria-label',el.textContent.replace(/\\s+/g,' ').trim());el.classList.add('is-split');requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('is-in')})})})()`;
