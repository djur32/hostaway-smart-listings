/* ============================================================================
   GLYPHS · small drawings of the things a stage leaves behind.

   The artefact cards on slide 29 (`research-artefacts`) drew each artefact as a
   tiny flat picture: a plan as a staircase of steps, an interview guide as a
   page of prompts, a survey report as bars. This is that vocabulary, lifted into
   the kit so every stage can use it without copying SVG by hand.

     <i class="glyph" data-glyph="plan"></i>

   The engine fills any empty [data-glyph] with its drawing (boot, overlays,
   print). Every drawing is 120 × 64 and uses four classes only, so it takes the
   theme's colours:
     g-l  a line (ink-3)            g-f  a quiet fill (ink-4)
     g-a  the one accent fill        g-o  an accent outline
     g-s  a surface fill with a line (a card on a card)
   One accent mark per drawing: it is where the eye should land.
   ========================================================================= */

const r = (x, y, w, h, c = 'g-f', rx = 2) => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const c = (cx, cy, rr, k = 'g-f') => `<circle class="${k}" cx="${cx}" cy="${cy}" r="${rr}"/>`;
const p = (d, k = 'g-l') => `<path class="${k}" d="${d}"/>`;
const grid = (cols, rows, x0, y0, s, gap, pick) => {
  let o = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) o += r(x0 + i * (s + gap), y0 + j * (s + gap), s, s, pick(i, j), 2);
  return o;
};

export const GLYPHS = {
  /* research and discovery */
  plan: r(6, 5, 38, 7, 'g-f', 3.5) + r(24, 17, 38, 7, 'g-f', 3.5) + r(42, 29, 38, 7, 'g-a', 3.5) + r(60, 41, 38, 7, 'g-f', 3.5) + r(78, 53, 38, 7, 'g-f', 3.5),
  guide: r(28, 3, 64, 58, 'g-l', 5) + c(40, 16, 3, 'g-a') + r(48, 14, 34, 4) + c(40, 30, 3) + r(48, 28, 26, 4) + c(40, 44, 3) + r(48, 42, 30, 4),
  grid: grid(8, 4, 12, 8, 9, 3, (i, j) => ((i * 7 + j * 3) % 5 === 0 ? 'g-a' : (i + j * 2) % 3 === 0 ? 'g-l' : 'g-f')),
  people: c(30, 20, 9) + r(16, 36, 28, 18, 'g-f', 9) + c(60, 20, 9, 'g-a') + r(46, 36, 28, 18, 'g-a', 9) + c(90, 20, 9) + r(76, 36, 28, 18, 'g-f', 9),
  bars: p('M10 4V60') + r(10, 10, 86, 9, 'g-a') + r(10, 28, 58, 9) + r(10, 46, 34, 9),
  blueprint: p('M4 18H116M4 34H116M4 50H116') + r(10, 12, 22, 12, 'g-f', 3) + r(49, 12, 22, 12, 'g-f', 3) + r(88, 12, 22, 12, 'g-f', 3)
    + r(29, 28, 22, 12, 'g-f', 3) + r(68, 28, 22, 12, 'g-a', 3) + r(49, 44, 22, 12, 'g-f', 3) + p('M60 24V28M79 40V44'),
  layers: r(14, 5, 92, 10, 'g-a', 3) + r(18, 19, 84, 10, 'g-f', 3) + r(22, 33, 76, 10, 'g-f', 3) + r(26, 47, 68, 10, 'g-f', 3),
  jobs: grid(10, 3, 6, 15, 8, 3, (i, j) => (i >= 7 + (j === 2 ? 1 : 0) ? 'g-a' : 'g-f')),
  reports: r(22, 14, 62, 46, 'g-l', 4) + r(30, 8, 62, 46, 'g-l', 4) + r(38, 2, 62, 46, 'g-s', 4) + r(46, 12, 30, 4, 'g-a') + r(46, 22, 44, 4) + r(46, 32, 38, 4),
  channels: p('M16 10C60 10 60 18 104 18') + p('M16 24C60 24 60 18 104 18') + p('M16 38C60 38 60 18 104 18') + p('M16 52C60 52 60 18 104 18')
    + p('M16 38C60 38 60 48 104 48', 'g-o') + c(14, 10, 3.5) + c(14, 24, 3.5) + c(14, 38, 3.5) + c(14, 52, 3.5) + c(106, 18, 5) + c(106, 48, 5, 'g-a'),
  audit: c(24, 10, 4) + r(36, 8, 60, 4) + c(24, 24, 4) + r(36, 22, 48, 4) + c(24, 38, 4, 'g-o') + r(36, 36, 56, 4) + c(24, 52, 4, 'g-o') + r(36, 50, 44, 4),
  flow: r(6, 4, 26, 10, 'g-f', 3) + r(6, 19, 26, 10, 'g-f', 3) + r(6, 34, 26, 10, 'g-f', 3) + r(6, 49, 26, 10, 'g-f', 3)
    + p('M34 9C52 9 52 32 70 32M34 24C52 24 52 32 70 32M34 39C52 39 52 32 70 32M34 54C52 54 52 32 70 32') + r(72, 18, 42, 28, 'g-a', 6),
  quote: r(20, 6, 80, 38, 'g-l', 8) + p('M36 44L32 58L50 44', 'g-l') + r(32, 16, 44, 5, 'g-a', 2.5) + r(32, 27, 56, 5, 'g-f', 2.5),
  funnel: r(8, 6, 104, 9, 'g-f', 3) + r(22, 20, 76, 9, 'g-f', 3) + r(36, 34, 48, 9, 'g-a', 3) + r(48, 48, 24, 9, 'g-f', 3),
  matrix: p('M8 21H112M8 42H112', 'g-l') + c(24, 11, 5) + c(48, 11, 2.5) + c(96, 11, 6, 'g-a') + c(36, 32, 4) + c(72, 32, 7) + c(24, 53, 3) + c(60, 53, 5) + c(96, 53, 3.5),

  /* concept */
  phone: r(40, 2, 40, 60, 'g-l', 7) + r(46, 10, 28, 14, 'g-a', 3) + r(46, 28, 28, 4) + r(46, 36, 20, 4) + r(46, 44, 24, 4),
  tree: c(16, 32, 5, 'g-f') + p('M21 32C40 32 40 14 58 14M21 32C40 32 40 50 58 50') + r(60, 8, 12, 12, 'g-a', 2) + r(60, 44, 12, 12, 'g-f', 2)
    + p('M72 14H100M72 50H100') + c(104, 14, 4) + c(104, 50, 4),
  journey: p('M8 50C28 50 30 18 50 18S72 44 90 36S108 14 114 14') + c(8, 50, 4) + c(50, 18, 4) + c(72, 40, 4, 'g-a') + c(90, 36, 4) + c(114, 14, 4),
  states: grid(8, 4, 12, 7, 10, 3, (i, j) => (j === 3 && i > 4 ? 'g-a' : j >= 2 && i > 5 ? 'g-l' : 'g-f')),
  prd: r(28, 3, 64, 58, 'g-l', 5) + r(36, 11, 48, 10, 'g-a', 2) + r(36, 27, 48, 4) + r(36, 35, 40, 4) + r(36, 43, 44, 4) + r(36, 51, 30, 4),

  /* design */
  tokens: c(18, 20, 9, 'g-a') + c(42, 20, 9) + c(66, 20, 9, 'g-l') + c(90, 20, 9) + r(8, 42, 104, 6, 'g-f', 3) + r(8, 42, 38, 6, 'g-a', 3),
  components: r(8, 6, 32, 22, 'g-f', 4) + r(46, 6, 66, 22, 'g-l', 4) + r(8, 36, 50, 22, 'g-l', 11) + r(64, 36, 22, 22, 'g-a', 4) + r(92, 36, 20, 22, 'g-f', 10),
  spec: r(10, 4, 70, 56, 'g-l', 4) + r(18, 12, 54, 18, 'g-f', 2) + r(18, 36, 40, 4) + r(18, 44, 48, 4) + p('M72 21H96M58 38H96') + c(100, 21, 5, 'g-a') + c(100, 38, 5),
  ledger: [0, 1, 2, 3, 4].map((i) => r(10, 5 + i * 11, 8, 6, 'g-f', 1) + r(24, 6 + i * 11, 60 - (i % 3) * 10, 4) + p(`M${96} ${8 + i * 11}l3 3l6 -6`, i === 4 ? 'g-o' : 'g-l')).join(''),
  scope: r(8, 16, 30, 44, 'g-l', 4) + r(24, 10, 30, 44, 'g-l', 4) + r(40, 4, 30, 44, 'g-s', 4) + p('M78 26H112', 'g-l') + r(78, 34, 34, 8, 'g-a', 2) + r(78, 46, 24, 8, 'g-f', 2),

  /* test and measure */
  ab: r(18, 30, 30, 30, 'g-f', 3) + r(72, 10, 30, 50, 'g-a', 3) + p('M8 60H112'),
  chart: p('M8 56H112M8 6V56') + p('M12 48C30 46 38 40 50 34S74 16 88 18S104 12 110 10', 'g-o') + c(88, 18, 4, 'g-a'),
  replay: r(8, 6, 104, 52, 'g-l', 5) + r(16, 14, 44, 6) + r(16, 26, 60, 6) + r(16, 38, 36, 6) + p('M84 30l12 7l-5 2l3 7l-3 1l-3 -7l-4 4z', 'g-a'),
  check: r(10, 8, 44, 48, 'g-l', 5) + r(66, 8, 44, 48, 'g-l', 5) + p('M22 32l7 7l14 -14', 'g-o') + p('M78 25l20 14M98 25l-20 14', 'g-l'),
};

/** the drawing for a name, as the inside of an <svg viewBox="0 0 120 64"> */
export const glyph = (name) => GLYPHS[name] || '';
export const GLYPH_NAMES = Object.keys(GLYPHS);
