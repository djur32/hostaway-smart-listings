# Hostaway duplicate: rules for every agent (Antonio's private parallel project)

Goal: a parallel copy of the Hospitable Smart Listings work, rebranded as Hostaway and written as a confident product project, not a case study.

DO
- Hospitable -> Hostaway everywhere (text, titles, URLs text, alt text). "Hospitable's AI Copilot" -> "Hostaway's AI assistant" (call it "the assistant"; do not invent product names).
- Delete every provenance tag and label: REAL·BRIEF, REAL·PRODUCT, REAL·PUBLIC, SIMULATED, PROJECTED, ASSUMPTION (incl. inline code spans, "(SIMULATED)", "Sample data SIMULATED", Done/Sampled/Planned status lines and the "Icons and status" and provenance-explaining paragraphs). Remove with the words around them so sentences stay clean.
- Drop case-study framing: "case study", "Head of Design", "take-home", "the brief" as an assignment, "Loom", "not recorded yet", "Antonio Silva" and any byline/author name. Write as a product project in first person plural-free voice: first person singular ("I"), past or present tense as the section reads best.
- Hospitable URLs (hospitable-case-*.digimal.studio, deck links) and Website/Mobile prototype links: remove the sentence or link (those sites are not part of this copy).
- Keep structure, headings, tables, mentions and links between Notion pages intact. Smallest edit; no full-page rewrites. Images stay as they are.

DO NOT
- Invent anything new: no new interviews, numbers, quotes, metrics, dates, customer names or outcomes. Where text said simulated/sampled research, keep the same content but phrase neutrally ("hosts I spoke with" is NOT allowed; use "hosts" / "the research" / "in the sample" only if the original said so). Where text said "next / planned / projected", leave it as next steps or expected, worded as plans.
- Do not touch anything outside your assigned pages. Never edit the ORIGINAL Hospitable workspace: only pages under hub 400e18af164580aeb1c1f0393d084a85 (the Hostaway duplicate).
- No em dashes; avoid semicolons; use periods.

Token discipline: fetch a page once, then ONE notion-update-page update_content call with many content_updates (replace_all_matches true for repeated strings). Do not re-fetch to verify unless it returned warnings. Report in <=5 lines: pages done, anything you could not change (e.g. text inside images).
