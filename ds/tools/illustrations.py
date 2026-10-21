#!/usr/bin/env python3
"""Generate the concept illustrations in Hostaway's mascot style (v4b, 3 Oct, fourth pass).

Style, from Hostaway's own site (research/references/hostaway-marketing/08 laptop mascot,
10 trumpet mascot: one mascot, ONE prop, a lot of air) and the in-product empty states (HS-06, HS-31):
- one bold raspberry figure (primary-500 #f24167): a broad rounded torso, two thick tube legs with
  little feet, thick tube arms, mitten fists with aubergine finger marks;
- an ABSTRACT head: a raspberry blob with one quirk (a curl, two tufts, a bun, a ponytail, a quiff,
  a sprout, a darker cap...) and at most one small aubergine mark, different in every scene (HEADS);
- CONCEPTUAL, ONE IDEA PER SCENE (review, 3 Oct, on v3: "way too much information, it's massive.
  Make it smaller and minimalistic, as much as you can, and conceptual"): the mascot plus ONE prop or
  symbol that carries the idea. No clusters of cards, notes, coins or calendars;
- but not empty (review, on v4: "a little too empty: add a little more detail, not a lot, and maybe
  some decorative elements"): a small amount of supporting detail (a window and a chimney, a spark
  between two values, a channel dot per line) and one or two decorative touches in Hostaway's
  style: a soft rounded blob behind the prop (blob()), "///" marker strokes (strokes()), a small
  sparkle, at most one hand-drawn ring;
- smaller than v3: the figure is drawn at k = 1.0 (v3: 1.32), about two thirds of the frame's height,
  with air above and beside it; NO ground line (review: "I don't like that all of the people are
  standing on a line"), only a very soft contact shadow (shadow(): aubergine at 7 %);
- aubergine (secondary-900 #321e52) contour strokes only where a limb crosses the body, finger marks
  and the odd object outline; a yellow/amber prop (warning-400 / -500 / -600); no limb is cropped by
  the view box, and no limb leaves the body where its contour is clipped (v4b: Design's arm read as
  "cut off").

Every file animates "ever so slightly" with its own <style> block: CSS keyframes on a few named groups
(the upper body's bob, the head, one prop or hand, a sparkle or the strokes), periods 1.4-6.6 s,
ease-in-out, alternate (the dotted trail is a linear loop).
Keyframes only say `to`, so the first frame is the final composition, and prefers-reduced-motion
switches everything off (scoped to the SVG). Selectors and keyframe names are prefixed per file, so
several SVGs can be inlined on one page without clashing. Animated groups never carry a transform
attribute (the CSS transform would replace it): every scaled drawing sits in an inner <g transform>,
and all transform-origins are in view-box px (Fig.o maps local -> view) or the element's own box.

SVG files use resolved hex (they are used as <img>); every value is a token in ds/tokens.css.
Usage: python3 ds/tools/illustrations.py  ->  ds/illustrations/*.svg

style-study-hs06.svg (the v1 calibration redraw of the HS-06 waving figure, 29 Sep) is not
regenerated here; it stays as committed (its generator is in git history, commit 8606939).
"""
import math
import os

DS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(DS, 'illustrations')
os.makedirs(OUT, exist_ok=True)

C = dict(
    fig='#f24167',      # --color-primary-500 / --color-illo-figure
    fig2='#e1295a',     # --color-primary-600 (the Design head's cap of hair)
    pink='#fca5b4',     # --color-primary-300 (pencil eraser)
    line='#321e52',     # --color-secondary-900 (aubergine linework)
    y='#fdb022',        # --color-warning-400 (props)
    y2='#f79009',       # --color-warning-500 (darker face of a prop)
    yl='#dc6803',       # --color-warning-600 (inner contour of props, motion ticks)
    ypale='#fedf89',    # --color-warning-200 (pencil wood, the "///" strokes)
    lav='#f2e6fe',      # --color-secondary-100 (soft blob behind a prop)
    lav3='#d6c2f7',     # --color-secondary-300 (the pot)
    lav5='#936acd',     # --color-secondary-500 (AI, sparkles, purple ring, water drops)
    blush1='#ffe4e7',   # --color-primary-100 (soft blob behind a prop, on lavender covers)
    g3='#d3d6da',       # --color-gray-300 (pencil ferrule)
    white='#ffffff',    # --color-surface-primary
    ok='#47c693',       # --color-grass-darker (the green check)
    airbnb='#ff5a5f', booking='#273b7d', vrbo='#0885f2',   # --color-channel-*
)
F, L = C['fig'], C['line']

# The mascot's local frame: x = 0 is the middle of the torso, y = 0 the ground (up is negative).
H, S = -66, -114           # hips, top of the shoulders
HX, HY = 2, -134           # the head's centre
SN, SF = (-16, S + 10), (16, S + 10)   # near (left) and far (right) shoulder
OUTW = 4.4                 # contour: stroke this much wider than the limb (~2.2 px each side at k 1)
MARK = 2.0                 # finger marks and the head's one mark


# ── primitives ──────────────────────────────────────────────────────────────────────────────
def P(d, fill='none', stroke=None, w=None, cap='round', join='round', extra=''):
    s = f'<path d="{d}" fill="{fill}"'
    if stroke:
        s += f' stroke="{stroke}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="{join}"'
    return s + extra + '/>'


def G(cls, inner):
    return f'<g class="{cls}">{inner}</g>'


def ring(cx, cy, r, color, w=4.5, start=-60, sweep=375, cls='doodle'):
    """A hand-drawn marker ring: slightly egg-shaped, ends overlapping."""
    pts = []
    n = 40
    for i in range(n + 1):
        t = math.radians(start + sweep * i / n)
        rr = r * (1 + 0.05 * math.sin(2 * t + 0.7) + 0.07 * i / n)
        pts.append((cx + rr * math.cos(t), cy + rr * 0.9 * math.sin(t)))
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return f'<g class="{cls}">' + P(d, stroke=color, w=w) + '</g>'


def strokes(x, y, n=3, dx=10, length=20, angle=-55, color=None, w=5, cls='doodle2'):
    """Pale yellow marker strokes "///", as on "We believe" (the deck's covers recolour them, kit/hc.js)."""
    color = color or C['ypale']
    a = math.radians(angle)
    out = ''.join(P(f'M{x + i*dx:.1f} {y + i*3:.1f} l{length*math.cos(a):.1f} {length*math.sin(a):.1f}', stroke=color, w=w)
                  for i in range(n))
    return f'<g class="{cls}">{out}</g>'


def blob(cx, cy, rx, ry, fill, wob=(.04, -.05, .06, -.03, .05, -.06), rot=0.4, cls=None):
    """A soft rounded blob behind a prop: a smooth closed curve through six wobbled points of an ellipse."""
    n = len(wob)
    pts = [(cx + rx * (1 + w) * math.cos(rot + 2 * math.pi * i / n), cy + ry * (1 + w) * math.sin(rot + 2 * math.pi * i / n))
           for i, w in enumerate(wob)]
    d = f'M{pts[0][0]:.1f} {pts[0][1]:.1f}'
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    g = P(d + 'Z', fill=fill)
    return f'<g class="{cls}">{g}</g>' if cls else g


def shadow(cx, cy, rx, ry=3.5):
    """A very soft contact shadow (aubergine at 7 %), so a figure stands free, without a ground line."""
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx}" ry="{ry}" fill="{L}" fill-opacity=".07"/>'


def ticks(cx, cy, r1, r2, angles, color=None, w=3, cls='marks'):
    """Short motion marks radiating from a point (the trumpet's)."""
    color = color or C['yl']
    d = ''.join(f'M{cx + r1*math.cos(math.radians(a)):.1f} {cy + r1*math.sin(math.radians(a)):.1f}'
                f'L{cx + r2*math.cos(math.radians(a)):.1f} {cy + r2*math.sin(math.radians(a)):.1f}' for a in angles)
    return f'<g class="{cls}">' + P(d, stroke=color, w=w) + '</g>'


def sparkle(x, y, s=1.0, color=None, cls='spark'):
    c = color or C['lav5']
    return (f'<g class="{cls}"><path transform="translate({x} {y}) scale({s})" fill="{c}" '
            'd="M0-10C1.2-3 3-1.2 10 0 3 1.2 1.2 3 0 10-1.2 3-3 1.2-10 0-3-1.2-1.2-3 0-10z"/></g>')


def check_badge(cx, cy, r=10, color=None, cls='pop'):
    color = color or C['ok']
    k = r / 10
    return (f'<g class="{cls}"><circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>'
            + P(f'M{cx-4.5*k:.1f} {cy+0.2*k:.1f}l{3.2*k:.1f} {3.2*k:.1f} {6*k:.1f}-{6.6*k:.1f}', stroke=C['white'], w=2.6 * k) + '</g>')


# ── the mascot (local frame) ───────────────────────────────────────────────────────────────
class Fig:
    """Maps the mascot's local frame onto the view box: local (0, 0) -> view (x, gy), scaled k."""

    def __init__(self, x, gy, k=1.0):
        self.x, self.gy, self.k = x, gy, k

    def t(self, inner):
        return f'<g transform="translate({self.x} {self.gy}) scale({self.k})">{inner}</g>'

    def v(self, lx, ly):
        return self.x + self.k * lx, self.gy + self.k * ly

    def o(self, lx, ly):
        vx, vy = self.v(lx, ly)
        return f'{vx:.1f}px {vy:.1f}px'


def leg(x1, y1, cx, cy, x2, y2, foot=1, w=19, color=None, outline=False):
    """A tube leg from the hip (x1,y1) to the ankle (x2,y2) and a little foot pointing `foot` (+1 right)."""
    color = color or F
    d = f'M{x1} {y1}Q{cx} {cy} {x2} {y2}'
    fx = x2 - w / 2 if foot > 0 else x2 - w / 2 - 7
    out = ''
    if outline:
        out += P(d, stroke=L, w=w + OUTW, cap='butt')
        out += f'<rect x="{fx-2.2}" y="{y2-6.7}" width="{w+11.4}" height="13.4" rx="6.7" fill="{L}"/>'
    out += P(d, stroke=color, w=w, cap='butt')
    out += f'<rect x="{fx}" y="{y2-4.5}" width="{w+7}" height="9" rx="4.5" fill="{color}"/>'
    return out


def torso(lean=0, hw=24):
    d = (f'M{-hw} {S+15}Q{-hw} {S} {-hw+14} {S}H{hw-14}Q{hw} {S} {hw} {S+15}'
         f'L{hw-3+lean} {H+6}Q{lean} {H+11} {-hw+3+lean} {H+6}Z')
    return P(d, fill=F)


def standard_legs(stance=0):
    """Two legs, a little apart; stance shifts the feet (a relaxed stride)."""
    return (leg(-11, H, -13, H / 2, -12 - stance, -4.5, foot=-1)
            + leg(11, H, 13, H / 2, 13 + stance, -4.5, foot=1))


CLIP = {'n': 0, 'p': 'x'}


def arm(d, outline=None, color=None, w=14):
    """A tube arm. outline=(x, y, w, h): draw the aubergine contour only inside that box (where the
    arm crosses the body), like the contour strokes on Hostaway's mascots; outline=True: all along."""
    color = color or F
    out = ''
    if outline is True:
        out += P(d, stroke=L, w=w + OUTW)
    elif outline:
        CLIP['n'] += 1
        cid = f'{CLIP["p"]}-c{CLIP["n"]}'
        x, y, bw, bh = outline
        out += (f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{bw}" height="{bh}"/></clipPath>'
                f'<g clip-path="url(#{cid})">' + P(d, stroke=L, w=w + OUTW) + '</g>')
    return out + P(d, stroke=color, w=w)


def fist(x, y, rot=0, r=8.2, color=None, outline=False):
    """A mitten fist with three aubergine finger marks; rot turns the knuckles."""
    color = color or F
    o = f'<circle r="{r+2.2}" fill="{L}"/>' if outline else ''
    return (f'<g transform="translate({x} {y}) rotate({rot})">{o}<circle r="{r}" fill="{color}"/>'
            + P('M-1.6-5.8q4 1.3 3.8 4.6M1.8-6.7q4 1.8 3.6 5.6M-4.9-3.8q2.9 0.9 2.9 3.4', stroke=L, w=MARK)
            + '</g>')


def palm(x, y, rot=0, r=7.6, color=None):
    """An open hand: a palm and three fingers (rot 0 = fingers up)."""
    color = color or F
    fing = ''.join(P(f'M{dx} -3l{dx*0.5:.1f} -9', stroke=color, w=4.2) for dx in (-4, 0, 4))
    thumb = P('M-5.5 1l-6 -4.5', stroke=color, w=4.2)
    return f'<g transform="translate({x} {y}) rotate({rot})">{fing}{thumb}<circle r="{r}" fill="{color}"/></g>'


# ── nine abstract heads, one per scene ─────────────────────────────────────────────────────
# Each is a raspberry blob with one quirk and at most one small aubergine mark, drawn round (0,0).
def _h_curl():         # round, one curl springing off the crown
    return (f'<circle r="12.5" fill="{F}"/>'
            + P('M1 -11.5C0 -21 10 -24.5 13.5 -19C16 -15 12.5 -11.5 8.5 -14', stroke=F, w=4.6))


def _h_bean():         # a tilted bean with two tufts swept back
    return (f'<ellipse rx="11" ry="14.5" transform="rotate(22)" fill="{F}"/>'
            + P('M-4 -11C-8 -20 -16 -22 -21 -18C-15 -16 -11 -12 -10 -7Z', fill=F)
            + P('M3 -14C0 -24 -8 -28 -14 -26C-8 -22 -5 -17 -4 -11Z', fill=F))


def _h_lookup():       # a squarish block, tipped back, a three-point crest
    return (f'<rect x="-11" y="-12" width="22" height="24" rx="7" fill="{F}"/>'
            + P('M-10 -8L-16 -17L-6 -11L-7 -22L1 -11L4 -19L8 -9Z', fill=F, stroke=F, w=2.4))


def _h_listen():       # a profile: nose bump forward, one aubergine ear
    return (f'<circle r="12.5" fill="{F}"/>'
            + f'<circle cx="11.5" cy="2" r="5" fill="{F}"/>'
            + P('M-3 -4.5a4.6 4.6 0 1 0 1.5 8.6', stroke=L, w=MARK + 0.2))


def _h_bun():          # round with a bun at the back, one band mark
    return (f'<circle cx="-9" cy="-12" r="7" fill="{F}"/>'
            + f'<circle r="12.5" fill="{F}"/>'
            + P('M-13 -6.5l4.5 -4.5', stroke=L, w=MARK))


def _h_cap():          # an egg with a short cap of hair a shade darker, swept to one side (v4b: the heart read as childish)
    return (P('M0 -14C8 -14 12.5 -8 12.5 -1C12.5 7 7 13.5 0 13.5C-7 13.5 -12 7 -12 -1C-12 -8 -8 -14 0 -14Z', fill=F)
            + P('M-12.3 -2C-13 -11 -6 -15.5 1 -15.2C8 -15 13 -10 13 -4C8 -9 0 -9.5 -6 -6C-9 -4.5 -11 -3 -12.3 -2Z', fill=C['fig2']))


def _h_ponytail():     # round with a ponytail flicking out behind
    return (f'<circle r="12.5" fill="{F}"/>'
            + P('M-7 -9C-17 -17 -27 -10 -33 -13C-30 -3 -20 1 -11 -2Z', fill=F))


def _h_quiff():        # an oval with a big quiff swept forward
    return (f'<ellipse rx="12" ry="13" fill="{F}"/>'
            + P('M-11 -5C-13 -19 3 -26 19 -18C12 -18 8 -15 6 -10Z', fill=F))


def _h_sprout():       # round with a two-leaf sprout (growth) and the one smile
    return (f'<circle r="12.5" fill="{F}"/>'
            + P('M0 -11V-20', stroke=F, w=3.6)
            + P('M0 -19C-2 -26 -10 -28.5 -14 -25C-10 -21 -5 -19 0 -19Z', fill=F)
            + P('M0 -20C3 -28.5 12 -31 16 -26.5C12 -22 6 -20 0 -20Z', fill=F)
            + P('M-2 3.5q4.5 4.5 9 0', stroke=L, w=MARK + 0.2))


HEADS = dict(curl=_h_curl, bean=_h_bean, lookup=_h_lookup, listen=_h_listen, bun=_h_bun,
             cap=_h_cap, ponytail=_h_ponytail, quiff=_h_quiff, sprout=_h_sprout)


def head(kind, tilt=0, flip=1, hx=HX, hy=HY):
    sc = f' scale({flip} 1)' if flip != 1 else ''
    return f'<g transform="translate({hx} {hy}) rotate({tilt}){sc}">{HEADS[kind]()}</g>'


# ── the document ────────────────────────────────────────────────────────────────────────────
def style(p, anims):
    """anims: (selector, to-keyframe, seconds, origin, extra). origin: 'x y' in px (view-box) or a
    fill-box keyword like 'center' / '50% 100%'."""
    css = []
    for i, a in enumerate(anims):
        sel, kf, dur, origin = a[:4]
        extra = a[4] if len(a) > 4 else {}
        name = f'{p}{i}'
        timing = extra.get('timing', 'ease-in-out')
        direction = extra.get('dir', 'alternate')
        delay = f' {extra["delay"]}s' if 'delay' in extra else ''
        rule = f'.{p} {sel}{{animation:{name} {dur}s {timing}{delay} infinite {direction}'
        if origin:
            if 'px' in origin:
                rule += f';transform-box:view-box;transform-origin:{origin}'
            else:
                rule += f';transform-box:fill-box;transform-origin:{origin}'
        css.append(rule + '}')
        frames = kf if kf.startswith('from') or '%' in kf.split('{')[0] else f'to{{{kf}}}'
        css.append(f'@keyframes {name}{{{frames}}}')
    css.append(f'@media (prefers-reduced-motion:reduce){{.{p},.{p} *{{animation:none!important}}}}')
    return '<style>' + ''.join(css) + '</style>'


def svg(name, p, title, desc, body, anims, w=320, h=220):
    assert f'{CLIP["p"]}-' in body or 'clipPath' not in body, name
    doc = (f'<svg xmlns="http://www.w3.org/2000/svg" class="{p}" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
           f'role="img" aria-labelledby="{p}-t {p}-d"><title id="{p}-t">{title}</title><desc id="{p}-d">{desc}</desc>'
           f'{style(p, anims)}{body}</svg>\n')
    with open(os.path.join(OUT, name), 'w') as fh:
        fh.write(doc)
    return len(doc.encode())


def nod(m, deg=-4, dur=5.2):
    return ('.head', f'transform:rotate({deg}deg)', dur, m.o(HX, HY + 12))


def swing(m, cls, deg, dur, shoulder):
    return (cls, f'transform:rotate({deg}deg)', dur, m.o(*shoulder))




# ── the scenes ──────────────────────────────────────────────────────────────────────────────
sizes = {}
K = 1.0          # the figure's scale in the 320 x 220 scenes (smaller than v3's 1.32, with air around it)
GY = 204         # where the feet stand (view px); no ground line since v4b, only a soft shadow


def rotp(pt, deg, about=(0, H)):
    """Rotate a local point about `about` (default the hips)."""
    a = math.radians(deg)
    x, y = pt[0] - about[0], pt[1] - about[1]
    return (about[0] + x * math.cos(a) - y * math.sin(a), about[1] + x * math.sin(a) + y * math.cos(a))


def tile(x, y, s, fill, rot=0, r=None, stroke=None, sw=2.4):
    r = s * 0.28 if r is None else r
    t = f' transform="rotate({rot} {x + s/2:.1f} {y + s/2:.1f})"' if rot else ''
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{r:.1f}" fill="{fill}"{st}{t}/>'


HIP = ('M-16 -104C-36 -96 -40 -78 -28 -68', (-24, -66, 200))       # the near hand on the hip
BOB = ('.up', 'transform:translateY(-2px)', 4.2, None)
TICK = ('.marks', 'opacity:.2', 1.6, None)
SPARK = ('.spark', 'transform:scale(.6) rotate(20deg);opacity:.6', 2.6, 'center')
STROKES = ('.doodle2', 'opacity:.55', 3.4, None)
DOTS = ' stroke-dasharray="0.1 6"'

# 1 · Bringing listings together ─────────────────────────────────────────────────────────────
# One idea: many listings become one home. A yellow house (a window, a chimney) stands by the host,
# whose hand rests on its roof; three small channel tiles (Airbnb, Booking.com, Vrbo) float down a
# dotted trail into it. A lavender blob behind the house; "///" strokes and a sparkle.
# Head: round with a single curl.
CLIP['p'] = 'lt'
m = Fig(98, GY, K)
HXL, HW, HB = 168, 64, 52                                  # the house: centre x, width, body height (view px)
RT = GY - HB - 34                                          # the roof's apex
house = (
    f'<rect x="{HXL + 14}" y="{RT + 6}" width="10" height="24" rx="2.5" fill="{C["y2"]}"/>'
    + P(f'M{HXL - HW/2 - 7} {GY - HB + 2}L{HXL} {RT}L{HXL + HW/2 + 7} {GY - HB + 2}Z', fill=C['y2'], stroke=C['y2'], w=7)
    + f'<circle cx="{HXL}" cy="{GY - HB - 12}" r="5.5" fill="{C["white"]}" stroke="{C["yl"]}" stroke-width="2"/>'
    + f'<rect x="{HXL - HW/2}" y="{GY - HB}" width="{HW}" height="{HB}" rx="4" fill="{C["y"]}"/>'
    + P(f'M{HXL - 8} {GY}V{GY - 16}q0-8 8-8q8 0 8 8V{GY}Z', fill=F)
)
lt_body = (
    blob(HXL + 2, 146, 60, 54, C['lav'])
    + strokes(22, 58)
    + P('M286 28C250 30 206 52 180 88', stroke=L, w=2.2, extra=' class="flow"' + DOTS)
    + '<g class="drift">' + tile(226, 40, 15, C['airbnb'], -14) + tile(190, 60, 13, C['booking'], 10) + tile(166, 90, 11, C['vrbo'], -8) + '</g>'
    + sparkle(236, 124, .6)
    + shadow(m.x, GY, 30) + shadow(HXL, GY, 40)
    + house
    + m.t(standard_legs(2))
    + '<g class="up">'
    + m.t(torso() + arm('M-16 -104C-30 -90 -34 -70 -32 -56') + fist(-31, -52, 170))
    + G('head', m.t(head('curl', -6)))
    + m.t(arm('M16 -104C30 -104 42 -92 48 -80') + fist(50, -76, 40))
    + '</g>'
)
sizes['listings-together.svg'] = svg(
    'listings-together.svg', 'lt', 'Bringing listings together',
    'The host rests a hand on one yellow house while three small tiles, the Airbnb, Booking.com and Vrbo listings, float down a dotted trail into its roof.',
    lt_body,
    [BOB, nod(m, -4),
     ('.drift', 'transform:translate(-3px,2px)', 3.4, None),
     ('.flow', 'stroke-dashoffset:-12.2', 2.4, None, {'timing': 'linear', 'dir': 'normal'}),
     SPARK, STROKES])

# 2 · One fact, many channels ────────────────────────────────────────────────────────────────
# One idea: one fact, said once, reaches every channel. The host holds up one yellow fact tile
# (a bathtub) on a fist; three short lines fan out from it to three small channel tiles. A lavender
# blob behind; a sparkle and "///" strokes. Head: a tilted bean with two tufts.
CLIP['p'] = 'of'
m = Fig(100, GY, K)
TC, TS = (54, -126), 46
tubg = (P('M-14 0H14V2C14 8 9.5 11 4 11H-4C-9.5 11 -14 8 -14 2Z', fill=L)
        + P('M-8 11l-1.5 3.5M8 11l1.5 3.5', stroke=L, w=2.6)
        + P('M-9 0V-10a4.5 4.5 0 0 1 9 0v1.5', stroke=L, w=2.6))
fact = (f'<rect x="{TC[0]-TS/2}" y="{TC[1]-TS/2}" width="{TS}" height="{TS}" rx="12" fill="{C["y"]}"/>'
        + f'<g transform="translate({TC[0]+2} {TC[1]+1})">{tubg}</g>')
cx_, cy_ = m.v(*TC)
fan, ends = '', ''
for i, (a, dot) in enumerate(zip((-32, 0, 32), (C['airbnb'], C['booking'], C['vrbo']))):
    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
    fan += P(f'M{cx_ + 36*ca:.1f} {cy_ + 36*sa:.1f}L{cx_ + 56*ca:.1f} {cy_ + 56*sa:.1f}', stroke=L, w=2.6)
    ex_, ey_ = cx_ + 67*ca, cy_ + 67*sa
    ends += f'<g class="d{i}">' + tile(round(ex_ - 6.5, 1), round(ey_ - 6.5, 1), 13, dot, (-10, 8, -6)[i]) + '</g>'
of_body = (
    blob(cx_ + 30, cy_ + 4, 62, 52, C['lav'])
    + strokes(244, 186)
    + sparkle(138, 30, .55)
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(2))
    + '<g class="up">'
    + m.t(arm('M16 -104C30 -94 46 -92 52 -98') + torso())
    + G('head', m.t(head('bean', -8)))
    + m.t(arm(HIP[0]) + fist(*HIP[1]))
    + m.t(fact + fist(54, -98, -90))
    + fan + ends
    + '</g>'
)
sizes['one-fact-many-channels.svg'] = svg(
    'one-fact-many-channels.svg', 'of', 'One fact, many channels',
    'The host holds up one yellow fact tile, a bathtub; three short lines fan out from it to small Airbnb, Booking.com and Vrbo tiles.',
    of_body,
    [BOB, nod(m, 4),
     ('.d0', 'transform:scale(.8)', 2.4, 'center'),
     ('.d1', 'transform:scale(.8)', 2.4, 'center', {'delay': .4}),
     ('.d2', 'transform:scale(.8)', 2.4, 'center', {'delay': .8}),
     SPARK, STROKES])

# 3 · Conflict resolved ──────────────────────────────────────────────────────────────────────
# One idea: two different values become one agreed one. A circle and a square (two values, a little
# spark between them) run together into one green check; the host, hand on hip, presents it.
# A blush blob behind; a sparkle and "///" strokes. Head: round with a ponytail.
CLIP['p'] = 'cr'
m = Fig(96, GY, K)
MX = 230
cr_body = (
    blob(MX, 102, 60, 66, C['blush1'])
    + strokes(270, 184)
    + P(f'M198 72C198 98 {MX} 94 {MX} 118', stroke=L, w=2.6) + P(f'M262 72C262 98 {MX} 94 {MX} 118', stroke=L, w=2.6)
    + P(f'M{MX} 116V126', stroke=L, w=2.6)
    + '<g class="clash">' + P(f'M{MX - 5} 44l7 7-5 3 7 8', stroke=C['yl'], w=2.6) + '</g>'
    + f'<g class="ma"><circle cx="198" cy="58" r="12" fill="{C["y"]}"/></g>'
    + '<g class="mb">' + tile(251, 47, 22, C['y'], 14, r=5) + '</g>'
    + f'<circle cx="{MX}" cy="145" r="21" fill="{C["white"]}"/>' + check_badge(MX, 145, 17)
    + sparkle(MX + 34, 126, .55)
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(2))
    + '<g class="up">'
    + m.t(arm('M16 -104C32 -106 42 -112 50 -118') + palm(54, -121, 62) + torso())
    + G('head', m.t(head('ponytail', -8)))
    + m.t(arm(HIP[0]) + fist(*HIP[1]))
    + '</g>'
)
sizes['conflict-resolved.svg'] = svg(
    'conflict-resolved.svg', 'cr', 'Conflict resolved',
    'Two different values, a circle and a square with a spark between them, run together into one green check while the host presents it, hand on hip.',
    cr_body,
    [BOB, nod(m, -5),
     ('.ma', 'transform:translateX(3px)', 3.2, None),
     ('.mb', 'transform:translateX(-3px)', 3.2, None),
     ('.clash', 'opacity:.3', 1.7, None),
     ('.pop', 'transform:scale(1.1)', 3.2, 'center'),
     SPARK, STROKES])

# 4 · AI writing per channel ─────────────────────────────────────────────────────────────────
# One idea: AI writes it for you, a version per channel. A giant yellow pencil, held in both hands
# (the near arm crosses the chest cleanly, v4b: review saw it "cut off"), draws three lavender
# lines (lavender = AI), each led by its channel's dot. A blush blob behind the lines; two sparkles.
# Head: an egg with a darker cap of hair (v4b: the heart head read as childish).
CLIP['p'] = 'aw'
m = Fig(84, GY, K)
E, ANG, LEN = (22, -132), 28, 132
pencil = (f'<g transform="translate({E[0]} {E[1]}) rotate({ANG})">'
          f'<rect x="0" y="-7.5" width="14" height="15" rx="4.5" fill="{C["pink"]}"/>'
          f'<rect x="12" y="-7.5" width="10" height="15" fill="{C["g3"]}"/>'
          + f'<rect x="22" y="-7.5" width="{LEN-50}" height="15" fill="{C["y"]}"/><rect x="22" y="-7.5" width="{LEN-50}" height="5" fill="{C["y2"]}"/>'
          + P(f'M{LEN-28} -7.5L{LEN} 0L{LEN-28} 7.5Z', fill=C['ypale'])
          + P(f'M{LEN-8.5} -2.3L{LEN} 0L{LEN-8.5} 2.3Z', fill=L) + '</g>')


def along(t):
    a = math.radians(ANG)
    return E[0] + t * math.cos(a), E[1] + t * math.sin(a)


h1, h2 = along(34), along(62)
tx, ty = m.v(*along(LEN))
X0 = tx - 50
lines = ''.join(f'<circle cx="{X0 - 9:.0f}" cy="{ty + dy:.0f}" r="3.6" fill="{dot}"/>'
                + P(f'M{X0:.0f} {ty + dy:.0f}H{tx + x1:.0f}', stroke=C['lav5'], w=3.6)
                for dy, x1, dot in ((1, -1, C['airbnb']), (16, 24, C['booking']), (31, 8, C['vrbo'])))
aw_body = (
    blob(tx - 2, ty + 14, 66, 42, C['blush1'])
    + lines
    + sparkle(tx + 30, ty - 20, .9) + sparkle(tx + 44, ty + 48, .5, cls='spark2')
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(1))
    + '<g class="up">'
    + m.t(torso())
    + G('head', m.t(head('cap', -6)))
    + '<g class="arm">' + m.t(arm(f'M{SF[0]} {SF[1]}C30 -110 40 -116 {h1[0]:.1f} {h1[1]:.1f}')
                             + pencil + fist(h1[0], h1[1], 28)
                             + arm(f'M{SN[0]} {SN[1]}C-10 -84 40 -84 {h2[0]:.1f} {h2[1]:.1f}', outline=(-24, -114, 48, 54))
                             + fist(h2[0], h2[1], 28)) + '</g>'
    + '</g>'
)
sizes['ai-writing-per-channel.svg'] = svg(
    'ai-writing-per-channel.svg', 'aw', 'AI writing per channel',
    'The host steers a giant yellow pencil that draws three lavender lines, one per channel (Airbnb, Booking.com, Vrbo), with sparkles of AI.',
    aw_body,
    [BOB, nod(m, 4),
     swing(m, '.arm', 1.4, 3.0, SF),
     SPARK, ('.spark2', 'transform:scale(.55) rotate(-20deg);opacity:.5', 3.4, 'center', {'delay': .6})])

# 5 · What comes next: the system grows (file name kept: the deck's covers point at it) ──────
# One idea: the system keeps growing. The host waters a small sprout whose stem branches into
# connected rounded nodes (raspberry, yellow, lavender), with a new bud on a dotted link: the next
# thing to grow. A yellow watering can (the one prop), three water drops, a lavender blob behind the
# plant; a sparkle by the bud and "///" strokes. v4b: review found v4's receipts and undo arrow
# "very off brand"; this replaces them (no documents, no arrow). Head: an oval with a quiff.
CLIP['p'] = 'nl'
m = Fig(100, GY, K)
CAN, CR = (162, 130), 20                     # the can's centre (view px) and its tilt (spout down)
can = (f'<g transform="translate({CAN[0]} {CAN[1]}) rotate({CR})">'
       + P('M-11 -14C-11 -29 11 -29 11 -14', stroke=C['y2'], w=5)
       + P('M14 6L44 -9', stroke=C['y2'], w=6)
       + f'<rect x="42" y="-17" width="7" height="15" rx="3" transform="rotate(-27 45.5 -9.5)" fill="{C["y"]}"/>'
       + f'<rect x="-18" y="-14" width="36" height="30" rx="8" fill="{C["y"]}"/>'
       + f'<rect x="-18" y="-14" width="36" height="7" rx="3.5" fill="{C["y2"]}"/>'
       + '</g>')
hand = rotp((0, -25.5), CR, (0, 0))
hx_, hy_ = CAN[0] + hand[0] - m.x, CAN[1] + hand[1] - m.gy          # the handle's top, in the local frame
PX = 238                                                             # the plant's stem
N1, N2, N3, N4 = (220, 116), (260, 114), (240, 92), (282, 90)
plant = (
    P(f'M{PX} 172V140', stroke=L, w=3)
    + P(f'M{PX} 162C{PX-8} 162 {PX-16} 156 {PX-18} 148C{PX-10} 148 {PX-2} 154 {PX} 162Z', fill=F)
    + P(f'M{PX} 156C{PX+8} 156 {PX+16} 150 {PX+18} 142C{PX+10} 142 {PX+2} 148 {PX} 156Z', fill=F)
    + ''.join(P(f'M{PX} 140L{x} {y}', stroke=L, w=2.6) for x, y in (N1, N2, N3))
    + P(f'M{N2[0]} {N2[1]}L{N4[0]} {N4[1]}', stroke=L, w=2.2, extra=DOTS)
    + f'<circle cx="{N1[0]}" cy="{N1[1]}" r="8" fill="{C["y"]}"/>'
    + f'<circle cx="{N2[0]}" cy="{N2[1]}" r="8" fill="{C["lav5"]}"/>'
    + f'<circle cx="{N3[0]}" cy="{N3[1]}" r="10" fill="{F}"/>'
    + f'<g class="bud"><circle cx="{N4[0]}" cy="{N4[1]}" r="5.5" fill="{C["white"]}" stroke="{C["lav5"]}" stroke-width="2.2"/></g>'
    + f'<rect x="{PX-24}" y="172" width="48" height="9" rx="4.5" fill="{C["lav5"]}"/>'
    + P(f'M{PX-20} 181H{PX+20}L{PX+16} 200Q{PX+15} {GY} {PX+11} {GY}H{PX-11}Q{PX-15} {GY} {PX-16} 200Z', fill=C['lav3'])
)


def drop(x, y):
    return P(f'M{x} {y-4.5}C{x+3.2} {y} {x+3.2} {y+3} {x} {y+3}C{x-3.2} {y+3} {x-3.2} {y} {x} {y-4.5}Z', fill=C['lav5'])


nl_body = (
    blob(PX + 4, 130, 52, 62, C['lav'])
    + strokes(22, 58)
    + sparkle(N4[0] + 14, N4[1] - 14, .55)
    + shadow(m.x, GY, 30) + shadow(PX, GY, 30)
    + plant
    + '<g class="drops">' + drop(213, 149) + drop(218, 160) + drop(223, 171) + '</g>'
    + m.t(standard_legs(2))
    + '<g class="up">'
    + m.t(torso() + arm(HIP[0]) + fist(*HIP[1]))
    + G('head', m.t(head('quiff', 10)))
    + '<g class="arm">' + can + m.t(arm(f'M16 -104C34 -112 {hx_ - 14:.1f} {hy_ - 10:.1f} {hx_ - 2:.1f} {hy_ - 1:.1f}') + fist(hx_, hy_, 80)) + '</g>'
    + '</g>'
)
sizes['nothing-lost-versions.svg'] = svg(
    'nothing-lost-versions.svg', 'nl', 'What comes next',
    'The host waters a small sprout whose stem branches into connected rounded nodes, with a new bud on a dotted link: the system keeps growing.',
    nl_body,
    [BOB, nod(m, 4, 5.8),
     swing(m, '.arm', -2.5, 3.2, SF),
     ('.drops', 'transform:translateY(3px);opacity:.35', 1.4, None),
     ('.bud', 'transform:scale(1.25)', 2.6, 'center'),
     SPARK, STROKES])

# 6 · Research: listening ────────────────────────────────────────────────────────────────────
# One idea: we listened. One big yellow speech bubble (the hosts talking, from off frame) with a
# smaller lavender one behind it; the host faces it, head tilted in, a hand cupped round the back of
# the head, behind the ear. A blush blob behind the bubbles; a sparkle.
# Head: a profile, one ear mark. The figure stands at the right (the deck's research cover mirrors
# the drawing, covers.json "flip").
CLIP['p'] = 'rl'
m = Fig(230, GY, K)
bub = P('M64 46H132Q158 46 158 72V90Q158 116 132 116H90L60 140L68 116H64Q38 116 38 90V72Q38 46 64 46Z', fill=C['y'])
bub2 = (P('M40 16H86Q102 16 102 32V34Q102 50 86 50H44L30 60L32 49Q22 46 22 34V32Q22 16 40 16Z', fill=C['lav3'])
        + P('M36 28H66M36 36H56', stroke=C['white'], w=3.2))
HT = -10                                              # the head tilts in toward the bubble
hc = (HX, HY)


def cup_hand(r=19, a0=-62, a1=52, w=9):
    """A cupped hand: a thick arc hugging the back of the head, round ends, two finger marks."""
    p0 = (hc[0] + r * math.cos(math.radians(a0)), hc[1] + r * math.sin(math.radians(a0)))
    p1 = (hc[0] + r * math.cos(math.radians(a1)), hc[1] + r * math.sin(math.radians(a1)))
    marks = ''.join(P(f'M{hc[0] + (r - 2.5) * math.cos(math.radians(a)):.1f} {hc[1] + (r - 2.5) * math.sin(math.radians(a)):.1f}'
                      f'L{hc[0] + (r + 2.5) * math.cos(math.radians(a)):.1f} {hc[1] + (r + 2.5) * math.sin(math.radians(a)):.1f}', stroke=L, w=MARK)
                    for a in (-30, -8))
    return P(f'M{p0[0]:.1f} {p0[1]:.1f}A{r} {r} 0 0 1 {p1[0]:.1f} {p1[1]:.1f}', stroke=F, w=w) + marks, p1


cup, cup_end = cup_hand()
ce = rotp(cup_end, HT, hc)
rl_body = (
    blob(96, 82, 80, 58, C['blush1'])
    + sparkle(176, 36, .6)
    + '<g class="b2">' + bub2 + '</g>'
    + bub
    + '<g class="dots">' + ''.join(f'<circle cx="{x}" cy="81" r="5.5" fill="{C["yl"]}"/>' for x in (80, 98, 116)) + '</g>'
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(1))
    + '<g class="up">'
    + m.t(torso() + arm(f'M{SN[0]} {SN[1]}C-36 -96 -40 -78 -28 -68') + fist(-24, -66, 200))
    + G('head', m.t(head('listen', HT, flip=-1)
                    + f'<g transform="rotate({HT} {hc[0]} {hc[1]})">{cup}</g>'
                    + arm(f'M{SF[0]} {SF[1]}C34 -106 32 -118 {ce[0]:.1f} {ce[1]:.1f}')))
    + '</g>'
)
sizes['research-listening.svg'] = svg(
    'research-listening.svg', 'rl', 'Listening to hosts',
    'One big yellow speech bubble and a smaller lavender one, the hosts talking; the host faces them, head tilted in, a hand cupped behind the ear.',
    rl_body,
    [BOB, nod(m, -5, 4.8),
     ('.dots', 'opacity:.45', 1.8, None),
     ('.b2', 'transform:translateY(-2px)', 3.6, None),
     SPARK])

# 7 · Concept: choosing among directions ─────────────────────────────────────────────────────
# One idea: many directions, one chosen. Four tiles, each with a small mark of its own; one is
# yellow and ringed in raspberry; the host, hand on chin, weighs them. A lavender blob behind;
# a sparkle and "///" strokes. Head: round with a bun.
CLIP['p'] = 'cd'
m = Fig(96, GY, K)
g3 = C['g3']
cd_body = (
    blob(222, 86, 62, 56, C['lav'])
    + strokes(258, 176)
    + sparkle(276, 38, .55)
    + tile(178, 60, 30, C['white'], stroke=L) + f'<circle cx="193" cy="75" r="5.5" fill="{g3}"/>'
    + tile(178, 102, 30, C['white'], stroke=L) + P('M186 124L193 110L200 124Z', fill=g3)
    + tile(220, 102, 30, C['white'], stroke=L) + P('M228 112H242M228 119H238M228 126H241', stroke=g3, w=2.6)
    + '<g class="pick">' + tile(220, 60, 30, C['y'], stroke=L) + sparkle(235, 75, .55, L, cls='mark') + '</g>'
    + ring(235, 75, 27, F, w=4.5)
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(2))
    + '<g class="up">'
    + m.t(arm('M16 -104C36 -96 40 -78 28 -68') + fist(24, -66, -20) + torso())
    + G('head', m.t(head('bun', 10)))
    + m.t(arm(f'M{SN[0]} {SN[1]}C-30 -76 -8 -76 6 -110', outline=(-24, -114, 48, 60)) + fist(7, -113, -30))
    + '</g>'
)
sizes['concept-directions.svg'] = svg(
    'concept-directions.svg', 'cd', 'Choosing a direction',
    'Four tiles, the directions, each with a small mark of its own; one is yellow and ringed in raspberry, the chosen one. The host, hand on chin, weighs them.',
    cd_body,
    [BOB, nod(m, 5, 5.0),
     ('.pick', 'transform:translateY(-2px)', 3.2, None),
     ('.doodle', 'transform:rotate(12deg)', 6.6, 'center'),
     SPARK, STROKES])

# 8 · Test & measure ─────────────────────────────────────────────────────────────────────────
# One idea: put it in front of hosts, out loud. A yellow megaphone (the trumpet's cousin,
# reference 10) with motion ticks and two lavender sound arcs; the other hand on the hip. A lavender
# blob behind the sound; "///" strokes. Head: a squarish block tipped back, a
# crest. (The rising bars belong to the title's earn scene, so the deck doesn't repeat one motif.)
CLIP['p'] = 'tm'
m = Fig(96, GY, K)
MA, MS = -12, 1.2                    # the megaphone's tilt and scale
mega = (f'<g transform="translate(13 -132) rotate({MA}) scale({MS})">'
        + f'<rect x="15" y="5" width="8" height="15" rx="2.5" fill="{C["y2"]}"/>'
        + f'<rect x="0" y="-5.5" width="11" height="11" rx="2.5" fill="{C["y2"]}"/>'
        + P('M9 -6.5L54 -21V21L9 6.5Z', fill=C['y'])
        + f'<ellipse cx="54" cy="0" rx="6" ry="21" fill="{C["y2"]}"/><ellipse cx="55" cy="0" rx="3.4" ry="16" fill="{C["yl"]}"/>'
        + '</g>')
a_ = math.radians(MA)
bx, by = m.v(13 + MS * 60 * math.cos(a_), -132 + MS * 60 * math.sin(a_))
hx_, hy_ = 13 + MS * (19 * math.cos(a_) - 18 * math.sin(a_)), -132 + MS * (19 * math.sin(a_) + 18 * math.cos(a_))


def arc(cx, cy, r, a0, a1):
    p0 = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0)))
    p1 = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
    return f'M{p0[0]:.1f} {p0[1]:.1f}A{r} {r} 0 0 1 {p1[0]:.1f} {p1[1]:.1f}'


tm_body = (
    blob(bx + 40, by + 6, 52, 50, C['lav'])
    + strokes(24, 62)
    + '<g class="waves">' + P(arc(bx - 8, by, 58, -34, 22) + arc(bx - 8, by, 72, -30, 18), stroke=C['lav5'], w=3) + '</g>'
    + shadow(m.x, GY, 30)
    + m.t(standard_legs(3))
    + '<g class="up">'
    + m.t(torso())
    + G('head', m.t(head('lookup', -14)))
    + m.t(arm(HIP[0]) + fist(*HIP[1]))
    + '<g class="arm">' + m.t(mega + arm(f'M{SF[0]} {SF[1]}C26 -100 {hx_:.1f} {hy_ + 12:.1f} {hx_:.1f} {hy_ + 3:.1f}') + fist(hx_, hy_ + 2, 10))
    + ticks(bx, by, 30, 40, (-40, -12, 16)) + '</g>'
    + '</g>'
)
sizes['test-measuring.svg'] = svg(
    'test-measuring.svg', 'tm', 'Test and measure',
    'The host calls out through a yellow megaphone, chin up, the other hand on the hip; sound arcs ripple out.',
    tm_body,
    [BOB, nod(m, -4, 4.6),
     swing(m, '.arm', -3, 3.2, SF),
     ('.waves', 'opacity:.4;transform:translateX(3px)', 2.2, None),
     TICK, STROKES])

# 9 · Earn: more bookings, more money (the hero, 320 × 320) ─────────────────────────────────
# One idea: it pays off. The intro animation ends on this: the mascot celebrating, both arms up,
# and one abstract growth motif beside it. No calendar, no coins (review, 3 Oct: "I don't like how
# literal the calendar and the money are; it should be more of an interpretation... not busy").
# Head: round with a two-leaf sprout (growth) and the one smile.
#
# Built for a slide to animate in sequence. The PART groups (class earn-*) carry no transform and
# no animation of their own, and everything inside them is in view-box px, so a slide can move,
# scale or fade them freely (transform-origin in px of the 320 × 320 view box). The idle motion
# lives on INNER groups (class ei-*) and on the bars' own rects, so it keeps running underneath.
CLIP['p'] = 'ea'
m = Fig(116, 300, 1.3)
# the growth motif: a soft lavender blob and three soft rounded bars rising (x, height). Each bar
# is one <rect> in its own .earn-rise-N group, so a slide can grow them in turn from the bottom.
RISE = [(200, 54), (238, 96), (276, 146)]
rise = (blob(254, 238, 58, 66, C['lav'])
        + ''.join(f'<g class="earn-rise-{i+1}"><rect x="{x}" y="{300 - h}" width="28" height="{h}" rx="14" fill="{C["y"]}"/></g>'
                  for i, (x, h) in enumerate(RISE)))
NEAR_UP = f'M{SN[0]} {SN[1]}C-32 -114 -40 -134 -36 -156'
FAR_UP = f'M{SF[0]} {SF[1]}C30 -118 38 -138 39 -156'
fx_, fy_ = m.v(-35, -160)
px_, py_ = m.v(40, -162)
ea_mascot = (
    '<g class="earn-mascot">'
    + shadow(m.x, 300, 40, 4.5)
    + '<g class="earn-legs">' + m.t(standard_legs(4)) + '</g>'
    + '<g class="earn-body"><g class="ei-up">'
    + '<g class="earn-arm2"><g class="ei-arm2">' + m.t(arm(FAR_UP) + palm(40, -162, 10)) + '</g></g>'
    + m.t(torso())
    + '<g class="earn-head">' + m.t(head('sprout', -10)) + '</g>'
    + '<g class="earn-arm"><g class="ei-arm">' + m.t(arm(NEAR_UP) + fist(-35, -160, -8)) + '</g></g>'
    + '</g></g>'
    + '</g>'
)
burst = ('<g class="earn-burst">' + ticks(fx_, fy_, 19, 28, (-165, -130, -95), cls='ei-ticks')
         + sparkle(px_ + 26, py_ + 22, .7, cls='ei-spark') + '</g>')
ea_body = (
    f'<g class="earn-rise">{rise}</g>'
    + '<g class="earn-doodle">' + ring(36, 232, 13, C['lav5'], cls='ei-ring') + strokes(20, 130, cls='ei-strokes') + '</g>'
    + ea_mascot
    + burst
)
sizes['mascot-earn.svg'] = svg(
    'mascot-earn.svg', 'ea', 'More bookings, more money',
    'The Hostaway mascot celebrates, both arms up, beside three soft yellow bars rising: it pays off.',
    ea_body,
    [('.ei-up', 'transform:translateY(-3px)', 3.2, None),
     ('.ei-arm', 'transform:rotate(6deg)', 1.6, m.o(*SN)),
     ('.ei-arm2', 'transform:rotate(-4deg)', 2.4, m.o(*SF)),
     ('.ei-ticks', 'opacity:.2', 1.6, None),
     ('.ei-spark', 'transform:scale(.6) rotate(20deg);opacity:.6', 2.6, 'center'),
     ('.earn-rise-2 rect', 'transform:scaleY(1.04)', 3.6, '50% 100%'),
     ('.earn-rise-3 rect', 'transform:scaleY(1.04)', 4.4, '50% 100%', {'delay': .5}),
     ('.ei-ring', 'transform:rotate(16deg)', 6.2, 'center'),
     ('.ei-strokes', 'opacity:.55', 3.4, None)],
    w=320, h=320)

print(sizes)
