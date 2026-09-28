'use client';

import { EMAIL, copy, toast } from '@/lib/site/fy';
import { type FormEvent, Fragment, useRef, useState } from 'react';

/* Contact form: validate, then compose a mailto: with the fields (no backend).
   Port of the inline script in design-options/site/contact.html. A field gets aria-invalid only once it
   has been checked (blur with a value, or submit); after that it re-validates on every keystroke. */

type Field = 'name' | 'email' | 'message';
const FIELDS: Field[] = ['name', 'email', 'message'];
const TO = EMAIL;

function validate(name: Field, v: string) {
    if (name === 'name') return v ? '' : 'Please add your name.';
    if (name === 'email')
        return !v
            ? 'Please add your email so I can reply.'
            : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
              ? ''
              : 'That email doesn’t look right.';
    return !v ? 'Tell me a little about the project.' : v.length < 20 ? 'A little more detail, please (20+ characters).' : '';
}

export function ContactForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const last = useRef('');
    /* key present = field has been checked; value = current message ('' when valid) */
    const [errs, setErrs] = useState<Partial<Record<Field, string>>>({});
    const [sent, setSent] = useState(false);

    const el = (name: string) => formRef.current!.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
    const check = (name: Field) => {
        const msg = validate(name, el(name).value.trim());
        setErrs((e) => ({ ...e, [name]: msg }));
        return !msg;
    };
    const invalid = (name: Field): 'true' | 'false' | undefined => (name in errs ? (errs[name] ? 'true' : 'false') : undefined);
    const bind = (name: Field) => ({
        'aria-invalid': invalid(name),
        onBlur: () => {
            if (el(name).value.trim()) check(name);
        },
        onInput: () => {
            if (errs[name]) check(name);
        },
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const bad = FIELDS.filter((n) => !check(n));
        if (bad.length) {
            el(bad[0]).focus();
            toast('Please fix the highlighted fields', { tone: 'error' });
            return;
        }
        const form = formRef.current!;
        const val = (n: string) => el(n).value.trim();
        const type = form.querySelector<HTMLInputElement>('input[name=type]:checked')?.value || 'Project';
        const subject = type + ' — ' + val('name');
        const body =
            val('message') +
            '\n\n—\nName: ' +
            val('name') +
            '\nEmail: ' +
            val('email') +
            '\nAbout: ' +
            type +
            (val('company') ? '\nCompany / link: ' + val('company') : '');
        last.current = 'To: ' + TO + '\nSubject: ' + subject + '\n\n' + body;
        setSent(true);
        toast('Opening your email app…');
        window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    };

    const onCopyMessage = () => {
        copy(last.current).then((ok) =>
            toast(ok ? 'Message copied. Paste it into any email to ' + TO : 'Couldn’t copy. Email ' + TO, ok ? {} : { tone: 'error' }),
        );
    };

    return (
        <form className="form" id="cform" noValidate ref={formRef} onSubmit={onSubmit}>
            <div className="form__row">
                <div className="field">
                    <label className="mono" htmlFor="name">
                        Your name <b>*</b>
                    </label>{' '}
                    <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        aria-describedby="name-err"
                        placeholder="Ama Mensah"
                        {...bind('name')}
                    />
                    <p className="field__err" id="name-err" role="alert">
                        {errs.name}
                    </p>
                </div>
                <div className="field">
                    <label className="mono" htmlFor="email">
                        Email <b>*</b>
                    </label>{' '}
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        aria-describedby="email-err"
                        placeholder="you@company.com"
                        {...bind('email')}
                    />
                    <p className="field__err" id="email-err" role="alert">
                        {errs.email}
                    </p>
                </div>
            </div>
            <div className="field">
                <label className="mono" htmlFor="company">
                    Company or link <span className="soft">(optional)</span>
                </label>{' '}
                <input type="text" id="company" name="company" autoComplete="organization" placeholder="company.com" />
            </div>
            <fieldset className="field">
                <legend className="mono">What&rsquo;s it about?</legend>
                <div className="pills" style={{ marginTop: '8px' }}>
                    {['New product', 'Website', 'Design', 'Engineering help', 'Mentorship', 'Something else'].map((t, i) => (
                        <Fragment key={t}>
                            {i > 0 ? ' ' : null}
                            <label className="pill">
                                <input type="radio" name="type" value={t} defaultChecked={i === 0} />
                                <span>{t}</span>
                            </label>
                        </Fragment>
                    ))}
                </div>
            </fieldset>
            <div className="field">
                <label className="mono" htmlFor="message">
                    The project <b>*</b>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    aria-describedby="message-hint message-err"
                    placeholder="What are you building, who is it for, and where are you stuck?"
                    {...bind('message')}
                />
                <p className="field__hint" id="message-hint">
                    A few sentences is plenty. Links welcome.
                </p>
                <p className="field__err" id="message-err" role="alert">
                    {errs.message}
                </p>
            </div>
            <div className={sent ? 'sent is-on' : 'sent'} id="sent" role="status">
                <p>
                    <strong>Your email app should be opening.</strong> If nothing happened, copy the message and send it to {TO} from any
                    inbox.
                </p>
                <div className="sent__btns">
                    <button className="btn btn--ghost btn--sm" type="button" id="copy-msg" onClick={onCopyMessage}>
                        Copy message
                    </button>
                    <button className="btn btn--ghost btn--sm" type="button" data-copy={TO}>
                        Copy email
                    </button>
                </div>
            </div>
            <div className="form__foot">
                <p>
                    Fields marked <span style={{ color: 'var(--accent)' }}>*</span> are required. Sends from your own email app.
                </p>
                <button className="btn btn--accent magnetic" type="submit">
                    Compose email{' '}
                    <svg className="arrow-ne" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </form>
    );
}
