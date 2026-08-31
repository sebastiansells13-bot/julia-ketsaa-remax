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

## Listings: 4 samples, clearly marked — testimonials still empty

`src/_data/listings.json` ships with 4 example properties so the listings
feature (click a card → full detail page with photo, stats, description,
features) has something to show and can be reviewed before real listings
exist. Every one of them:

- Has `isSample: true`, which renders a visible **"Sample"** badge on the
  card and a banner on its detail page ("This is a sample listing for
  demonstration — not a real property for sale.")
- Uses an illustrated placeholder instead of a real photo (`image` is left
  blank), so it can never be mistaken for an actual photographed house
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

## Newsletter signup

The footer includes a working, validated email signup form. It is **not**
connected to a live email service yet — that requires an account (Mailchimp,
ConvertKit, Formspree, etc.) only Julia can create. Until it's connected, the
form honestly tells visitors signups aren't live yet instead of silently
discarding their email address. See the comment at the top of
`src/_includes/js/newsletter.js` for the one-line change needed to go live
once an account exists.

## CMS

This site uses [Pages CMS](https://pagescms.org) (`.pages.yml`) — a free,
GitHub-authenticated web CMS that edits the site's content files directly in
this repo, no separate hosting or database. Julia (or anyone given repo
access) can log in at https://app.pagescms.org, connect this repo, and edit:

- **Agent & Business Info** — name, title, phone numbers, email, address,
  license text, bio, disclaimer, agent photo, social links
- **Listings** — add/edit/remove property listings
- **Testimonials** — add/edit/remove client quotes
- **How I Can Help** — the services list
- **Blog Posts** — market updates, tips, announcements

Every CMS save commits directly to this repo and triggers a new deploy
automatically. See [CMS-GUIDE.md](CMS-GUIDE.md) for a walkthrough.

## Agent photo

`business.photo` is currently empty — the About page renders without a
photo until Julia sends a real headshot. Add it via the CMS, or drop a file
in `src/_includes/img/agent/` and set the `photo` field in
`src/_data/business.json` to match.

## Local development

```bash
npm install
npm start
```

## Deploy

Pushing to `main` runs `.github/workflows/build-deploy.yml`, which builds
the site and deploys it to GitHub Pages automatically.
