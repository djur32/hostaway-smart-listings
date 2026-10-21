# Narrative: Smart Listings as a project guide (binding for deck, Notion, README)

## What this is
The guiding document for the Smart Listings project, shared with the product manager, the engineering team, the design lead and the design director. It says what we are trying to achieve, why, how the work is shaped, who decides what, and how we will know it works. It is not a portfolio piece and has no single author.

## Voice
- "We" and "our team". Never "I", "my", "me". No byline, no "my concept", no "I'd".
- Guidance to teams is direct: "Engineering owns the flags and the kill switch." "Product decides the order."
- Design is described in present tense (what the design specifies). Decisions made are past tense ("We chose channel-first navigation because...").
- Keep the RULES in plan/RULES.md (no provenance tags, no em dashes, no Hospitable or Copilot, "Sample data" caption on example numbers, nothing claimed as shipped, measured or researched with real hosts).
- Research and interview material stays framed as premises and a plan, in "we" voice.

## Story spine (every part of the deck and the Notion tree should serve one of these beats)
1. Problem. A host keeps one listing right on every channel by editing each channel by hand. Facts drift, channel rules get broken, nobody sees it until a guest does.
2. Goal. One base of facts, a strategy per channel, tips that explain why, a canvas that shows the real guest page, and measurement. North star: listings with a strategy-aligned field on every active channel.
3. Principles. The rules that settle arguments: one fact stored once, channels may differ on purpose, every tip shows its why, nothing changes without a preview and an undo.
4. What we are building. Information architecture (channel-first), the concept (Hub, Strategy, Tips, Canvas, Performance), the prototype that is the specification.
5. How the teams use it. Product manager: scope, order, acceptance. Engineering: sync model, events, flags, kill switch. Design lead: spec, prototype, design system. Design director: principles, trade-offs, sign-off at each gate. Each team gets a short "what you need from this guide" note.
6. How we measure. The experiment framework and seven experiments, each with a primary metric, guardrails and a ship rule written before launch.
7. Risks, open questions and the next decisions, each with an owner.

## Audience notes
- PM wants scope, sequencing, success metrics, risks.
- Engineering wants the data model, events, flags, rules per channel, what is out of scope.
- Design lead wants the spec, the system, the open design questions.
- Design director wants principles, trade-offs and the decisions needing sign-off.
