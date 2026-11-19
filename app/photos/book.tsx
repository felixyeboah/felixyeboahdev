'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

import type { Photo, PhotoSet } from '@/lib/site/photos';

import { mountMonograph } from './monograph';

const TITLE = 'Photographs';

/* The book's markup. It holds no state of its own: monograph.ts fills the empty containers and owns
   everything that moves, so nothing here ever re-renders underneath it. */
export function Book({ photos, sets, edition }: { photos: Photo[]; sets: PhotoSet[]; edition: [string, string][] }) {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (root.current) return mountMonograph(root.current, photos, sets);
    }, [photos, sets]);

    return (
        <div ref={root}>
            <header className="cv wrap">
                <button className="cv__plate" type="button" id="cvPlate" data-cur="View" hidden />
                <h1 className="cv__title" aria-label={TITLE}>
                    {TITLE.split('').map((ch, i) => (
                        <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>
                            {ch}
                        </span>
                    ))}
                </h1>
                <p className="cv__by">Felix Yeboah</p>
                <dl className="cv__ed mono">
                    {edition.map(([k, v]) => (
                        <div key={k}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                        </div>
                    ))}
                </dl>
            </header>

            <div className="mg" id="book">
                <div className="mbar">
                    <div className="wrap mbar__in">
                        <div className="seg" role="group" aria-label="View" id="views">
                            <button type="button" data-v="plates">
                                Plates
                            </button>
                            <button type="button" data-v="contents">
                                Contents
                            </button>
                            <button type="button" data-v="columns">
                                Columns
                            </button>
                        </div>
                    </div>
                </div>

                <section className="mview pl" id="plates" tabIndex={-1} aria-roledescription="carousel" aria-label="Plates">
                    <div className="pl__sheet" id="sheet" />
                    <div className="pl__hud">
                        <div className="scrub" id="scrub" role="slider" tabIndex={0} aria-label="Plate" aria-valuemin={1} aria-valuenow={1}>
                            <div className="scrub__track" id="track">
                                <b className="scrub__fill" id="fill" />
                                <span className="scrub__knob" id="knob" />
                            </div>
                            <div className="scrub__tip" id="tip" hidden>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="" />
                                <span className="mono" />
                            </div>
                        </div>
                        <p className="pl__count mono" id="count" />
                        <button className="hb" type="button" id="prev" aria-label="Previous plate" />
                        <button className="hb" type="button" id="next" aria-label="Next plate" />
                        <button className="hb" type="button" id="auto" aria-pressed="false" aria-label="Autoplay" />
                    </div>
                    <p className="sr-only" aria-live="polite" id="live" />
                </section>

                <section className="mview toc wrap" id="contents" aria-label="Contents" hidden />
                <section className="mview" id="columns" aria-label="Columns" hidden />
            </div>
        </div>
    );
}
