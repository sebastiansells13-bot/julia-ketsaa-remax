# julia-ketsaa-remax

Website for Julia Ketsaa, REALTOR® Associate Broker with RE/MAX Classic Realty
(Las Cruces, NM), built from
[client-site-starter](https://github.com/sebastiansells13-bot/client-site-starter)
and styled after this portfolio's [realty-agent-example](https://github.com/sebastiansells13-bot/realty-agent-example)
mockup.

**Live site:** https://sebastiansells13-bot.github.io/julia-ketsaa-remax/

This is a real client site, not a demo. Every name, phone number, email, and
license number in `src/_data/business.json` was taken from Julia's own RE/MAX
business card. Nothing here is a placeholder.

## RE/MAX branding

This site uses RE/MAX's real brand colors (red `#e4002b`, blue `#003da5`) and
a text-based "RE/MAX" wordmark, not a copy of the official RE/MAX logo
artwork — that logo file is a registered trademark this project has no
license to embed as a graphic. If Julia's broker can provide the official
RE/MAX logo files (balloon mark, approved lockups), swap them in for the
wordmark in `src/_includes/components/header.njk`; RE/MAX's brand guidelines
require any agent use of the mark to follow their official identity
standards, so check with the broker/franchise before substituting anything
that isn't provided directly by RE/MAX.

Two disclosures required on real-estate marketing appear in the site footer
(`src/_includes/components/footer.njk`) on every page:

- **Equal Housing Opportunity** statement + icon (`components/equal-housing-icon.njk`)
- **"Each RE/MAX® office is independently owned and operated."** — the
  standard RE/MAX franchise disclaimer, from `business.disclaimer` in the CMS

Don't remove either without checking with Julia's broker first — both are
standard, typically required elements of real-estate marketing materials.

## What's on the site

**Listings** (`/listings/`) — search, status/beds/baths filters, sort, a
"Saved only" toggle, and a live-updating count/compare link. Each card links
to a full detail page with a photo gallery + lightbox, an optional video
tour embed (YouTube or Vimeo), optional "View on Zillow"/"View on Redfin"
links, breadcrumbs, a "Schedule a Tour" form, an embedded map + directions
link, a mortgage calculator pre-filled with that listing's price, an "Ask
Julia About This Property" inquiry form, and Save/Share buttons.

**Tools reachable from anywhere** — a standalone
[mortgage calculator](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/mortgage-calculator/)
(nav), a [saved-listings compare table](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/compare/)
(shows once 2+ listings are saved), a "recently viewed" strip on the
listings page, and a printable one-page flyer for any listing (browser
print/Ctrl+P — chrome and interactive widgets are hidden via
`src/_includes/css/print.scss`).

**Lead capture** — the general [Contact](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/contact/)
form, the seller-focused [What's My Home Worth?](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/home-value/)
form, the footer newsletter signup, and per-listing "Schedule a Tour" and
"Ask Julia About This Property" forms. All five are fully built and
validated but **not connected to a real backend yet** — see "What isn't
connected yet" below.

**Other pages** — [FAQ](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/faq/)
(generic buying/selling questions, `FAQPage` schema), [Why Live in Las Cruces](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/why-las-cruces/)
(a local-appeal page — climate, affordability, outdoor life, food, and more),
[Privacy Notice](https://sebastiansells13-bot.github.io/julia-ketsaa-remax/privacy/)
(plain-language, accurate to what the site actually does), a rebuilt 404
page (quick links + a listings search box), and a blog with a few generic
buyer/seller-tips posts.

**SEO** — canonical links, Open Graph/Twitter cards, a `RealEstateAgent`
JSON-LD block sitewide, a `RealEstateListing` block per listing, a
`BreadcrumbList` block per listing, and `FAQPage` on the FAQ page.

**Accessibility** — a skip-to-content link, a labeled nav landmark, `alt`
text on real content images, and `loading="lazy"` on below-the-fold images.

## Listings: 4 samples, clearly marked — testimonials still empty

`src/_data/listings.json` ships with 4 example properties so the listings
feature has something to show and can be reviewed before real listings
exist. Every one of them:

- Has `isSample: true`, which renders a visible **"Sample"** badge on the
  card and a banner on its detail page ("This is a sample listing for
  demonstration — not a real property for sale.")
- Uses an illustrated placeholder instead of a real photo (`image` is left
  blank), so it can never be mistaken for an actual photographed house.
  Real photos go in `image` (cover) and optionally `images` (additional
  gallery photos) — see CMS-GUIDE.md.
- Gets `<meta name="robots" content="noindex, nofollow">` and is excluded
  from the sitemap, so none of it turns up in Google

**To add a real listing:** in the CMS, add a new entry, leave "This is a
sample listing" **unchecked**, and upload a real photo — the placeholder
illustration and badge only appear when those are left blank/unchecked.
**To remove the samples:** delete their entries in the CMS or in
`src/_data/listings.json` once real ones exist.

`src/_data/testimonials.json` starts empty — nothing was fabricated under
Julia's real name for reviews, since a fake client quote is a different
order of misleading than a labeled sample listing. Add real ones any time
through the CMS.

## What isn't connected yet

Five forms are fully built and validated, but each shows an honest
on-page message instead of submitting until it's pointed at a real backend:

- **Newsletter** (footer) — see the comment atop `src/_includes/js/newsletter.js`
- **Contact form**, **Home Value form**, and each listing's **Schedule a
  Tour** and **Ask Julia About This Property** forms — all four share
  `src/_includes/js/lead-form.js`; point a form's `data-endpoint` attribute
  (in `contact-form.njk`, `home-value.njk`, `tour-form.njk`, or
  `listing-inquiry-form.njk`) at a real service (Formspree, Netlify Forms,
  etc.) to go live

`src/privacy.njk` describes this accurately today — update it when any of
the above gets connected, or if analytics gets added.

## CMS

This site uses [Pages CMS](https://pagescms.org) (`.pages.yml`) — a free,
GitHub-authenticated web CMS that edits the site's content files directly in
this repo, no separate hosting or database. Julia (or anyone given repo
access) can log in at https://app.pagescms.org, connect this repo, and edit:

- **Agent & Business Info** — name, title, phone numbers, email, address,
  license text, bio, disclaimer, agent photo, social links
- **Listings** — add/edit/remove property listings, including the photo
  gallery and video tour URL
- **Testimonials** — add/edit/remove client quotes
- **How I Can Help** — the services list
- **Blog Posts** — market updates, tips, announcements

**Not CMS-editable** (template/code content — ask the developer to change
these): the FAQ questions/answers, the mortgage calculator's defaults, and
the wording on the Home Value and Privacy pages.

Every CMS save commits directly to this repo and triggers a new deploy
automatically. See [CMS-GUIDE.md](CMS-GUIDE.md) for a walkthrough.

## Agent photo

`business.photo` is currently empty — the About page renders without a
photo until Julia sends a real headshot. Add it via the CMS, or drop a file
in `src/_includes/img/agent/` and set the `photo` field in
`src/_data/business.json` to match.

## Address autocomplete (optional)

The Home Value form's Property Address field can offer Google-style
address suggestions as Julia's client types, via the Google Maps
JavaScript API's Places library (`src/_includes/js/address-autocomplete.js`).
It's off by default — no key, no script load, and the field just behaves
as a plain text input; nothing breaks either way.

To turn it on:

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project (or use an existing one) and enable the **Places API**.
2. Create an API key under **APIs & Services → Credentials**, then
   restrict it (**Application restrictions → Websites**) to this site's
   domain(s) — e.g. `sebastiansells13-bot.github.io/julia-ketsaa-remax/*`,
   plus `localhost/*` if you want to test locally.
3. Add it as a GitHub repository secret named `GOOGLE_MAPS_API_KEY`
   (**Settings → Secrets and variables → Actions → New repository
   secret**) — `.github/workflows/build-deploy.yml` passes it to the build.
4. To test locally: `GOOGLE_MAPS_API_KEY=your-key npm start`

Google's free monthly credit comfortably covers a low-traffic site like
this one, but a billing profile has to be on file with Google regardless.

This is the only address field wired up this way — the Listings and 404
search boxes filter Julia's own small local listing list by plain
substring match, not a real address lookup, so a Google-picked formatted
address wouldn't reliably match any of them.

## Local development

```bash
npm install
npm start
```

## Deploy

Pushing to `main` runs `.github/workflows/build-deploy.yml`, which builds
the site and deploys it to GitHub Pages automatically.
