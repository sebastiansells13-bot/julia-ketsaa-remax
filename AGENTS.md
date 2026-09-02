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
  info (`phoneCell`/`phoneOffice`, not a single `phone` field), license text, RE/MAX
  disclaimer, and social links — taken from Julia's actual business card, not an intake
  worksheet placeholder. Reference it in templates rather than hardcoding business details.
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
  `data-not-connected-message`/`data-success-message` + a `[data-lead-form-status]`
  element — see `contact-form.njk` or `home-value.njk` for the pattern. Don't duplicate
  its validate/submit/honesty logic in a new one-off script.
- **Print styles**: `src/_includes/css/print.scss` hides chrome/interactive widgets on
  `listing-detail.njk` for a clean printable flyer. If you rename or add a class there
  (a new interactive block, a new nav item, etc.), update the hide-list in that file too.
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
- Don't claim the newsletter, contact, or Home Value forms are "connected" or remove
  their `data-endpoint`/`data-not-connected-message` checks (`newsletter.js` and the
  shared `lead-form.js`) until a real backend is wired up
- Don't add the official RE/MAX logo graphic without it being supplied directly by
  RE/MAX/the broker — see README.md
- Don't let `README.md`, `AGENTS.md`, or `CMS-GUIDE.md` drift from reality — this repo
  has a history of going several feature commits without a docs update; when you add or
  change a page/feature, update the relevant doc in the same batch of work, not later
