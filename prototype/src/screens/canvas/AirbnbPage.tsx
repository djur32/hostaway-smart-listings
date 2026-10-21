/* Airbnb's guest listing page, replicated section by section (memory: channel-previews-replicate-real-pages):
 * header with the search pill · title row with Share / Save · 5-photo mosaic · summary line · Guest favourite ·
 * host strip · three highlights · description with Show more · Where you'll sleep · What this place offers ·
 * two-month calendar · sticky booking card · reviews · Where you'll be · Meet your host · Things to know.
 * Content ; layout (airbnb.com listing pages, Sep 2026). The content is the property's
 * (c.content, data/property-listing.ts): Neukölln's scripted page, or a plain one from another property's data. */
import { useState } from 'react'
import { Icon, TipDot } from '../../ds'
import { PHOTO_CAPTION, STAY, photoUrl } from '../../data/v3-cv'
import { chAmenityLine, priceTotal, type AddedChAmenity } from '../../data/property-listing'
import { Area, useCv } from './model'
import { airbnbRuleLines } from './facts'
import { CvMap } from './parts'

const Stars = ({ n = 5 }: { n?: number }) => <span className="cv-stars" aria-label={`${n} stars`}>{'★'.repeat(n)}</span>

export function AirbnbPage({ narrow }: { narrow: boolean }) {
  const c = useCv()
  const [more, setMore] = useState(false)
  const eo = c.editableOnly // "Show only editable sections": the page's own chrome goes too, the columns stay
  const sectionOpen = eo || more || ['space', 'interaction', 'other'].includes(c.selected ?? '') || ['space', 'interaction', 'other'].includes(c.focusTip?.field ?? '')
  const hidden = sectionOpen ? [] : ['space', 'interaction', 'other'].flatMap((k) => c.tipsByField[k] ?? [])
  const ph = c.photos
  const title = c.text('name')
  const p = c.price
  const k = c.content
  const total = priceTotal(p)
  const { rating, reviewCount: count } = k
  const slot = (key: string, heading: string | null, empty: string) => {
    const v = c.text(key)
    if (!v && c.selected !== key && c.focusTip?.field !== key && !c.tipsByField[key]?.length) return null
    return (
      <Area id={key}>
        {heading && <h4 className="cv-ab__sub">{heading}</h4>}
        {v ? <p className="cv-ab__p">{v}</p> : <p className="cv-empty">{empty}</p>}
      </Area>
    )
  }
  return (
    <div className={`cv-ab${narrow ? ' is-narrow' : ''}`}>
      <header className="cv-ab__top">
        <span className="cv-ab__logo"><svg className="cv-ab__belo" width="24" height="24" aria-hidden="true"><use href="#ch-airbnb" /></svg>airbnb</span>
        {!narrow && (
          <span className="cv-ab__search"><b>Anywhere</b><i /><b>Anytime</b><i /><span>Add guests</span><span className="cv-ab__go"><Icon name="search" size={16} /></span></span>
        )}
        <span className="cv-ab__right">{!narrow && <b>Switch to hosting</b>}<Icon name="world" size={18} /><span className="cv-ab__menu"><Icon name="list-details" size={16} /><span className="cv-ab__av">A</span></span></span>
      </header>

      <main className="cv-ab__main">
        <div className="cv-ab__titlerow">
          <Area id="title" inline className="cv-ab__titlearea"><h1 className="cv-ab__title">{title}</h1></Area>
          {!eo && <span className="cv-ab__actions"><u><Icon name="arrow-bar-to-right" size={16} />Share</u><u><Icon name="heart" size={16} />Save</u></span>}
        </div>

        <Area id="photos" className="cv-ab__gallery">
          {ph.slice(0, 5).map((k, i) => <img key={k + i} className={i === 0 ? 'is-big' : ''} src={photoUrl(k)} alt={PHOTO_CAPTION[k]} />)}
          <span className="cv-ab__showall"><Icon name="photo" size={16} />Show all photos</span>
        </Area>

        <div className="cv-ab__cols">
          <div className="cv-ab__left">
            <Area id="type">
              <h2 className="cv-ab__h2">{k.typeLine}</h2>
              <p className="cv-ab__facts">{k.facts}</p>
            </Area>

            <Area id="rating" className="cv-ab__fav">
              {k.favourite ? <>
                <span className="cv-ab__laurel"><Icon name="sparkles" size={18} /><b>Guest<br />favourite</b><Icon name="sparkles" size={18} /></span>
                <span className="cv-ab__favtext">One of the most loved homes on Airbnb, according to guests</span>
              </> : <span className="cv-ab__favtext">Rated {rating} out of 5 by guests</span>}
              <span className="cv-ab__favnum"><b>{rating}</b><Stars /></span>
              <span className="cv-ab__favnum"><b>{count}</b><u>Reviews</u></span>
            </Area>

            <Area id="host" className="cv-ab__host">
              <span className="cv-ab__av cv-ab__av--lg">A</span>
              <span><b>Hosted by Antonio</b><small>Superhost · 2 years hosting</small></span>
            </Area>

            <Area id="highlights" className="cv-ab__hl">
              {k.highlights.map(([icon, t, l]) => (
                <div key={t} className="cv-ab__hlrow"><Icon name={icon} size={24} /><span><b>{t}</b><small>{l}</small></span></div>
              ))}
            </Area>

            <section className="cv-ab__desc">
              {slot('summary', null, 'Listing description · empty on Airbnb, guests don\'t see it yet')}
              <Area id="access"><h4 className="cv-ab__sub">Guest access</h4><p className="cv-ab__p">{c.text('access')}</p></Area>
              {sectionOpen && (<>
                {slot('space', 'The space', 'Empty on Airbnb · guests don\'t see this section yet')}
                {slot('interaction', 'During your stay', 'Empty on Airbnb · guests don\'t see this section yet')}
                {slot('other', 'Other things to note', 'Empty on Airbnb · guests don\'t see this section yet')}
              </>)}
              {!eo && <span className="cv-ab__morerow">
                <button type="button" className="cv-ab__more" onClick={() => setMore(!more)}>{sectionOpen ? 'Show less' : 'Show more'}<Icon name={sectionOpen ? 'chevron-up' : 'chevron-right'} size={16} /></button>
                {hidden.length > 0 && !c.live && <span style={{ zoom: 1 / c.zoom }}><TipDot count={hidden.length} onClick={() => { setMore(true); c.openTip(hidden[0].id) }} /></span>}
              </span>}
            </section>

            {!eo && <section className="cv-ab__section">
              <h2 className="cv-ab__h2">Where you'll sleep</h2>
              <Area id="sleep" className="cv-ab__sleep">
                <img src={photoUrl(k.sleep.photo)} alt={k.sleep.title} />
                <b>{k.sleep.title}</b><small>{k.sleep.sub}</small>
              </Area>
            </section>}

            {!eo && <section className="cv-ab__section">
              <h2 className="cv-ab__h2">What this place offers</h2>
              <Area id="amenities" className="cv-ab__amen">
                {withExtras(k.amenities, c.extras).map(([icon, n, off]) => <span key={n} className={off ? 'is-off' : ''}><Icon name={icon} size={24} />{n}</span>)}
              </Area>
              <span className="cv-ab__btn">Show all {k.amenityTotal + c.extras.length} amenities</span>
            </section>}

            {!eo && <section className="cv-ab__section">
              <Area id="calendar">
                <h2 className="cv-ab__h2">{STAY.nights} nights in {k.area}</h2>
                <p className="cv-ab__facts cv-ab__facts--sm">{STAY.from} – {STAY.to}</p>
                <div className="cv-ab__cal">
                  <Month name="October 2026" start={3} days={31} blocked={[2, 3, 4, 9, 10, 23, 24, 25]} sel={[12, 15]} />
                  {!narrow && <Month name="November 2026" start={6} days={30} blocked={[6, 7, 8]} />}
                </div>
              </Area>
            </section>}
          </div>

          <aside className="cv-ab__aside">
            <Area id="rarefind" className="cv-ab__rare"><Icon name="sparkles" size={18} /><span><b>Rare find!</b> This place is usually booked</span></Area>
            <div className="cv-ab__book">
              <Area id="price" className="cv-ab__price"><b><u>€{total}</u></b> for {STAY.nights} nights</Area>
              {!eo && <><div className="cv-ab__dates">
                <span><small>CHECK-IN</small>12/10/2026</span><span><small>CHECKOUT</small>15/10/2026</span>
                <span className="cv-ab__guests"><small>GUESTS</small>{k.stayGuests} guest{k.stayGuests === 1 ? '' : 's'}<Icon name="chevron-down" size={16} /></span>
              </div>
              <span className="cv-ab__reserve">Reserve</span>
              <p className="cv-ab__nocharge">You won't be charged yet</p></>}
              <Area id="nightly" className="cv-ab__line"><u>€{p.night} x {STAY.nights} nights</u><span>€{p.night * STAY.nights}</span></Area>
              <Area id="cleaning" className="cv-ab__line"><u>Cleaning fee</u><span>€{p.cleaning}</span></Area>
              <Area id="service" className="cv-ab__line"><u>Airbnb service fee</u><span>€{p.service}</span></Area>
              {!eo && <div className="cv-ab__line cv-ab__total"><b>Total before taxes</b><b>€{total}</b></div>}
            </div>
            {!eo && <p className="cv-ab__report"><Icon name="alert-circle" size={16} /><u>Report this listing</u></p>}
          </aside>
        </div>

        {!eo && <section className="cv-ab__section cv-ab__wide">
          <Area id="reviews">
            <h2 className="cv-ab__h2 cv-ab__rv"><Icon name="sparkles" size={24} />{rating} · {count} reviews</h2>
            <div className="cv-ab__scores">{k.scores.map(([n, v, icon]) => <span key={n}><b>{n}</b><strong>{v}</strong><Icon name={icon} size={24} /></span>)}</div>
            <div className="cv-ab__reviews">{k.reviews.map((r) => (
              <article key={r.name}>
                <span className="cv-ab__who"><span className="cv-ab__av cv-ab__av--lg cv-ab__av--soft">{r.name[0]}</span><span><b>{r.name}</b><small>{r.from}</small></span></span>
                <small className="cv-ab__when"><Stars /> · {r.when}</small>
                <p>{r.text}</p>
              </article>))}
            </div>
            <span className="cv-ab__btn">Show all {count} reviews</span>
          </Area>
        </section>}

        <section className="cv-ab__section cv-ab__wide">
          <h2 className="cv-ab__h2">Where you'll be</h2>
          <Area id="map"><CvMap map={k.map} /></Area>
          <Area id="neighbourhood" className="cv-ab__hood">
            <b>{k.place}, Germany</b>
            <p className="cv-ab__p">{c.text('neighbourhood')}</p>
          </Area>
          <Area id="getting_around"><h4 className="cv-ab__sub">Getting around</h4><p className="cv-ab__p">{c.text('getting_around')}</p></Area>
        </section>

        {!eo && <section className="cv-ab__section cv-ab__wide">
          <h2 className="cv-ab__h2">Meet your host</h2>
          <Area id="meet" className="cv-ab__meet">
            <div className="cv-ab__hostcard">
              <span className="cv-ab__hostid"><span className="cv-ab__av cv-ab__av--xl">A<i><Icon name="shield-check" size={16} /></i></span><b>Antonio</b><small><Icon name="sparkles" size={16} />Superhost</small></span>
              <span className="cv-ab__hoststats"><span><b>{count}</b><small>Reviews</small></span><span><b>{rating}★</b><small>Rating</small></span><span><b>2</b><small>Years hosting</small></span></span>
            </div>
            <div className="cv-ab__hostinfo">
              <b>review is a Superhost</b>
              <p>Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
              <b>Host details</b>
              <p>Response rate: 100%<br />Responds within an hour</p>
              <span className="cv-ab__btn cv-ab__btn--dark">Message host</span>
            </div>
          </Area>
        </section>}

        <section className="cv-ab__section cv-ab__wide">
          <h2 className="cv-ab__h2">Things to know</h2>
          <div className="cv-ab__know">
            <Area id="rules">
              <Icon name="clock" size={24} /><b>House rules</b>
              <p>{airbnbRuleLines(c.text, c.maxGuests).map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</p>
              <p className="cv-ab__rulestext">{c.text('house_rules')}</p>
              {!eo && <u>Show more</u>}
            </Area>
            <Area id="safety">
              <Icon name="shield-check" size={24} /><b>Safety & property</b>
              <p>{k.safety.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</p>
              <u>Show more</u>
            </Area>
            <Area id="cancellation">
              <Icon name="calendar-event" size={24} /><b>Cancellation policy</b>
              <p>{c.cancel.line}</p>
              <u>Show more</u>
            </Area>
          </div>
        </section>
      </main>
      <footer className="cv-ab__foot"><span>© 2026 Airbnb, Inc.</span><span>Privacy · Terms · Sitemap</span><span><Icon name="world" size={16} />English (GB) · € EUR</span></footer>
    </div>
  )
}

function Month({ name, start, days, blocked = [], sel }: { name: string; start: number; days: number; blocked?: number[]; sel?: [number, number] }) {
  const cells: Array<number | null> = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  return (
    <div className="cv-ab__month">
      <b>{name}</b>
      <div className="cv-ab__grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <small key={i}>{d}</small>)}
        {cells.map((d, i) => {
          const isSel = !!d && !!sel && (d === sel[0] || d === sel[1])
          const inRange = !!d && !!sel && d > sel[0] && d < sel[1]
          return <span key={i} className={`${d && blocked.includes(d) ? 'is-blocked' : ''}${isSel ? ' is-sel' : ''}${inRange ? ' is-range' : ''}`}>{d ?? ''}</span>
        })}
      </div>
    </div>
  )
}

/** "What this place offers" with this channel's own added amenities (Airbnb-only, data/property-listing.ts) in it.
 *  Airbnb's page previews a fixed handful and puts the rest behind "Show all N amenities", so an added one joins the
 *  preview just before the safety lines and the preview keeps its size: the last inherited item moves behind
 *  "Show all" (whose count goes up). A sub-option reads the way Airbnb prints it, after an en dash. */
type AmenityLine = [icon: string, name: string, off?: boolean]
function withExtras(base: AmenityLine[], extras: AddedChAmenity[]): AmenityLine[] {
  if (!extras.length) return base
  const added: AmenityLine[] = extras.map((a) => [a.icon ?? 'circle-check', chAmenityLine('airbnb', a)])
  const at = base.findIndex(([, n]) => /alarm/i.test(n))
  const out = [...base.slice(0, at < 0 ? base.length : at), ...added, ...base.slice(at < 0 ? base.length : at)]
  const isAdded = new Set(added.map(([, n]) => n))
  while (out.length > Math.max(base.length, added.length)) {
    let i = out.length - 1
    while (i >= 0 && (isAdded.has(out[i][1]) || /alarm/i.test(out[i][1]))) i--
    if (i < 0) break
    out.splice(i, 1)
  }
  return out
}
