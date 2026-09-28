'use client';

/** Resume print button: show every not-yet-revealed block, then open the print dialog
    (the page's print stylesheet turns the page into a clean one-column document). */
export function PrintButton() {
    const onPrint = () => {
        document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
        window.print();
    };
    return (
        <button className="btn btn--accent magnetic" type="button" data-print="" onClick={onPrint}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                    d="M4.5 6V2.5h7V6M4.5 11.5h-2v-5h11v5h-2M4.5 9.5h7v4h-7z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                />
            </svg>
            Print / Save as PDF
        </button>
    );
}
