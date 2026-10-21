/* Comparable listings per channel (R-108, R-111…R-113), ("Sample market data" in the UI).
 * Grounded in the scenario's market context (SCENARIO.md): 24 comps within 1.5 km, 2 guests / 1 bedroom, the host's own
 * units excluded (OQ-108), median cleaning fee €28, 71% name the neighbourhood in the title. S11 extends this file. */
import type { Comp } from './types'

export const COMPS: Comp[] = [
  { id: 'c-a1', channel: 'airbnb', title: 'Bright Flat by Tempelhofer Feld · Neukölln', similarity: 0.91, reasons: ['1 bedroom · 2 guests', 'workspace', 'same street grid', 'art on the walls (photos)'], occupancy: 0.82, adr: 71, rating: 4.9, distanceKm: 0.4 },
  { id: 'c-a2', channel: 'airbnb', title: 'Neukölln Loft with Desk & Fast Wi-Fi', similarity: 0.88, reasons: ['workspace', 'Wi-Fi speed stated', '4th floor, no lift'], occupancy: 0.79, adr: 68, rating: 4.8, distanceKm: 0.7 },
  { id: 'c-a3', channel: 'airbnb', title: 'Artsy 2-Room Apt near Hermannplatz', similarity: 0.86, reasons: ['2 rooms', 'U-Bahn < 1.5 km', 'self check-in'], occupancy: 0.74, adr: 62, rating: 4.7, distanceKm: 0.9 },
  { id: 'c-a4', channel: 'airbnb', title: 'Quiet Courtyard Flat · Reuterkiez', similarity: 0.83, reasons: ['courtyard bedroom', 'dishwasher', 'same size'], occupancy: 0.77, adr: 66, rating: 4.9, distanceKm: 1.1 },
  { id: 'c-a5', channel: 'airbnb', title: 'Sunny Neukölln Home for Remote Work', similarity: 0.8, reasons: ['workspace', 'monthly discount'], occupancy: 0.85, adr: 59, rating: 4.8, distanceKm: 1.3 },
  { id: 'c-b1', channel: 'booking', title: 'Apartment Neukölln · Free Wi-Fi', similarity: 0.87, reasons: ['1 bedroom', 'same facilities', 'Page Score 84'], occupancy: 0.76, adr: 74, rating: 8.9, distanceKm: 0.6 },
  { id: 'c-b2', channel: 'booking', title: 'Tempelhof Studio Apartments', similarity: 0.81, reasons: ['2 guests', 'kitchen', 'self check-in'], occupancy: 0.71, adr: 69, rating: 8.6, distanceKm: 1.2 },
  { id: 'c-b3', channel: 'booking', title: 'Neukölln Art Apartment', similarity: 0.79, reasons: ['similar photos', '48 m²'], occupancy: 0.73, adr: 72, rating: 8.8, distanceKm: 0.8 },
]

export const MARKET = {
  compsCount: 24,
  radiusKm: 1.5,
  medianCleaningFee: 28,
  shareNamingNeighbourhood: 0.71,
  note: 'Similar homes nearby · your own units excluded',
}
