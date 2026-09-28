import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { PageStyle } from '@/core/site/chrome';
import { getDetail, type Theme } from '@/lib/site/project-details';
import { PROJECTS, getProject } from '@/lib/site/projects';

import {
    BriefBlock,
    ChaptersBlock,
    ComposeBlock,
    DiagramBlock,
    FactsBlock,
    GalleryBlock,
    Hero,
    NextTile,
    NotesBlock,
    QuoteBlock,
    vars,
} from './blocks';
import { CaseRuntime } from './case-runtime';

/* Port of design-options/site/work/<slug>.html (generator: tools/sitebuild/work_pages.py + work_pages.css/.js).
   One data-driven template: every block is optional and renders for any project that has it
   (see the field reference at the top of lib/site/project-details.ts). */

export const dynamicParams = false;

export function generateStaticParams() {
    return PROJECTS.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const p = getProject(slug);
    const d = getDetail(slug);
    if (!p || !d) return {};
    return {
        title: { absolute: `${p.name}: ${d.rich ? 'Case study' : p.category} · Felix Yeboah` },
        description: d.description || p.desc,
    };
}

const themeStyle = (t: Theme) =>
    vars({
        '--p-accent': t.accent,
        '--p-on-accent': t.onAccent,
        '--p-accent-text': t.accentText,
        '--p-hero-accent': t.heroAccent,
        '--p-tint': t.tint,
        '--p-tint-2': t.tint2,
        '--p-tint-ink': t.tintInk,
        '--p-tint-muted': t.tintMuted,
        '--p-glow': t.glow,
    });

export default async function ProjectPage({ params }: Props) {
    const { slug } = await params;
    const p = getProject(slug);
    const d = getDetail(slug);
    if (!p || !d) notFound();

    /* section numbers count only the blocks present, in template order */
    let n = 0;
    const blocks: ReactNode[] = [];
    if (d.brief) blocks.push(<BriefBlock key="brief" b={d.brief} n={++n} />);
    if (d.chapters) blocks.push(<ChaptersBlock key="chapters" c={d.chapters} n={++n} />);
    if (d.compose) blocks.push(<ComposeBlock key="compose" m={d.compose} n={++n} />);
    if (d.diagram) blocks.push(<DiagramBlock key="diagram" dg={d.diagram} notes={d.notes} n={++n} />);
    else if (d.notes) blocks.push(<NotesBlock key="notes" notes={d.notes} n={++n} />);
    /* #screens belongs to compose when a project has both */
    if (d.gallery) blocks.push(<GalleryBlock key="gallery" g={d.gallery} n={++n} id={d.compose ? 'gallery' : 'screens'} />);
    if (d.facts) blocks.push(<FactsBlock key="facts" f={d.facts} n={++n} />);
    if (d.quote) blocks.push(<QuoteBlock key="quote" q={d.quote} />);

    return (
        <main id="main" key={slug} className="case" data-project={slug} data-tone={d.theme.tone} style={themeStyle(d.theme)}>
            <PageStyle name="work-page" />
            <CaseRuntime tone={d.theme.tone} />
            <Hero p={p} d={d} />
            {blocks}
            <NextTile p={p} d={d} />
        </main>
    );
}
