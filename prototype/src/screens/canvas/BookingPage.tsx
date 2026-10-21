/* Booking.com's property page, replicated section by section (memory: channel-previews-replicate-real-pages):
 * navy header with nav pills · yellow-bordered search bar · breadcrumbs · tab row · title with address, show map and
 * Reserve · photo grid with thumbnails and "+N photos" · review-score box and map beside it · description ·
 * Property highlights · Most popular facilities · Availability table with "I'll reserve" · guest reviews with category
 * bars · House rules table · The fine print. Content SIMULATED; layout REAL·PUBLIC (booking.com, Sep 2026). The content
 * is the property's (c.content, data/property-listing.ts): Neukölln's scripted page, or a plain one from its data. */
import { Icon } from '../../ds'
import { PHOTO_CAPTION, STAY, photoUrl } from '../../data/v3-cv'
import { chAmenityLine, priceTotal } from '../../data/property-listing'
import { Area, useCv } from './model'
import { bookingRuleRows } from './facts'
import { CvMap } from './parts'

export function BookingPage({ narrow }: { narrow: boolean }) {
  const c = useCv()
  const ph = c.photos
  const name = c.text('name')
  const k = c.content
  const word = k.bkScore >= 9 ? 'Superb' : k.bkScore >= 8.5 ? 'Excellent' : k.bkScore >= 8 ? 'Very good' : 'Good'
  const [gen1, gen2, gen3] = k.bkGenerated(name)
  const eo = c.editableOnly // "Show only editable sections": the page's own chrome goes too, the columns stay
  return (
    <div className={`cv-bk${narrow ? ' is-narrow' : ''}`}>
      <header className="cv-bk__head">
        <div className="cv-bk__bar">
          <span className="cv-bk__logo">Booking.com</span>
          <span className="cv-bk__right">{!narrow && <><b>EUR</b><span className="cv-bk__flag" aria-label="English" /><Icon name="help-circle" size={18} /><b>List your property</b></>}<span className="cv-bk__btn">Register</span><span className="cv-bk__btn">Sign in</span></span>
        </div>
        <nav className="cv-bk__nav">
          <span className="is-on"><Icon name="bed" size={18} />Stays</span>
          {!narrow && <><span><Icon name="send" size={18} />Flights</span><span><Icon name="world" size={18} />Flight + Hotel</span><span><Icon name="rocket" size={18} />Car rental</span><span><Icon name="sparkles" size={18} />Attractions</span><span><Icon name="map-pin" size={18} />Airport taxis</span></>}
        </nav>
      </header>
      <div className="cv-bk__search">
        <span><Icon name="bed" size={18} />{k.place}</span>
        <span><Icon name="calendar" size={18} />{STAY.fromShort} – {STAY.toShort}</span>
        {!narrow && <span><Icon name="user" size={18} />{k.stayGuests === 1 ? '1 adult' : `${k.stayGuests} adults`} · 0 children · 1 room<Icon name="chevron-down" size={16} /></span>}
        <b>Search</b>
      </div>

      <main className="cv-bk__main">
        {!eo && <><p className="cv-bk__crumbs">Home › {k.bkType === 'Apartment' ? 'Apartments' : 'Holiday Homes'} › Germany › {k.place.split(', ').reverse().join(' › ')} › {name} ({k.bkType}) › Reviews</p>
        <nav className="cv-bk__tabs"><span className="is-on">Overview</span><span>Info &amp; prices</span><span>Facilities</span><span>House rules</span>{!narrow && <><span>Important info</span><span>Guest reviews ({k.reviewCount})</span></>}</nav></>}

        <div className="cv-bk__titlerow">
          <div className="cv-bk__titlecol">
            {!eo && <span className="cv-bk__type">{k.bkType} <span className="cv-bk__thumb"><Icon name="thumb-up" size={16} /></span></span>}
            <Area id="title" className="cv-bk__titlearea"><h1 className="cv-bk__title">{name}</h1></Area>
            <Area id="address" inline className="cv-bk__addr"><Icon name="map-pin" size={16} />{k.bkAddress(c.text)} – <a>Excellent location – show map</a></Area>
          </div>
          {!eo && <span className="cv-bk__acts"><Icon name="heart" size={24} /><Icon name="arrow-bar-to-right" size={24} /><span className="cv-bk__reserve">Reserve</span></span>}
        </div>

        <div className="cv-bk__top">
          <Area id="photos" className="cv-bk__photos">
            <div className="cv-bk__mosaic">
              <img className="is-big" src={photoUrl(ph[0])} alt={PHOTO_CAPTION[ph[0]]} />
              <img src={photoUrl(ph[1])} alt={PHOTO_CAPTION[ph[1]]} />
              <img src={photoUrl(ph[2])} alt={PHOTO_CAPTION[ph[2]]} />
            </div>
            <div className="cv-bk__thumbs">
              {ph.slice(3, 8).map((k, i) => (
                <span key={k} className="cv-bk__th"><img src={photoUrl(k)} alt={PHOTO_CAPTION[k]} />{i === 4 && ph.length > 8 && <b>+{ph.length - 8} photos</b>}</span>
              ))}
            </div>
          </Area>
          <div className="cv-bk__side">
            <Area id="score" className="cv-bk__scorebox">
              <div className="cv-bk__scorehead"><span><b>{word}</b><small>{k.reviewCount} reviews</small></span><span className="cv-bk__score">{k.bkScore.toFixed(1)}</span></div>
              <div className="cv-bk__loved"><b>Guests who stayed here loved</b><q>{k.bkLoved.quote}</q><small><span className="cv-bk__av">{k.bkLoved.initial}</span>{k.bkLoved.who}</small></div>
              <div className="cv-bk__loc"><b>Location</b><span className="cv-bk__score cv-bk__score--line">{k.bkLocation.toFixed(1)}</span></div>
            </Area>
            <Area id="map" className="cv-bk__map"><CvMap small map={k.map} /><span className="cv-bk__mapbtn">Show on map</span></Area>
          </div>
        </div>

        <div className="cv-bk__body">
          <div className="cv-bk__bodymain">
            <Area id="description" className="cv-bk__desc">
              <p>{c.text('summary')}</p>
            </Area>
            <Area id="generated" className="cv-bk__desc cv-bk__gen">
              <p>{gen1}</p>
              <p>{gen2}</p>
              <p><b>{gen3}</b></p>
            </Area>
            {!eo && <h3 className="cv-bk__h3">Most popular facilities</h3>}
            <Area id="facilities" className="cv-bk__facs">
              {k.bkFacilities.map(([icon, n]) => <span key={n}><Icon name={icon} size={18} />{n}</span>)}
              {/* Booking.com-only facilities the host added (data/property-listing.ts), worded Booking's way: detail in brackets */}
              {c.extras.map((a) => <span key={a.name}><Icon name={a.icon ?? 'circle-check'} size={18} />{chAmenityLine('booking', a)}</span>)}
            </Area>
          </div>
          <Area id="highlights" className="cv-bk__hl">
            <h3>Property highlights</h3>
            <b>Perfect for a {STAY.nights}-night stay!</b>
            {k.bkHighlights.map(([icon, t]) => <p key={t}><Icon name={icon} size={18} />{t}</p>)}
            <span className="cv-bk__reserve cv-bk__reserve--block">Reserve</span>
          </Area>
        </div>

        <section className="cv-bk__section">
          <h2 className="cv-bk__h2">Availability</h2>
          {!eo && <p className="cv-bk__note"><Icon name="info-circle" size={16} />Prices converted to EUR</p>}
          <div className="cv-bk__table">
            <div className="cv-bk__tr cv-bk__th-row"><span>Accommodation type</span><span>Number of guests</span><span>Price for {STAY.nights} nights</span><span>Your choices</span><span>Select</span><span /></div>
            <div className="cv-bk__tr">
              <Area id="unit"><a className="cv-bk__unit">{k.bkUnit.name}</a><small>{k.bkUnit.beds} <Icon name="bed" size={16} /></small><small>{k.bkUnit.line}</small></Area>
              {eo ? <span /> : <span className="cv-bk__people">{Array.from({ length: k.stayGuests }, (_, i) => <Icon key={i} name="user" size={16} />)}</span>}
              <Area id="price"><b className="cv-bk__amount">€ {priceTotal(c.price)}</b><small>Includes taxes and charges</small></Area>
              {eo && <span />}
              <Area id="policy"><span className="cv-bk__ok"><Icon name="check" size={16} /><b>Free cancellation</b> {c.cancel.line.replace(/^Free cancellation /, '')}</span><span className="cv-bk__ok"><Icon name="check" size={16} /><b>No prepayment needed</b> – pay at the property</span></Area>
              {eo ? <><span /><span /></> : <>
                <span><span className="cv-bk__select">0<Icon name="chevron-down" size={16} /></span></span>
                <span><span className="cv-bk__reserve">I'll reserve</span><small className="cv-bk__free">• It only takes 2 minutes</small></span>
              </>}
            </div>
          </div>
        </section>

        {!eo && <section className="cv-bk__section">
          <Area id="reviews">
            <h2 className="cv-bk__h2">Guest reviews</h2>
            <p className="cv-bk__rvhead"><span className="cv-bk__score">{k.bkScore.toFixed(1)}</span><b>{word}</b> · {k.reviewCount} reviews <a>Read all reviews</a></p>
            <h4 className="cv-bk__h4">Categories:</h4>
            <div className="cv-bk__bars">{k.bkScores.map(([n, v]) => (
              <span key={n}><span className="cv-bk__barlabel">{n}<b>{v.toFixed(1)}</b></span><i><em style={{ width: `${v * 10}%` }} /></i></span>
            ))}</div>
          </Area>
        </section>}

        {!eo && <section className="cv-bk__section">
          <h2 className="cv-bk__h2">House rules</h2>
          <p className="cv-bk__note">{name} takes special requests – add in the next step!</p>
          <Area id="rules" className="cv-bk__rules">
            {bookingRuleRows(k.bkRules, c.text, 'Cancellation and prepayment policies vary according to accommodation type.').map(([icon, l, t]) => <div key={l} className="cv-bk__rule"><b><Icon name={icon} size={18} />{l}</b><span>{t}</span></div>)}
          </Area>
        </section>}

        <section className="cv-bk__section">
          <h2 className="cv-bk__h2">The fine print</h2>
          {!eo && <p className="cv-bk__note">Need-to-know information for guests at this property</p>}
          <Area id="fineprint" className="cv-bk__fine">
            <p>{c.text('house_rules')}</p>
            <p>Please inform {name} of your expected arrival time in advance. Guests are required to show a photo identification upon check-in.</p>
          </Area>
        </section>
      </main>
    </div>
  )
}
