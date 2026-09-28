'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/* Reevit's routing diagram (work_pages.py REEVIT_DIAGRAM + work_pages.js): the animation plays once when the
   board is 45% in view, and the Replay button restarts it (motion only; without motion it is a static board). */

const v = (o: Record<string, string | number>) => o as CSSProperties;

export function RouteDiagram() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const route = ref.current;
        if (!route || !document.documentElement.classList.contains('motion')) return;
        let ro: IntersectionObserver | null = null;
        if (!('IntersectionObserver' in window)) route.classList.add('run');
        else {
            ro = new IntersectionObserver(
                (es) =>
                    es.forEach((en) => {
                        if (en.isIntersecting) {
                            route.classList.add('run');
                            ro?.disconnect();
                        }
                    }),
                { threshold: 0.45 },
            );
            ro.observe(route.querySelector('.route__board')!);
        }
        return () => {
            ro?.disconnect();
            route.classList.remove('run', 'reset');
        };
    }, []);

    const replay = () => {
        const route = ref.current;
        if (!route) return;
        route.classList.remove('run');
        route.classList.add('reset');
        void route.offsetWidth;
        route.classList.remove('reset');
        route.classList.add('run');
    };

    return (
        <div className="route" id="route" data-reveal="" ref={ref}>
            <div className="route__head mono">
                <span>Illustrative · one charge, mobile money</span>
                <button className="route__replay mono" type="button" aria-label="Replay the routing animation" onClick={replay}>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3.2h3.2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    Replay
                </button>
            </div>
            <div
                className="route__board"
                role="img"
                aria-label="The customer taps Pay at checkout. The Reevit router sends the charge to provider 1, Paystack, which does not respond. The router fails over to provider 2, Hubtel, which approves the charge, and a payment.succeeded webhook goes to the merchant's server."
            >
                <div className="route__lines route__lines--h" aria-hidden="true">
                    <span className="ln ln--h" style={v({ '--x': 12.5, '--y': 25, '--l': 25, '--t': '.3s', '--d': '.6s' })}>
                        <i />
                    </span>
                    <span className="ln ln--h ln--fail" style={v({ '--x': 37.5, '--y': 25, '--l': 25, '--t': '1.2s', '--d': '.6s' })}>
                        <i />
                    </span>
                    <span className="ln ln--v" style={v({ '--x': 37.5, '--y': 25, '--l': 50, '--t': '3.15s', '--d': '.45s' })}>
                        <i />
                    </span>
                    <span className="ln ln--h" style={v({ '--x': 37.5, '--y': 75, '--l': 25, '--t': '3.6s', '--d': '.35s' })}>
                        <i />
                    </span>
                    <span className="ln ln--h" style={v({ '--x': 62.5, '--y': 75, '--l': 25, '--t': '4.3s', '--d': '.5s' })}>
                        <i />
                    </span>
                </div>
                <div className="route__lines route__lines--v" aria-hidden="true">
                    <span className="ln ln--v" style={v({ '--x': 25, '--y': 12.5, '--l': 25, '--t': '.3s', '--d': '.6s' })}>
                        <i />
                    </span>
                    <span className="ln ln--h ln--fail" style={v({ '--x': 25, '--y': 37.5, '--l': 50, '--t': '1.2s', '--d': '.6s' })}>
                        <i />
                    </span>
                    <span className="ln ln--v" style={v({ '--x': 25, '--y': 37.5, '--l': 25, '--t': '3.15s', '--d': '.8s' })}>
                        <i />
                    </span>
                    <span className="ln ln--v" style={v({ '--x': 25, '--y': 62.5, '--l': 25, '--t': '4.3s', '--d': '.5s' })}>
                        <i />
                    </span>
                </div>
                <div className="route__legend mono" aria-hidden="true">
                    <span>
                        <i className="lg lg--ok" />
                        Charge path
                    </span>
                    <span>
                        <i className="lg lg--try" />
                        Attempt
                    </span>
                    <span>
                        <i className="lg lg--warn" />
                        Timed out, failed over
                    </span>
                </div>
                <div className="node node--c" style={v({ '--t': '0s' })}>
                    <span className="node__k mono">Checkout</span>
                    <b className="node__t">Customer taps Pay</b>
                    <span className="node__s">MoMo · GHS</span>
                </div>
                <div className="node node--r" style={v({ '--t': '.85s' })}>
                    <span className="node__k mono">
                        Reevit{' '}
                        <span className="node__mark" aria-hidden="true">
                            R
                        </span>
                    </span>
                    <b className="node__t">Router</b>
                    <span className="node__s">Chain: Paystack → Hubtel</span>
                </div>
                <div className="node node--p1" style={v({ '--t': '1.75s' })}>
                    <span className="node__k mono">Provider 1</span>
                    <b className="node__t">Paystack</b>
                    <span className="timer" aria-hidden="true">
                        <i />
                    </span>
                    <span className="tag tag--warn" style={v({ '--t': '2.95s' })}>
                        No response
                    </span>
                </div>
                <div className="node node--p2" style={v({ '--t': '3.9s' })}>
                    <span className="node__k mono">Provider 2</span>
                    <b className="node__t">Hubtel</b>
                    <span className="tag tag--ok" style={v({ '--t': '4.05s' })}>
                        Approved
                    </span>
                </div>
                <div className="node node--w" style={v({ '--t': '4.75s' })}>
                    <span className="node__k mono">Webhook</span>
                    <b className="node__t m">payment.succeeded</b>
                    <span className="tag tag--ok" style={v({ '--t': '4.9s' })}>
                        To your server
                    </span>
                </div>
            </div>
            <ol className="route__log" aria-label="Event sequence">
                {LOG.map(([t, n, text, cls]) => (
                    <li key={n} style={v({ '--t': t })}>
                        <span>{n}</span>
                        <b className={cls}>{text}</b>
                    </li>
                ))}
            </ol>
        </div>
    );
}

const LOG: Array<[string, string, string, string?]> = [
    ['.1s', '01', 'charge.created'],
    ['1.2s', '02', 'route → paystack'],
    ['2.95s', '03', 'paystack · no response', 'warn'],
    ['3.15s', '04', 'failover → hubtel'],
    ['4.05s', '05', 'hubtel · approved', 'ok'],
    ['4.9s', '06', 'webhook · payment.succeeded', 'ok'],
];
