'use client';

import { useLayoutEffect, useState } from 'react';

/* Next-project hover preview (work_pages.js): the phone screenshot only loads for fine pointers on wide
   screens, so phones never download it; everywhere else the empty peek is removed. */
export function NextPeek({ src }: { src: string }) {
    const [mode, setMode] = useState<'idle' | 'show' | 'gone'>('idle');
    useLayoutEffect(() => {
        const ok =
            window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.matchMedia('(min-width: 901px)').matches;
        setMode(ok ? 'show' : 'gone');
    }, []);
    if (mode === 'gone') return null;
    if (mode === 'idle') return <div className="next__peek" aria-hidden="true" data-src={src} />;
    return (
        <div className="next__peek" aria-hidden="true">
            <img src={src} alt="" width={780} height={1688} decoding="async" />
        </div>
    );
}
