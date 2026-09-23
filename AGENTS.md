<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Working on this project

Written after a round of work in which every item below presented as something
else first. Read it before changing anything.

## What the site is

A Thai energy company distributing **battery storage, solar PV and inverters**
for homes, farms and factories. Five static pages in `public/` plus one dynamic
route, backed by Supabase, deployed from `master` to **www.24senergy.co.th**.

Hithium, EV chargers and EMS/monitoring were product lines here and are not any
more. Their rows are `is_published = false` rather than deleted, which is why
`ev` and `ems` are still valid category values.

## Preview with `pnpm dev`, never a static file server

`/products/<slug>`, `/api/leads` and `/admin` are rendered per request. A plain
static server (VS Code Live Server and friends) answers **404** for every
product detail link and silently breaks both forms, while the pages themselves
render — so it reads as missing content rather than a missing backend.

## Asset paths are relative, on purpose

Pages reference `site.js`, `01.webp`, `news/x.webp` — never `/site.js`. An
absolute path only resolves when the server root happens to be the directory
holding the file, and when `/site.js` 404s, `escapeHTML` is undefined and
**every Supabase-backed list on the page dies** with a generic error.

`safeURL` in `public/site.js` resolves against `document.baseURI` for the same
reason. Resolving against `location.origin` throws away the directory. Keep
both as they are.

## Edit `public/`, then run `pnpm sync:public`

The root `*.html` files are a generated mirror for opening the site with a
plain static server. The script copies **the referenced assets as well as the
pages** — a mirror with HTML but no `site.js` is a broken site. `pnpm
check:public` fails on drift; never hand-edit the root copies.

## Never let a catch swallow

`catch(e){}` with no logging is why a 404 on a script looked like a broken
product catalogue for an hour. Every loader logs its cause before showing a
message.

## The catalogue is data, not markup

`public/products.html` renders from the Supabase `products` table. Editing the
HTML changes nothing about which products appear.

**Adding a category means six places** — `inverter` was added to five of them
and the detail page was missed, so SolarEdge rendered a purple page badged
"BESS · Energy Storage":

1. `products_category_check` in Postgres
2. `types/database.ts` → `ProductCategory`
3. `components/admin/ProductForm.tsx` → `CATEGORIES`
4. `lib/lead-validation.ts` → accepted values
5. `public/products.html` → `CAT_CFG`, `ICONS`, filter checkbox, `.dot-*`
6. `app/products/[slug]/page.tsx` → `THEME` **and** `ICON`

## Retired content hides where nobody looks

Removing a product from the visible sections is a fraction of the job. Retired
lines survived in meta and og descriptions, footer link *labels* (the hrefs had
been fixed), hero carousel slides, quote form checkboxes, `next.config.ts`
redirect targets, and `site_config` rows. Sweep the repo **and** the database.

## Claims are constrained

Product copy comes from the Notion **24s Energy — Product Data** board, and
each row carries a `Claim Guardrails` field the site must stay inside:

- **No % savings, payback periods or backup durations** without real site load
  data, and **no manufacturer logos**
- Hedge cycle life and efficiency with "สูงสุด", warranties with
  "ตามเงื่อนไขผู้ผลิต"
- Keep **usable** separate from **nominal** energy
- Attach certifications to the exact unit — UL9540A is the BluePulse cabinet,
  not KSTAR as a brand
- Leapton manufactures in China despite its Japanese head office; AISWEI is not
  SMA; a UL listing does not imply Thai approval

Never invent a fact to fill a gap. Removed from this site already: an invented
byline, view counts, sidebar counts for content that did not exist, pagination
showing eight pages for one page of articles, and KPI figures with no source.
The phone number still reads "อยู่ระหว่างอัปเดต" because there is no real one.

## Images

Google Drive `/view` links can never be an `<img>` source — they are web pages.

Two drop-in conventions, each layering a CSS custom property above a
placeholder so a missing file falls through and a present one covers it:

- `public/news/<dedupe-key>.webp` — the Content Board's own key
- `public/highlights/<category>.webp` — `bess`, `solar`, `inverter`

Both folders have a `README.md` with the exact filenames and framing. Product
and hero images go through `/admin` into Supabase Storage instead.

## One stylesheet, one cascade

Each page carries its whole stylesheet in a single `<style>` block and then
loads `site.css` after it. Nothing is scoped or modular. A rule written later
therefore beats an identical selector written earlier, and that has caused
three separate bugs:

- `.products-grid` was set to two columns inside the 1020px block, which sits
  below the 520px single-column rule, so phones kept two columns and the spec
  numbers clipped.
- The nav's quote button was restyled at the end of `site.css`, which undid the
  520px hide further up the same file and pushed the burger 34px off screen.
- `.reveal` declares `transition: opacity .7s, transform .7s`. The products
  accordion had declared `transition: flex-grow ...` earlier at equal
  specificity, so the shorthand replaced the whole list and `flex-grow` was
  never transitioned at all. The panel jumped 186px to 495px in 90ms.

The third is the dangerous shape: **nothing throws, nothing looks wrong in the
diff, the animation is simply absent.** It was found only by reading
`getComputedStyle(el).transitionProperty` in the browser and seeing
`"opacity, transform"` where `flex-grow` should have been. Guessing from the
symptom would have sent you to tune a duration that was never running.

So:

- A `transition` shorthand replaces the entire list, delay included. Most
  elements here also carry `.reveal`, which sets its own. Scope yours one level
  deeper — `.products-grid .product-card` beats `.reveal` — and restate what
  the other rule was transitioning, or its animation disappears instead.
- Use `transition-delay` as its own declaration when a state needs to wait. A
  later shorthand silently resets it to `0s`.
- Put responsive rules in the file's own `/* Responsive */` section near the
  bottom, not beside the component, so they cannot be outranked.
- **Measure motion, do not watch it.** Record width or height in a
  `requestAnimationFrame` loop inside the page. A round trip through Playwright
  takes longer than the animation and will tell you it finished instantly.

## Thai text has two rules of its own

- **Never put Thai inside a rotated box.** The accordion spine tried a Thai
  sub-label beneath the Latin one and the vowel and tone marks scattered off
  their consonants. Spine labels stay Latin; the Thai name goes in the open
  panel.
- **Letter-spacing is fine at the values this site uses.** A sweep found Thai
  carrying 0.4–1.6px of tracking on every page — footer headings, section tags,
  form block titles — and rendered against untracked copies the marks stay
  attached throughout that range. 2.3px on a 10.5px line did detach them. Treat
  roughly 1.6px as the ceiling rather than avoiding tracking on Thai at all.

## Before you push

Run `pnpm check:public`, `npx tsc --noEmit`, `pnpm lint` and `pnpm test`.

**Drive the page, do not just read the diff.** The loop used throughout:
serve `public/` *and* the repo root with `python3 -m http.server`, drive with
Playwright (Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`),
stub Supabase with `page.route`, then assert on card counts, computed styles,
404s and `pageerror`. Interactions that looked fine but were broken: the news
category filter matched only `all` and `today`, `products.html#bess` had no
matching anchor, and two elements shared an id.

**`page.route` runs the most recently registered handler first.** Register the
catch-all before the specific route, or the catch-all swallows it. Getting this
backwards has twice produced an empty grid and the false conclusion that the
page was broken.

**Check the latest Vercel deployment before merging to `master`** — it is
production. Builds had been failing at `pnpm install` for a while
(`ERR_PNPM_IGNORED_BUILDS`) because `pnpm-workspace.yaml` held an unfinished
`allowBuilds` scaffold.
