import Link from 'next/link'
import Carousel from '@/components/Carousel'
import ScrollAnimations from '@/components/ScrollAnimations'
import CaseStudyLightbox from '@/components/CaseStudyLightbox'

export default function HomePage() {
  return (
    <>
      <ScrollAnimations />

      {/* ============ HERO CAROUSEL ============ */}
      <Carousel />

      {/* ============ 01 APPROACH ============ */}
      <section className="block" id="approach" data-screen-label="01 Approach">
        <div className="manifesto">
          <div className="left">
            <div className="eyebrow"><span className="num">01</span>The Approach</div>
            <h2 className="display">
              A visual language for places <em>people want to go.</em>
            </h2>
          </div>
          <div className="right">
            <p className="lede">
              Hotels don&apos;t sell rooms. Restaurants don&apos;t sell food. They sell the feeling of being there.
            </p>
            <div className="body-copy" style={{ marginTop: '2rem' }}>
              <p>
                I produce imagery for hospitality, travel, and lifestyle brands — the kind of work that translates atmosphere into something a marketing team can build a campaign around. Property sites, paid social, press kits, seasonal editorial: visuals designed to do real work for the brand.
              </p>
              <p>
                A background in business analytics shapes how I shoot. Every frame is built to move audiences, drive bookings, and reinforce a brand&apos;s visual identity — thinking like a marketer, shooting like a guest, editing like an editor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 02 CASE STUDY: BUBBL'R ============ */}
      <section className="block" id="case-bubblr" data-screen-label="02 Case Study">
        <div className="eyebrow"><span className="num">02</span>Case Study · Brand Partnership</div>

        <div className="case-head">
          <div>
            <h2 className="display">
              BUBBL&apos;R<br /><em>Lifestyle for a wellness-first sparkling brand.</em>
            </h2>
          </div>
          <p className="lede">
            Content built for the moments their drinker is actually in — the lake house, the orchard, the late-summer afternoon.
          </p>
        </div>

        <div className="case-meta">
          <div>
            <span className="m-label">Client</span>
            <span className="m-value">BUBBL&apos;R<br /><em>Antioxidant Sparkling Water</em></span>
          </div>
          <div>
            <span className="m-label">Scope</span>
            <span className="m-value">Creative direction<br /><em>Lifestyle production</em></span>
          </div>
          <div>
            <span className="m-label">Deliverables</span>
            <span className="m-value">Stills · Social<br /><em>Seasonal campaigns</em></span>
          </div>
          <div>
            <span className="m-label">Territory</span>
            <span className="m-value">U.S. Midwest<br /><em>Multi-season shoot</em></span>
          </div>
        </div>

        <CaseStudyLightbox />

        <div className="case-foot">
          <div className="body-copy">
            <p><strong>The brief.</strong></p>
            <p>BUBBL&apos;R needed lifestyle-first imagery that reinforced their core promise — clean, antioxidant-driven, real moments — without leaning on studio lighting or staged setups. The product had to live inside the day, not next to it.</p>
            <p><strong>The work.</strong></p>
            <p>A multi-season production across Wisconsin destinations: pumpkin patches at dusk, lake-house sunsets, forest settings. Aspirational but accessible — the same tonal language hospitality brands use when they&apos;re not trying to sound like one.</p>
            <p>Assets landed across paid social, organic Instagram, and seasonal campaign rollouts.</p>
          </div>
          <div>
            <div className="quote">Lifestyle imagery should look like a memory you&apos;re still inside of.</div>
            <div className="quote-attr">— Working note, shoot file</div>
          </div>
        </div>
      </section>

      {/* ============ 03 EDITORIAL FEATURE: HOSPITALITY ============ */}
      <section className="block" id="feature-1" data-screen-label="03 Editorial">
        <div className="eyebrow"><span className="num">03</span>Editorial · Property</div>
        <div className="feature">
          <div className="f-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/IMG_3338.JPG" alt="Boutique Greek resort terrace with bougainvillea and lantana at golden hour" loading="lazy" />
          </div>
          <div className="f-text">
            <h3 className="display">
              Hotels are built; <em>atmosphere is photographed.</em>
            </h3>
            <p className="lede">
              Property work that tells guests what it feels like to be there — before they&apos;ve booked.
            </p>
            <div className="body-copy">
              <p>
                Architecture establishes the credentials. Atmosphere makes the booking. I shoot property in the language of guest experience — light, gesture, the way an evening sets in.
              </p>
            </div>
            <Link
              href="/hospitality"
              className="contact-extras"
              style={{ display: 'inline-flex', flexDirection: 'row', marginTop: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
              </svg>
              View Hospitality &amp; Hotels
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 04 BRAND EYE ============ */}
      <section className="block" id="feature-2" data-screen-label="04 Brand Eye">
        <div className="eyebrow"><span className="num">04</span>The Brand Eye</div>
        <div className="brand-strip">
          <div>
            <h3 className="display">
              Composition as <em>marketing instinct.</em>
            </h3>
            <p className="lede">
              A Longball-branded canopy spotted from a La Jolla cliff — framed in the moment, the way a hospitality brand would want to see its name appear.
            </p>
            <div className="body-copy">
              <p>
                Photographers who can <em>see</em>{' '}a marketable moment make the difference between content and campaign. The Longball shot wasn&apos;t commissioned — it was a frame waiting to happen: a brand cue dropping cleanly into a landscape that already told a story of motion, coast, and easy afternoons.
              </p>
              <p>
                It&apos;s the way I see frames before I take them, and the same instinct I bring to commissioned partner work — scouting moments where a logo, a label, or a brand cue lands naturally inside the picture, not pasted on top of it.
              </p>
            </div>
            <div className="quote" style={{ marginTop: 'auto' }}>
              A brand cue should land inside the picture, not on top of it.
            </div>
            <div className="quote-attr">— Working note, La Jolla</div>
          </div>
          <div className="b-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/IMG_7983.JPG" alt="Longball-branded paraglider canopy framed against the La Jolla coast" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ============ 05 ARCHIVE ============ */}
      <section className="block" id="archive" data-screen-label="05 Archive">
        <div className="eyebrow"><span className="num">05</span>The Archive</div>
        <h2 className="display" style={{ marginBottom: '3rem', maxWidth: '18ch' }}>
          Three rooms of <em>the same body of work.</em>
        </h2>
        <div className="portfolio-index">
          <Link className="pi-card" href="/hospitality">
            <div className="pi-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/IMG_1137.JPG" alt="" />
            </div>
            <div className="pi-overlay">
              <div className="pi-title">Hospitality<br />&amp; <em>Hotels</em></div>
              <div className="pi-meta">Terraces · Properties · Beach clubs</div>
            </div>
          </Link>
          <Link className="pi-card" href="/food">
            <div className="pi-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/IMG_0124.JPG" alt="" />
            </div>
            <div className="pi-overlay">
              <div className="pi-title">Food &amp;<br /><em>Beverage</em></div>
              <div className="pi-meta">Restaurants · Plated · Aperitivo</div>
            </div>
          </Link>
          <Link className="pi-card" href="/lifestyle">
            <div className="pi-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photos/IMG_4402.JPG" alt="" />
            </div>
            <div className="pi-overlay">
              <div className="pi-title">Destinations<br />&amp; <em>Lifestyle</em></div>
              <div className="pi-meta">Cities · Interiors · Atmosphere</div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============ 06 ABOUT ============ */}
      <section className="block" id="about" data-screen-label="06 About">
        <div className="eyebrow"><span className="num">06</span>About</div>
        <div className="about-grid">
          <div className="about-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photos/IMG_9809.JPG" alt="Atrani cove" loading="lazy" />
          </div>
          <div>
            <h2 className="display">
              A photographer who thinks <em>like a marketing director.</em>
            </h2>
            <div className="body-copy">
              <p>
                I make pictures for places people want to go. The work runs through hospitality, travel, and lifestyle — visuals for hotel groups, boutique properties, restaurants, tourism partners, and consumer brands that sit adjacent to those worlds.
              </p>
              <p>
                I came to photography through a business background, and it shapes everything. Briefs are read carefully. Shoots are scoped against deliverables. Frames are built to do something — drive a booking, reinforce a brand&apos;s visual identity, hold up against the rest of a campaign. The work is editorial in feel and strategic underneath.
              </p>
              <p>
                I work with marketing teams as a collaborator, not a vendor — comfortable inside creative direction, comfortable on the ground, comfortable handing off polished assets ready to ship.
              </p>
            </div>
            <div className="about-list">
              <div>
                <span className="al-label">Specialties</span>
                <span className="al-value">Hospitality<br /><em>Travel · Lifestyle · Food &amp; Beverage</em></span>
              </div>
              <div>
                <span className="al-label">Recent Locations</span>
                <span className="al-value">Italy · Greece · France<br />Spain · Hungary · Iceland</span>
              </div>
              <div>
                <span className="al-label">Cameras</span>
                <span className="al-value">Canon G7X Mark III<br /><em>iPhone 15 Pro Max</em></span>
              </div>
              <div>
                <span className="al-label">Editing</span>
                <span className="al-value">Adobe Lightroom</span>
              </div>
              <div>
                <span className="al-label">Brand Partners</span>
                <span className="al-value">BUBBL&apos;R<br /><em>Antioxidant Sparkling Water</em></span>
              </div>
              <div>
                <span className="al-label">Available For</span>
                <span className="al-value">Property campaigns<br /><em>Editorial · Brand content</em></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 07 CONTACT ============ */}
      <section className="block" id="contact" data-screen-label="07 Contact">
        <div className="eyebrow"><span className="num">07</span>Get in touch</div>
        <h2 className="display" style={{ maxWidth: '20ch', marginBottom: '3rem' }}>
          Discussing a property, campaign, or partnership — <em>let&apos;s start a conversation.</em>
        </h2>
        <div className="contact-wrap">
          <div>
            <a href="mailto:dannilangseth@gmail.com" className="contact-email">
              dannilangseth@gmail.com
            </a>
            <div className="contact-extras">
              <a href="https://www.instagram.com/dannilangseth/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
                </svg>
                Instagram · @dannilangseth
              </a>
            </div>
          </div>
          <div>
            <p className="contact-note">
              Briefs, mood references, and project timelines welcome. Replies within 48 hours, weekdays.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
