/* Small shared pieces of the replica pages. */
import { Icon } from '../../ds'
import type { CvContent } from '../../data/property-listing'

/** A drawn street map around the home (no map tiles in the prototype): park, water, streets, the pin. The labels are the
 *  property's (data/property-listing.ts `map`): Neukölln's park and streets, or another property's street and station. */
export function CvMap({ small, map }: { small?: boolean; map: CvContent['map'] }) {
  return (
    <div className={`cv-map${small ? ' cv-map--sm' : ''}`} aria-label={`Map of ${map.area.toLowerCase().replace(/(^|[\s-])\S/g, (m) => m.toUpperCase())}`}>
      <i className="cv-map__park">{map.park && <span>{map.park}</span>}</i>
      <i className="cv-map__water" />
      <i className="cv-map__road cv-map__road--h1" /><i className="cv-map__road cv-map__road--h2" />
      <i className="cv-map__road cv-map__road--v1" /><i className="cv-map__road cv-map__road--v2" /><i className="cv-map__road cv-map__road--d" />
      {!small && <><span className="cv-map__label cv-map__label--a">{map.streets[0]}</span><span className="cv-map__label cv-map__label--b">{map.streets[1]}</span><span className="cv-map__label cv-map__label--c">{map.area}</span></>}
      <span className="cv-map__pin"><Icon name="home" size={small ? 16 : 24} /></span>
    </div>
  )
}
