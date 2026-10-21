/* Direct: the host's own booking site (Hospitable Direct), in the property's own branding. A clean direct-booking
 * layout: site header, hero gallery, title and facts, booking card, about, amenities, location, rules.
 * Content SIMULATED: the property's (c.content, data/property-listing.ts), Neukölln's scripted site or a plain one. */
import { Icon } from '../../ds'
import { PHOTO_CAPTION, STAY, photoUrl } from '../../data/v3-cv'
import { chAmenityLine, priceTotal } from '../../data/property-listing'
import { Area, useCv } from './model'
import { directRuleLine } from './facts'
import { CvMap } from './parts'

export function DirectPage({ narrow }: { narrow: boolean }) {
  const c = useCv()
  const ph = c.photos
  const name = c.text('name')
  const p = c.price
  const k = c.content
  const eo = c.editableOnly // "Show only editable sections": the page's own chrome goes too, the columns stay
  return (
    <div className={`cv-dr${narrow ? ' is-narrow' : ''}`}>
      <header className="cv-dr__head">
        <span className="cv-dr__brand"><span className="cv-dr__mono">{k.brand.charAt(0)}</span>{k.brand}</span>
        {!narrow && <nav><span className="is-on">{k.navFirst}</span><span>Gallery</span><span>Location</span><span>Contact</span></nav>}
        <span className="cv-dr__cta">Book now</span>
      </header>
      <main className="cv-dr__main">
        <Area id="photos" className="cv-dr__hero">
          <img className="is-big" src={photoUrl(ph[0])} alt={PHOTO_CAPTION[ph[0]]} />
          {ph.slice(1, 3).map((k) => <img key={k} src={photoUrl(k)} alt={PHOTO_CAPTION[k]} />)}
          <span className="cv-dr__all"><Icon name="photo" size={16} />All {ph.length} photos</span>
        </Area>
        <div className="cv-dr__cols">
          <div className="cv-dr__left">
            {!eo && <p className="cv-dr__eyebrow"><Icon name="map-pin" size={16} />{k.place}</p>}
            <Area id="title"><h1 className="cv-dr__title">{name}</h1></Area>
            <Area id="type"><p className="cv-dr__facts">{k.directFacts.map(([icon, t]) => <span key={icon}><Icon name={icon} size={18} />{t}</span>)}</p></Area>
            <section className="cv-dr__section">
              <h2 className="cv-dr__h2">{k.aboutTitle}</h2>
              <Area id="description"><p className="cv-dr__p">{c.text('summary')}</p></Area>
              <Area id="access"><h4 className="cv-dr__h4">Guest access</h4><p className="cv-dr__p">{c.text('access')}</p></Area>
            </section>
            {!eo && <section className="cv-dr__section">
              <h2 className="cv-dr__h2">Amenities</h2>
              <Area id="amenities" className="cv-dr__amen">
                {k.amenities.filter(([, , off]) => !off).map(([icon, n]) => <span key={n}><Icon name={icon} size={18} />{n}</span>)}
                {/* extras the host chose for their own site only (data/property-listing.ts) */}
                {c.extras.map((a) => <span key={a.name}><Icon name={a.icon ?? 'circle-check'} size={18} />{chAmenityLine('direct', a)}</span>)}
              </Area>
            </section>}
            <section className="cv-dr__section">
              <h2 className="cv-dr__h2">Location</h2>
              <Area id="map"><CvMap map={k.map} /></Area>
              <Area id="neighbourhood"><p className="cv-dr__p">{c.text('neighbourhood')}</p></Area>
            </section>
            <section className="cv-dr__section cv-dr__two">
              <Area id="rules"><h2 className="cv-dr__h2">House rules</h2><p className="cv-dr__p">{directRuleLine(c.text)}</p><p className="cv-dr__p">{c.text('house_rules')}</p></Area>
              {eo && <div />}
              <Area id="cancellation"><h2 className="cv-dr__h2">Cancellation</h2><p className="cv-dr__p">{c.cancel.line}</p></Area>
            </section>
          </div>
          <aside className="cv-dr__aside">
            <div className="cv-dr__book">
              <Area id="price"><p className="cv-dr__price"><b>€{p.night}</b> / night <span className="cv-dr__save">Best price · booking direct</span></p></Area>
              {!eo && <div className="cv-dr__dates"><span><small>Arrive</small>{STAY.fromShort}</span><span><small>Leave</small>{STAY.toShort}</span><span className="cv-dr__guests"><small>Guests</small>{k.stayGuests} guest{k.stayGuests === 1 ? '' : 's'}</span></div>}
              {!eo && <div className="cv-dr__line"><span>€{p.night} × {STAY.nights} nights</span><span>€{p.night * STAY.nights}</span></div>}
              <Area id="cleaning" className="cv-dr__line"><span>Cleaning</span><span>€{p.cleaning}</span></Area>
              {!eo && <>
                <div className="cv-dr__line cv-dr__total"><b>Total</b><b>€{priceTotal(p)}</b></div>
                <span className="cv-dr__cta cv-dr__cta--block">Request to book</span>
                <p className="cv-dr__small"><Icon name="shield-check" size={16} />Secure payment · no booking fees</p>
              </>}
            </div>
          </aside>
        </div>
      </main>
      <footer className="cv-dr__foot"><span>{k.brand} · {k.city}</span><span>Powered by Hospitable</span></footer>
    </div>
  )
}
