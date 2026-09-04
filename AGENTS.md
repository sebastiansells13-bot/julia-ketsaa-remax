# AGENTS.md

Instructions for AI coding assistants (Claude Code, Copilot, etc.) working in this repo.
This file describes **this specific client site**, cloned from `client-site-starter`.
Keep it up to date as the site diverges from the template.

## Commands

- **Dev**: `npm start` (runs Sass + Eleventy with hot reload at http://localhost:8080/;
  writes generated pages to `dev/`, serves images/CSS/fonts straight from `src/`, and
  cleans `dev/` and `docs/` on startup and shutdown)
- **Build**: `npm run build` (cleans output, compiles Sass, builds the Eleventy site with
  original, unoptimized media into `docs/`)
- **CI build**: `npm run build:ci` (GitHub Actions only — runs `npm run build`, then
  optimizes referenced images with `scripts/optimize-media.mjs`)

## Architecture

- **SSG**: Eleventy (11ty) v3, static output, no server runtime
- **Input**: `src/` — Markdown and Nunjucks (`.njk`) templates
- **Dev output**: `dev/` (generated pages only; removed when `npm start` stops)
- **Production output**: `docs/` (generated, not committed; built in CI, deployed via
  GitHub Actions to GitHub Pages)
- **Templates**: Nunjucks for layouts and pages; Markdown for blog posts
- **Styling**: Sass, compiled from `src/_includes/css/index.scss` to a content-hashed,
  cache-busted `index.<hash>.css` (see `assetPaths` in `eleventy.config.cjs`)
- **Content editing**: Pages CMS (`.pages.yml`) — the client edits structured content
  (posts, listings, services, testimonials, business info) through a GitHub-authenticated
  web UI with no code exposure. See `CMS-GUIDE.md` for the client-facing walkthrough.
  The FAQ, mortgage calculator defaults, and Home Value/Privacy page copy are template
  content, not CMS-managed — editing those needs a code change.
- **Data**: `src/_data/business.json` holds the agent's real name, brokerage, contact
  info (`phoneCell`/`phoneOffice`, not a single `phone` field), license text and number
  (`license`/`licenseNumber`), RE/MAX disclaimer, and social links — taken from Julia's
  actual business card and her RE/MAX Classic Realty broker profile, not an intake
  worksheet placeholder. Reference it in templates rather than hardcoding business details.
  `src/_data/i18n.json` holds the English/Spanish dictionary for the language toggle —
  see the "Language toggle" bullet below.
- **Eleventy filters** (all in `eleventy.config.cjs`): `slugify`, `listingsWithSlugs`
  (adds a precomputed `slug` to each listing, used by the `#listings-data` JSON island
  in `base.njk`), `galleryImages` (combines a listing's cover `image` + `images` into
  one gallery array), `embedVideoUrl` (normalizes a YouTube/Vimeo URL to an embed src),
  `businessSchema`/`listingSchema`/`faqSchema`/`breadcrumbSchema` (JSON-LD builders).
- **Client-side scripts needing the pathPrefix**: any script that builds a link at
  runtime (recently-viewed.js, compare.js) can't rely on html-base-plugin's build-time
  href rewriting — it isn't HTML the plugin ever sees. Use `window.SITE_BASE` (set
  inline in `base.njk` from the `sitePathPrefix` global) to prefix those links. Getting
  this wrong silently double- or zero-prefixes the link; it's bitten this project before.
- **Lead-capture forms**: any form collecting visitor contact info uses the shared
  `src/_includes/js/lead-form.js` handler via `data-lead-form` + `data-endpoint` +
  `data-not-connected-key`/`data-success-key` (i18n.json keys, looked up through
  `window.t()` so the message respects the language toggle — `data-message-vars` for
  a `{name}`-style substitution) + a `[data-lead-form-status]` element — see
  `contact-form.njk` or `home-value.njk` for the pattern. Don't duplicate its
  validate/submit/honesty logic in a new one-off script, and don't hardcode an English
  message string into a form's markup — add a dictionary key instead (see README.md's
  "How the language toggle works").
- **Print styles**: `src/_includes/css/print.scss` hides chrome/interactive widgets on
  `listing-detail.njk` for a clean printable flyer. If you rename or add a class there
  (a new interactive block, a new nav item, etc.), update the hide-list in that file too.
- **Address autocomplete**: `src/_includes/js/address-autocomplete.js` wires Google's
  Places Autocomplete onto any `[data-address-autocomplete]` input (currently just the
  Home Value form's address field — see README.md's "Address autocomplete" section for
  why the Listings/404 search boxes don't get it). Reads the key from
  `window.GOOGLE_MAPS_API_KEY`, set in `base.njk` from the `googleMapsApiKey` global data
  (an env var, `GOOGLE_MAPS_API_KEY` — never hardcode a real key into `eleventy.config.cjs`
  or a template). No key, no script load — the field just stays a plain input.
- **Language toggle**: `src/_includes/js/i18n-runtime.js` (loads first; exposes
  `window.t(key, vars)` / `window.i18nLang()` from the `#i18n-data` dictionary island) and
  `src/_includes/js/i18n.js` (loads second; applies `[data-i18n]`/`[data-i18n-placeholder]`/
  `[data-i18n-lang]` to the DOM) power the EN/ES buttons in the header, backed by the flat
  dictionary at `src/_data/i18n.json`. Any script that builds its own markup or messages at
  runtime (`lead-form.js`, `newsletter.js`, `saved-listings.js`, `share-listing.js`,
  `mortgage-calculator.js`, `compare.js`, `listings-map.js`) calls `window.t(...)` rather than
  re-reading the dictionary itself, and listens for the `lang:changed` event (dispatched by
  `i18n.js` on every switch) to re-render if it has something already on screen. The choice
  persists per visitor via `localStorage`. It covers this site's own template chrome and
  every static page (including the full FAQ Q&A and Privacy, both template content Julia
  doesn't edit live) — never CMS-authored content that changes as often as listings/blog
  posts do (blog posts, listing descriptions, services, testimonials). A few `business.json`
  fields she *can* edit live (`tagline`, `bio`, `disclaimer`) get an optional `*Es` sibling
  field instead of a dictionary entry, rendered via `{{ bilingual(en, es) }}`
  (`macros/bilingual.njk`) — see README.md before adding another one. See README.md's "How
  the language toggle works" before adding any new translated string — in particular, never
  put `data-i18n` on an element that also has non-text children (an `<input>`, a nested
  `<span>`), and never put a fixed separator character between two translated tags in a
  template (put it inside whichever language's string needs it — see the comment in
  `src/privacy.njk`'s "Maps and location services" paragraph). Reuse an existing key
  (`nav.home`, `form.email`, `common.julia`, etc.) before adding a new one for the same word.
- **Listing tabs**: `justListed` (boolean) and `openHouse` (string) on a listing power
  the "Just Listed"/"Open Houses" tabs on `/listings/` (`src/_includes/js/listings-filter.js`)
  and the "New" tag / open-house banner on its cards and detail page. Both are manual
  flags, same spirit as `isSample` — nothing expires or clears itself automatically.
- **All-listings map**: `src/_includes/js/listings-map.js` (Leaflet + OpenStreetMap
  tiles, no API key) renders a pin for every listing with `lat`/`lng` set, on
  `/listings/` only — its `<script>`/`<link>` tags are gated behind
  `{% if page.url == "/listings/" %}` in `base.njk` so no other page pays for the
  ~150KB library. It listens for the `listings:filtered` CustomEvent
  (`listings-filter.js` dispatches it at the end of every `apply()`) to keep pins in
  sync with the page's own filters, and for `lang:changed` (`i18n.js` dispatches it
  from `applyAll()`) to re-translate open popups. Adding a new script that filters or
  translates listings should plug into these same two events rather than re-deriving
  visibility or language state on its own.
- **Listing detail layout**: `src/listing-detail.njk` is modeled on a real MLS-style
  listing page (see README.md's "Listing detail page layout" for the reasoning and
  what was deliberately left out). `similarListings` (`eleventy.config.cjs`) picks up
  to 3 other listings for the "Similar Properties" section — it's a plain `.filter`
  + `.slice`, not a real similarity ranking; don't over-engineer it into one without a
  real signal (price/beds/location) to rank on. The "Your Agent" mini-card
  (`components/listing-agent-card.njk`) reuses `business.*` — don't hardcode agent
  details there or anywhere else that could instead reference the data file.
  `.listing-detail` itself uses the site's full `$max-width` (72rem), not a narrower
  reading-width column — matches the wide, low-whitespace layout of the reference MLS
  page this was modeled on. The photo, attributes grid, and Similar Properties grid all
  benefit from that width; the lead-capture form, the agent card, and the quick-action
  buttons cap their own width instead (`.contact-form`'s existing 34rem,
  `.listing-agent-card`'s 26rem, `.listing-detail__quick-action`'s 16rem flex-basis) so
  they don't get stretched into oversized single-column controls. Don't remove those
  per-element caps to "simplify" the CSS — that's what caused the original whitespace
  complaint's opposite failure mode.
- **Combined inquiry/tour form**: `components/listing-inquiry-form.njk` carries both the
  general "Ask Julia" fields and the "Schedule a Tour" fields (Tour Type/Preferred
  Date/Preferred Time) in one `<form>`, kept short by default behind an "I'd also like
  to schedule a tour" checkbox — these used to be two separate forms/sections
  (`listing-inquiry-form.njk` + a since-deleted `tour-form.njk`), merged into one to make
  the page shorter. `src/_includes/js/listing-inquiry-form.js` toggles the tour fields'
  `hidden` state on that checkbox, and also lets any `[data-reveal-tour]` link (the
  page's "Request a Showing" quick-action button) check the box and reveal the fields on
  click. Don't split this back into two forms without also reverting the quick-action
  buttons, which both point at the merged form's single `#ask-about-listing` anchor now.
- **Deployment**: pushes to `main` build the site and deploy to GitHub Pages;
  pull requests run the build to catch errors but do not deploy.

## Code style

- 2-space indentation, LF line endings, trim trailing whitespace, UTF-8 (per `.editorconfig`)
- Template formats: `.md`, `.njk`, `.html`
- Dates: UTC, Luxon filters `readableDate` (display) / `htmlDateString` (machine-readable)
- Passthrough assets live under `src/_includes/{img,favicons}`; don't reference images
  from anywhere else or the build won't copy them
- Don't hardcode content that a non-technical client might want to change — put it in
  `src/_data/` or a Pages CMS collection instead

## Adding a new page

1. Create `src/<page-name>.njk` with front matter `layout: layouts/page.njk`
2. Add it to `src/_data/navigation.json` if it belongs in the nav
3. If the client should be able to edit its content, add a matching entry to `.pages.yml`

## Adding a new content type to the CMS

1. Add a `collection` block to `.pages.yml` (see the `posts` entry as a template)
2. Create the corresponding Nunjucks layout under `src/_includes/layouts/`
3. Add a listing/index template if the content type needs its own index page
4. Document the new field set in `CMS-GUIDE.md` in plain language for the client

## What NOT to do

- Don't commit `dev/` or `docs/` — both are build output
- Don't add a runtime backend/server — this is a static site by design
- Don't remove the `assetPaths` content-hashing — it's what makes the CDN cache safe
  to set far-future/immutable
- Don't remove the Equal Housing Opportunity statement or the "independently owned
  and operated" disclaimer from the footer (`components/footer.njk`) — both are
  standard elements of real-estate marketing; check with Julia's broker before
  touching either
- Don't invent fake testimonials or market stats under Julia's real name.
  `testimonials.json` starts empty on purpose — leave it empty (the homepage
  already skips the section when it's empty) until real ones exist
- `listings.json` ships with 4 example properties, each `isSample: true` with no
  `image` (so they render an illustrated placeholder + a visible "Sample" badge and
  get `noindex`ed — see `src/listing-detail.njk`). Don't strip the `isSample` flag,
  the placeholder fallback, or the noindex logic — a real listing is added by setting
  `isSample: false` and a real `image`, not by editing a sample in place to look real
- Don't claim the newsletter, contact, Home Value, or listing inquiry forms are
  "connected" or remove their `data-endpoint`/`data-not-connected-key` checks
  (`newsletter.js` and the shared `lead-form.js`) until a real backend is wired up
- Don't add the official RE/MAX logo graphic without it being supplied directly by
  RE/MAX/the broker — see README.md
- Don't extend the language toggle to CMS-authored content (blog posts, listing
  descriptions, services, testimonials, FAQ answers) — there's no translation pipeline
  for content that changes as often as those do; it stays in whatever language Julia
  wrote it in, same as any real i18n setup with a single-language content source
- Don't add a fabricated price-history timeline or a "vs. area average" market-stats
  comparison to `listing-detail.njk` — real MLS-style listing pages show these, but
  doing it here without real historical/market data would be exactly the kind of
  invented market stat this file already forbids for testimonials (see above)
- Don't gate this site's listing photos behind a forced signup/login, even though the
  broker-site listing page this layout is modeled on does — every form here is opt-in
- Don't add a full MLS attribute taxonomy (MLS#, county, zip, HOA fee, sewer/heating/
  roof specifics, a fixed amenities checklist) to a listing either — dozens of fields
  Julia would have to hand-enter with no real feed behind them; the free-text
  `features` list is the sustainable equivalent for a solo agent without an MLS feed
- Don't let `README.md`, `AGENTS.md`, or `CMS-GUIDE.md` drift from reality — this repo
  has a history of going several feature commits without a docs update; when you add or
  change a page/feature, update the relevant doc in the same batch of work, not later
