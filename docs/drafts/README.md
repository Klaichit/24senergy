# Drafts

Work shown to DK for a decision, kept out of `public/` so `sync:public` does
not mirror it and Next never serves it. Nothing here is live.

## hero-draft.html

A full copy of `public/index.html` with the hero rebuilt in the style of the
Frezze reference DK sent (2026-09-23). Open it with a static server from this
folder — it expects `01.webp`–`04.webp`, `24sEnergy_png.png`, `site.js` and
`site.css` beside it, so copy them from `public/` first:

    cp public/*.webp public/24sEnergy_png.png public/site.js public/site.css docs/drafts/
    python3 -m http.server 8898 -d docs/drafts

What it changes, relative to the live hero:

- the per-slide Supabase heading drops to a small rotating kicker, and the h1
  becomes one fixed brand statement at ~68px, split into two tones
- a three-column fact row with hairline dividers (LFP / IP65-IP66 / 6 brands).
  These are spec facts, not outcome promises — the reference's own
  "Keeps Water Cold for 24H" is exactly the duration claim Claim Guardrails
  forbids
- the CTA moves out of the far corner to sit under the copy, with the carousel
  arrows beside it
- the brand strip moves off its white band and into the bottom of the photo
- a handwritten accent (Charmonman) with a drawn arrow, at DK's request
- a left-to-right scrim, because the copy sits over a bright cabinet on slide 1

Waiting on DK's product photography before any of this moves into
`public/index.html`.
