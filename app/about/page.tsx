import { PageStyle } from '@/core/site/chrome';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

/* Port of design-options/site/about.html (generator: tools/sitebuild/about.py). */

export const metadata: Metadata = {
    title: { absolute: 'About — Felix Yeboah' },
    description:
        'Felix Yeboah is a self-taught software developer in Accra, Ghana, building functional, beautiful interfaces for the web and mobile since 2012.',
};

export default function AboutPage() {
    return (
        <main id="main">
            <PageStyle name="about" />
            <header className="pagehead wrap">
                <p className="pagehead__crumb mono" data-reveal="">
                    <Link href="/">Index</Link>
                    <span className="sep" aria-hidden="true" />
                    <span aria-current="page">About</span>
                    <span className="end">
                        <span className="dot" aria-hidden="true" />
                        Accra, Ghana
                    </span>
                </p>
                <h1 className="pagehead__title" data-reveal="" style={{ '--d': '60ms' } as CSSProperties}>
                    Hi, I&rsquo;m Felix. <span className="soft">I build things for the web and mobile.</span>
                </h1>
                <div className="pagehead__foot">
                    <p className="pagehead__lede" data-reveal="" style={{ '--d': '140ms' } as CSSProperties}>
                        A software developer, and a life-long learner. Over the years I&rsquo;ve been building functional, beautiful
                        interfaces and experiences that leave a positive impact on people and businesses.
                    </p>
                    <p className="pagehead__meta mono" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                        Self-taught
                        <br />
                        Writing code since 2012
                    </p>
                </div>
            </header>
            <section className="wrap" aria-labelledby="story-title">
                <div className="intro">
                    <figure className="ph ph--tall" data-reveal="">
                        <img
                            src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1100/felixyeboah.dev/IMG_7337_tmsrzq"
                            srcSet="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_700/felixyeboah.dev/IMG_7337_tmsrzq 700w, https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1100/felixyeboah.dev/IMG_7337_tmsrzq 1100w"
                            sizes="(max-width: 900px) 100vw, 40vw"
                            width={1100}
                            height={1467}
                            alt="Felix Yeboah wearing headphones, working on a laptop"
                            fetchPriority="high"
                        />
                        <figcaption className="mono">
                            <span>
                                <strong>Felix Yeboah</strong>Engineer / Designer
                            </span>
                            <span style={{ textAlign: 'right' }}>
                                5.6037&deg; N<br />
                                0.1870&deg; W
                            </span>
                        </figcaption>
                    </figure>
                    <div className="story">
                        <p className="story__label mono" data-reveal="">
                            <i>(01)</i> The short version
                        </p>
                        <h2 id="story-title" data-reveal="" style={{ '--d': '60ms' } as CSSProperties}>
                            How I got into tech.
                        </h2>
                        <p className="story__big" data-reveal="" style={{ '--d': '120ms' } as CSSProperties}>
                            After high school in 2011, I wanted to further my education at university, but the financial burden was too much
                            for my parents to bear. I had to find a way to make money to support myself.{' '}
                            <strong>I started learning how to code on my own in 2012</strong> and got my first job as a software developer
                            in 2016. Before that, I was mostly working as a freelancer. I have been working as a software developer since
                            then.
                        </p>
                        <dl className="facts3 mono" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                            <div>
                                <dt>First line of code</dt>
                                <dd>2012</dd>
                            </div>
                            <div>
                                <dt>First dev job</dt>
                                <dd>2016</dd>
                            </div>
                            <div>
                                <dt>Based</dt>
                                <dd>Accra</dd>
                            </div>
                        </dl>
                        <p className="mono" data-reveal="" style={{ '--d': '200ms' } as CSSProperties}>
                            <Link className="link-arrow" href="/writing/how-i-got-here-pt-2-the-software-development-journey">
                                Read my full story{' '}
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
            <section className="section" aria-labelledby="fun-title">
                <div className="wrap">
                    <div className="shead">
                        <p className="shead__label mono" data-reveal="">
                            <i>(02)</i> Off the resume
                        </p>
                        <h2 className="shead__title" id="fun-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                            Some fun things you should <span className="soft">know about me.</span>
                        </h2>
                    </div>
                    <div className="fun">
                        <figure className="ph ph--fun" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_1000/felixyeboah.dev/IMG_7341_dqpzxu"
                                width={1000}
                                height={1333}
                                alt="Felix smiling and waving from behind a laptop"
                                loading="lazy"
                                decoding="async"
                            />
                        </figure>
                        <div className="fun__list">
                            <div className="fun__item" data-reveal="">
                                <span className="mono">01</span>
                                <div>
                                    <h3>Eye for design</h3>
                                    <p>
                                        I have a keen eye for design and I love to create beautiful and easy to use interfaces. I have a
                                        good understanding of design principles and I am able to create beautiful and functional interfaces
                                        that are easy to use.
                                    </p>
                                </div>
                            </div>
                            <div className="fun__item" data-reveal="">
                                <span className="mono">02</span>
                                <div>
                                    <h3>My experience</h3>
                                    <p>
                                        Currently, I build solutions at{' '}
                                        <a href="https://completefarmer.com" target="_blank" rel="noopener">
                                            Complete Farmer
                                        </a>{' '}
                                        to connect farmers to global food buyers and growing with them to give them a competitive edge
                                        across the supply chain.
                                    </p>
                                    <p>
                                        I worked as a contractor for a few months at a UK based startup called{' '}
                                        <a href="https://primer.io" target="_blank" rel="noopener">
                                            Primer API Limited
                                        </a>{' '}
                                        as a frontend engineer contributing directly to the success and growth of the product area. Working
                                        closely with Product, Design, and Engineering teams to bring elegant and intuitive experiences to
                                        life. Being heavily involved in key technology decisions and features, building for scale, and
                                        optimizing for output.
                                    </p>
                                </div>
                            </div>
                            <div className="fun__item" data-reveal="">
                                <span className="mono">03</span>
                                <div>
                                    <h3>My hobbies</h3>
                                    <p>
                                        In my spare time, you&rsquo;ll find me either learning something new, playing COD or FC24. I like
                                        listening to music, watching movies and traveling which helps me understand life and approach
                                        problems in different ways while shooting stunning photos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="section pad0" aria-labelledby="why-title">
                <div className="wrap">
                    <div className="shead">
                        <p className="shead__label mono" data-reveal="">
                            <i>(03)</i> Working together
                        </p>
                        <h2 className="shead__title" id="why-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                            Why work with me?
                        </h2>
                        <p className="shead__aside mono" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                            <Link className="link-arrow" href="/resume">
                                Resume{' '}
                                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>
                        </p>
                    </div>
                    <ol className="whys" data-stagger="">
                        <li className="why" data-reveal="">
                            <div className="why__head">
                                <span className="mono">01</span>
                                <span className="why__go" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path
                                            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <h3>Client-Centric</h3>
                            <p>
                                Your satisfaction is my priority. I work closely with you to understand your needs and deliver the best
                                possible solution.
                            </p>
                        </li>
                        <li className="why" data-reveal="">
                            <div className="why__head">
                                <span className="mono">02</span>
                                <span className="why__go" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path
                                            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <h3>Quality Work</h3>
                            <p>
                                I take pride in my work and I always strive to deliver the best possible solution. I pay attention to detail
                                and I make sure that everything is done to the highest standard.
                            </p>
                        </li>
                        <li className="why" data-reveal="">
                            <div className="why__head">
                                <span className="mono">03</span>
                                <span className="why__go" aria-hidden="true">
                                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path
                                            d="M4.5 11.5l7-7m0 0H5.5m6 0v6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </div>
                            <h3>Creative Solutions</h3>
                            <p>
                                I am a creative thinker and I always look for new and innovative ways to solve problems. I am not afraid to
                                think outside the box and I always strive to deliver creative solutions that are both functional and
                                beautiful.
                            </p>
                        </li>
                    </ol>
                </div>
            </section>
            <section className="section pad0" aria-labelledby="places-title">
                <div className="wrap">
                    <div className="shead">
                        <p className="shead__label mono" data-reveal="">
                            <i>(04)</i> Photographs
                        </p>
                        <h2 className="shead__title" id="places-title" data-reveal="" style={{ '--d': '80ms' } as CSSProperties}>
                            Places I&rsquo;ve been.
                        </h2>
                        <p className="shead__aside mono" data-reveal="" style={{ '--d': '160ms' } as CSSProperties}>
                            Ghana, Nigeria,
                            <br />
                            Spain, UK, Tanzania
                        </p>
                    </div>
                    <div className="places">
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/Squoosh_0447e197685e856892e90a2a5c3713d6a1aa3efc_3900x2600_a6g7wd"
                                width={900}
                                height={600}
                                alt="Larabanga Mosque in the Northern Region"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>01</span>Larabanga Mosque in the Northern Region
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/IMG_1197_gmyqxv"
                                width={900}
                                height={1200}
                                alt="Victoria Island, Lagos, Nigeria"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>02</span>Victoria Island, Lagos, Nigeria
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/IMG_4401_vmytlz"
                                width={900}
                                height={1600}
                                alt="Abseiling from the mountain"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>03</span>Abseiling from the mountain
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/Squoosh_Image_3900x2600_mo311y"
                                width={900}
                                height={600}
                                alt="An Elephant in the Mole National Park"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>04</span>An Elephant in the Mole National Park
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/IMG_1890_v0biqn"
                                width={900}
                                height={1200}
                                alt="Saint Juame’s Church, Spain"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>05</span>Saint Juame&rsquo;s Church, Spain
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/Squoosh_3900x2600_dcwnr7"
                                width={900}
                                height={600}
                                alt="Mountain view in the Volta Region of Ghana"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>06</span>Mountain view in the Volta Region of Ghana
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/IMG_2176_lbavci"
                                width={900}
                                height={675}
                                alt="Team Meetup in Primer’s London office"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>07</span>Team Meetup in Primer&rsquo;s London office
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/IMG_4450_vkzm8d"
                                width={900}
                                height={1600}
                                alt="Boat ride in Zanzibar, Tanzania"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>08</span>Boat ride in Zanzibar, Tanzania
                            </figcaption>
                        </figure>
                        <figure className="place" data-reveal="">
                            <img
                                src="https://res.cloudinary.com/jaeyholic/image/upload/fl_lossy,f_auto,q_auto,w_900/photos/Squoosh_792219a3a9b23587991f13a9a8ce6911039c1340_3900x2600_rkcygj"
                                width={900}
                                height={600}
                                alt="Kente weaving in Ho, Volta Region of Ghana"
                                loading="lazy"
                                decoding="async"
                            />
                            <figcaption className="mono">
                                <span>09</span>Kente weaving in Ho, Volta Region of Ghana
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </section>
            <section className="section pad0" aria-labelledby="cta-title" style={{ paddingBottom: '0' }}>
                <div className="wrap">
                    <div className="cta" data-reveal="">
                        <div>
                            <p className="cta__k mono">
                                <span className="dot" aria-hidden="true" />
                                Taking on select projects
                            </p>
                            <h2 id="cta-title">
                                Have a product worth building? <span className="soft">Let&rsquo;s talk.</span>
                            </h2>
                        </div>
                        <div className="cta__btns">
                            <Link className="btn btn--accent magnetic" href="/contact">
                                Start a project{' '}
                                <svg className="arrow-r" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path
                                        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </Link>{' '}
                            <Link className="btn btn--ghost magnetic" href="/work">
                                See the work
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
