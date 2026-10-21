#!/usr/bin/env python3
"""Write the fidelity frames (ds/fidelity/frames/*.html) that replicate 8 real screens at
the screenshot viewport (1512x862). details-arrival.html is hand-written; the rest are
generated here so shared bits (header, tabs, toolbar) stay identical.
Usage: python3 ds/tools/build_frames.py && python3 ds/tools/fidelity.py
"""
import os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'fidelity', 'frames')
SEL = ' aria-selected="true"'


def I(n, c='h-icon'):
    return f'<svg class="{c}" aria-hidden="true"><use href="#i-{n}"/></svg>'


def M(n, c='h-mark'):
    return f'<svg class="{c}" aria-hidden="true"><use href="#ch-{n}"/></svg>'


SW = (f'<button class="h-switcher"><span class="h-switcher__thumb"></span>'
      f'<span class="h-switcher__label">Beautiful Artist Apt. in Neukolln (unlisted)</span>{I("chevron-down")}</button>')


def header(t):
    return f'<header class="h-page-header"><h1 class="h-h1">{t}</h1>{SW}</header>'


def tabs(names, active):
    return ('<div class="h-tabs" role="tablist">'
            + ''.join(f'<button class="h-tab" role="tab"{SEL if n == active else ""}>{n}</button>' for n in names)
            + '</div>')


def page(title, sub, body, active='properties', app_style='', outside=''):
    subnav = f'<nav data-shell="subnav" data-active="{sub}"></nav>' if sub else ''
    return f'''<!doctype html><html lang="en"><head><title>Fidelity · {title}</title>
<!--#include _head.html--></head>
<body class="h-root"><div class="frame">
<div class="h-app h-app--viewport"{app_style}>
  <aside data-shell="sidebar" data-active="{active}"></aside>
  {subnav}
  {body}
  <button class="h-chat-fab h-chat-fab--fixed" aria-label="Chat with Hospitable" data-hmark></button>
</div>{outside}
</div></body></html>
'''


def toolbar():
    return (f'<div class="h-toolbar"><span class="h-filter-chip">{I("home")}Properties : Beautiful Artist Apt. in Neukolln</span>'
            f'<div class="h-input-wrap">{I("search", "h-icon h-icon--24")}<input class="h-input" placeholder="Search..."></div>'
            f'<button class="h-btn h-btn--legacy">Onboarding assistant</button></div>'
            f'<div class="h-filter-row"><span class="h-filter-row__active">{I("dots")}Activated : Yes {I("x")}</span>'
            f'<a class="h-action-green">+ Filter</a><a class="h-action-green">Clear</a></div>')


F = {}
PRICING_TABS = ['Base price', 'Occupancy based', 'Fees', 'Security deposits', 'Taxes']
GX_TABS = ['Messaging rules', 'Review rules', 'Canned responses', 'Custom codes']

# HS-30 · Pricing › Base price
F['pricing-base'] = page('Pricing › Base price (HS-30)', 'pricing', f'''<main class="h-content"><div class="h-content__inner">
{header('Pricing')}{tabs(PRICING_TABS, 'Base price')}
<section class="h-section"><h2 class="h-h3">Base price</h2>
<p class="h-intro" style="margin-top:14px">This is the default nightly rate we'll apply to open calendar dates that dont already have a price set manually or through dynamic pricing. Updating the nightly rate will overwrite the price on Airbnb and stop pulling prices from Airbnb moving forward.</p>
<div class="h-field-row h-field-row--compact" style="margin-top:16px"><div><p class="h-field-row__label h-small">Nightly rate</p><p class="h-field-row__help">This is the nightly rate of the property.</p></div>
<div class="h-input-group"><input class="h-input" value="44"><span class="h-affix h-affix--end">€</span></div></div>
<div class="h-field-row h-field-row--compact" style="margin-top:8px"><div><p class="h-field-row__label h-small">Weekend rate</p><p class="h-field-row__help">This is a custom weekend price for Friday and Saturday nights.</p></div>
<div class="h-input-group"><input class="h-input" value="55"><span class="h-affix h-affix--end">€</span></div></div>
<a class="h-ai-card" href="#" style="margin-top:24px"><div class="h-ai-card__main"><div class="h-ai-card__title">Dynamic Pricing <span class="h-pill h-pill--new">New</span></div>
<div class="h-ai-card__body">Included with Host, Pro and Mogul plans. Smarter pricing that adapts to booking trends, so you don't miss out on revenue.</div></div>{I('chevron-right')}</a>
<h2 class="h-h3" style="margin-top:32px">Listing markups</h2>
<p class="h-small" style="margin:14px 0 0">Set the percentage to add to your nightly rate when updating prices, so you earn the same amount across channels after platform fees.</p>
<div style="display:flex;align-items:center;gap:12px;margin-top:16px"><span class="h-prop-row__thumb" style="width:26px;height:26px"></span><b style="font-weight:600;flex:1">Beautiful Artist Apt. in Neukolln</b>{M('airbnb', 'h-mark h-mark--14')}<div class="h-input-group" style="width:240px;margin-left:12px"><input class="h-input"><span class="h-affix h-affix--end" style="background:var(--color-surface-primary);border:0">%</span></div></div>
</section></div></main>''')

# HS-35 · Pricing › Security deposit
F['security-deposit'] = page('Pricing › Security deposit (HS-35)', 'pricing', f'''<main class="h-content"><div class="h-content__inner">
{header('Pricing')}{tabs(PRICING_TABS, 'Security deposits')}
<section class="h-section"><div class="h-section__head"><h2 class="h-h2">Security deposit</h2><div class="h-section__actions"><button class="h-btn h-btn--secondary">Discard changes</button><button class="h-btn h-btn--primary">Save</button></div></div>
<p class="h-section__desc">Set up a deposit to protect your property from guest damage.</p>
<p style="margin:8px 0 0">Learn more:&nbsp; <a class="h-link">Security deposit overview</a>&nbsp; <a class="h-link">What guests see</a>&nbsp; <a class="h-link">Submitting charge request</a></p>
<h3 class="h-h3" style="margin-top:48px">Who collects the deposit from guests?</h3>
<div class="h-radio-cards" style="margin-top:12px">
<label class="h-radio-card"><input class="h-radio" type="radio" name="d"><div><div class="h-radio-card__title">Hospitable collects and refunds it <span class="h-pill h-pill--lg h-pill--recommended">Recommended</span></div><div class="h-radio-card__desc">We'll automatically charge the guest 2 days before check-in and refund them 2 days after checkout. A 2% fee applies.</div></div></label>
<label class="h-radio-card"><input class="h-radio" type="radio" name="d" checked><div><div class="h-radio-card__title">Host collects it manually</div><div class="h-radio-card__desc">You handle payment and refund off-platform.</div></div></label>
<label class="h-radio-card"><input class="h-radio" type="radio" name="d"><div><div class="h-radio-card__title">Leave my booking unsecured</div></div></label>
</div>
<div class="h-field-row" style="margin-top:48px"><div><p class="h-field-row__label" style="display:flex;gap:8px;align-items:center">{M('airbnb', 'h-mark h-mark--14')} Airbnb deposit</p><p class="h-field-row__help">Shown at checkout. You collect it manually. <a class="h-link h-link--neutral">Learn more</a></p></div>
<div class="h-input-group"><span class="h-affix h-affix--start">€</span><input class="h-input" placeholder="0"></div></div>
</section></div></main>''')

# HS-48 · Guest experience › Messaging rules
ROWS = [('New request to book', 'New request to book'), ('New reservation', 'New reservation'),
        ('First morning', '18 hours after check-in'), ('Check-out instructions', '18 hours before check-out'),
        ('Review request', '3 days after check-out')]
PLAT = f'<span class="h-marks">{M("hospitable")}{M("airbnb")}{M("vrbo")}{M("booking")}{M("agoda", "h-mark is-inactive")}</span>'
trs = ''.join(f'<tr><td><span class="h-badge-scoped">Scoped</span></td><td class="h-table__name">{a}</td><td>{b}</td>'
              f'<td><span class="h-badge-count">All</span></td><td><span class="h-badge-count">All</span></td><td>{PLAT}</td></tr>'
              for a, b in ROWS)
F['messaging-rules'] = page('Guest experience › Messaging rules (HS-48)', 'guest', f'''<main class="h-content"><div class="h-content__inner">
{header('Guest experience')}{tabs(GX_TABS, 'Messaging rules')}
{toolbar()}
<table class="h-table" style="margin-top:30px"><thead><tr><th style="width:98px">Status</th><th style="width:224px">Rule name</th><th style="width:224px">Sending time</th><th style="width:138px">Hosts</th><th style="width:138px">Properties</th><th>Platforms</th></tr></thead>
<tbody>{trs}</tbody></table></div></main>''')

# HS-49 · Review rules, empty
F['empty-review-rules'] = page('Guest experience › Review rules, empty (HS-49)', 'guest', f'''<main class="h-content"><div class="h-content__inner">
{header('Guest experience')}{tabs(GX_TABS, 'Review rules')}
{toolbar()}
<div class="h-empty" style="margin-top:28px"><h3 class="h-empty__title" style="color:var(--color-ai-title)">No review rules found</h3><p class="h-empty__body">There are no review rules scoped for this property yet but don't worry.<br>You can manually select from existing review rules you want to add.</p><button class="h-btn h-btn--legacy">Onboarding assistant</button></div>
</div></main>''')

# HS-16 · Properties › All (segment sub-nav instead of the property rail)
links = ''.join(f'<a href="#">{I(i, "h-icon h-icon--16")}{t}</a>' for i, t in [
    ('book', 'Merge listings into properties'), ('book', 'List properties on Google'),
    ('book', 'Configure parent-child properties'), ('bulb', 'Take an interactive tour')])
F['properties-all'] = page('Properties › All (HS-16)', None, f'''<nav class="h-segnav" aria-label="Segments"><div class="h-segnav__title">Properties {I('settings')}</div>
<a class="h-segnav__item" href="#">New properties</a><a class="h-segnav__item" href="#">Draft properties</a><a class="h-segnav__item" href="#">Muted properties</a>
<div class="h-segnav__group">Room types</div>
<a class="h-segnav__item" href="#" aria-current="page">All</a><a class="h-segnav__item" href="#">Entire home</a><a class="h-segnav__item" href="#">Shared room</a><a class="h-segnav__item" href="#">Private room</a>
<div class="h-segnav__group">{I('tag')}Tag</div></nav>
<main class="h-content"><div class="h-content__inner">
<h1 class="h-h1" style="margin-top:-16px">All</h1>
<p class="h-intro" style="margin-top:12px">Group identical listings into a property on Hospitable by merging them, or configure parent-child relationships between your properties. Use these features to easily manage your availability calendar and pricing across connected booking platforms.</p>
<div class="h-helplinks h-intro--rule" style="margin-top:8px">{links}</div>
<div style="margin-top:20px"><a class="h-action-green" style="margin-left:6px">+ Filter</a></div>
<div class="h-input-wrap" style="margin-top:22px">{I('search', 'h-icon h-icon--24')}<input class="h-input" placeholder="Property or listing name"></div>
<div class="h-prop-row is-inactive" style="margin-top:14px"><input class="h-checkbox" type="checkbox" checked><span class="h-prop-row__thumb"></span><div class="h-prop-row__main"><div class="h-prop-row__title">Beautiful Artist Apt. in Neukolln <span class="h-pill h-pill--unlisted">Unlisted</span></div><div class="h-prop-row__meta">1 listing</div></div>
<span class="h-marks">{M("hospitable", "h-mark is-inactive")}{M("airbnb")}{M("vrbo", "h-mark is-inactive")}{M("booking", "h-mark is-inactive")}{M("agoda", "h-mark is-inactive")}</span></div>
</div>
<div class="h-selection-bar" style="position:absolute;left:118px;bottom:40px"><span class="h-selection-bar__count">1 property selected {I('chevron-down', 'h-icon h-icon--16')}</span><button class="h-btn h-btn--secondary">Clear</button></div>
</main>''', app_style=' style="grid-template-columns:var(--sidebar-width) var(--subnav-width) minmax(0,1fr)"')

# HS-57 · Knowledge Hub with the "New knowledge" modal open
kh_rows = ''.join(f'<div class="h-kh-row"><div>{t}<div class="h-kh-row__src">Sources (1)</div></div>'
                  f'<span class="h-kh-row__date">September 29, 2026</span>{I("dots")}</div>'
                  for t in ['Carbon monoxide detector', 'Dishwasher', 'Essentials (towels, bed sheets, etc.)', 'Hangers', 'Heating'])
F['knowledge-modal'] = page('Knowledge Hub › New knowledge (HS-57)', 'knowledge', f'''<main class="h-content"><div class="h-content__inner">
{header('Knowledge Hub')}
<p class="h-intro" style="margin-top:40px">Information in the Knowledge Hub makes your AI smarter. You can enhance it further by importing a guidebook with additional information, such as: rules and policies, operating instructions, local area and restaurant recommendations, and safety and emergency notes.</p>
<div style="border-top:1px solid var(--color-border-card);margin-top:16px;padding-top:16px">
<div class="h-accordion"><button class="h-accordion__head">{I('help-circle')}Ask the AI{I('chevron-down', 'h-icon h-accordion__chev')}</button></div>
<div class="h-accordion"><button class="h-accordion__head">{I('message-circle')}Sources (1){I('chevron-down', 'h-icon h-accordion__chev')}</button></div></div>
<div style="display:flex;align-items:center;gap:8px;margin-top:32px"><h3 class="h-h4" style="color:var(--color-ai-title);flex:1">Knowledge for this property</h3><div class="h-input-wrap" style="width:278px">{I('search', 'h-icon h-icon--24')}<input class="h-input" placeholder="Search knowledge..."></div><button class="h-btn h-btn--secondary">Give feedback</button><button class="h-btn h-btn--legacy">Add new item</button></div>
<div style="margin-top:4px;border-top:1px solid var(--color-border-divider)"><div class="h-kh-group">Amenities {I('chevron-up', 'h-icon h-icon--16')}</div>{kh_rows}</div>
</div></main>''', outside=f'''
<div class="h-scrim" style="animation:none"><div class="h-modal" role="dialog" aria-labelledby="nk" style="animation:none">
<h2 class="h-modal__title" id="nk">New knowledge</h2><button class="h-btn-icon h-modal__close" aria-label="Close">{I('x', 'h-icon h-icon--24')}</button>
<div style="display:flex;gap:12px;align-items:center"><div class="h-select-wrap" style="width:300px"><button class="h-select" style="border-color:var(--color-gray-400);box-shadow:0 0 0 2px var(--color-gray-200)">Amenities</button>{I('chevron-down', 'h-icon h-icon--24')}</div><a class="h-action-green">+ Add topic</a></div>
<div style="position:relative"><textarea class="h-textarea" style="margin-top:32px;height:96px" aria-label="Knowledge"></textarea>
<ul class="h-menu" role="listbox" style="position:absolute;left:0;top:-36px;width:300px;animation:none">
<li class="h-menu__item" aria-selected="true">Amenities</li><li class="h-menu__item">Arrival</li><li class="h-menu__item">Cleaning &amp; Maintenance</li><li class="h-menu__item">Contact Details</li><li class="h-menu__item">Departure</li><li class="h-menu__item">Rules &amp; Regulations</li></ul></div>
<div class="h-modal__foot"><button class="h-btn h-btn--secondary" disabled style="height:44px;width:150px;font-size:var(--text-md)">Save changes</button></div>
</div></div>''')

# HS-01 · Onboarding, property count (no app shell)
stats = ''.join(f'<div class="h-stat"><span class="h-stat__icon">{I(i)}</span><div><div class="h-stat__value">{v}</div><div class="h-stat__label">{l}</div></div></div>'
                for i, v, l in [('user', '24,000+', 'Hosts like you trust Hospitable'),
                                ('sparkles', '55,000+', 'AI-crafted replies sent every day'),
                                ('coin', '$19.5+ Million', 'In booking income processed daily')])
tiles = ''.join(f'<button class="h-choice-tile">{t}</button>' for t in ['1 - 2', '3 - 10', '11 - 24', '25+', "I don't manage a property yet"])
F['onboarding-count'] = f'''<!doctype html><html lang="en"><head><title>Fidelity · Onboarding · property count (HS-01)</title>
<!--#include _head.html--></head>
<body class="h-root"><div class="frame">
<div class="h-onboarding">
 <aside class="h-onboarding__aside">
  <span class="h-logo" style="color:var(--color-grape-darker);font-size:22px"><span data-hmark style="display:inline-flex;width:18px;height:22px;color:var(--color-channel-direct)"></span>hospitable</span>
  <p class="h-onboarding__tagline" style="margin-top:18px">Put your short-term<br>rental on autopilot.</p>
  {stats}
  <div class="h-testimonial"><span class="h-avatar h-avatar--24"></span><p style="margin:12px 0 0">"I don't think you could even calculate the time Hospitable would save us in a week, to be honest."</p><div class="h-testimonial__who">Tammy and Jade at Ready Set Stay</div><div class="h-muted">Melbourne, Australia</div></div>
 </aside>
 <section class="h-onboarding__card">
  <div class="h-onboarding__body"><div class="h-onboarding__q">
   <h1 class="h-h2">How many properties do you manage?</h1>
   <p class="h-small h-muted" style="margin:8px 0 0">We'll tailor your setup based on your answer.</p>
   <div class="h-choice-tiles" style="margin-top:36px">{tiles}</div>
  </div></div>
  <div class="h-progress h-progress--onboarding" style="--value:16.6%"><div class="h-progress__bar"></div></div>
  <div class="h-onboarding__foot h-onboarding__foot--end"><button class="h-btn h-btn--primary h-btn--lg">Continue</button></div>
 </section>
</div>
</div></body></html>
'''

for name, html in F.items():
    open(os.path.join(OUT, name + '.html'), 'w').write(html)
print(', '.join(F))
