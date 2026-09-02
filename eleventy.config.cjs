const { DateTime } = require("luxon");
const { createHash } = require("node:crypto");
const { readFileSync, existsSync } = require("node:fs");
const pluginRss = require("@11ty/eleventy-plugin-rss").default;
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

const isProduction = process.env.ELEVENTY_ENV === "production";
const outputDirectory = isProduction ? "docs" : "dev";

// Content-address an asset so production caching can be immutable and
// far-future without ever serving a stale file after a deploy.
function contentHash(filePath) {
  if (!existsSync(filePath)) return "dev";
  return createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 12);
}

const assetFiles = {
  stylesheet: "src/_includes/css/index.css",
};
const assetPaths = {
  stylesheet: `/assets/css/index.${contentHash(assetFiles.stylesheet)}.css`,
};

// Absolute site origin + pathPrefix, with no trailing slash — used to build
// absolute URLs (canonical links, Open Graph/Twitter tags, JSON-LD) that
// can't rely on html-base-plugin's automatic root-relative rewriting.
// Update this alongside `pathPrefix` below once Julia has a real domain.
const siteUrl = "https://sebastiansells13-bot.github.io/julia-ketsaa-remax";
// Same value as the `pathPrefix` returned below (no trailing slash) —
// exposed as global data so base.njk can hand it to client-side scripts as
// `window.SITE_BASE`. JS-constructed URLs (recently-viewed, compare) build
// links from data read out of localStorage at runtime, so they can't rely
// on html-base-plugin's build-time rewriting the way server-rendered hrefs
// do — they need this to prefix their own links correctly.
const sitePathPrefix = "/julia-ketsaa-remax";

// Shared with the "slugify" template filter below — pulled out to a plain
// function so listingsWithSlugs (also below) can reuse the exact same
// logic when precomputing slugs for the client-side JSON data island,
// instead of a second implementation drifting out of sync in JS.
function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginNavigation);
  // Note: @quasibit/eleventy-plugin-sitemap builds <loc> via `new URL(page.url,
  // hostname)`, which drops any path segment in `hostname` (root-relative
  // page.url resolves against the origin only) — fine once this site is on
  // its own domain, but wrong while it's parked at a GitHub Pages project
  // URL. See src/sitemap.xml.njk, which builds the sitemap manually instead
  // of using this plugin's hostname, for that reason.
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://sebastiansells13-bot.github.io",
    },
  });

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.ignores.add("**/.DS_Store");
  eleventyConfig.watchIgnores.add("**/.DS_Store");
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addGlobalData("assetPaths", assetPaths);
  eleventyConfig.addGlobalData("siteUrl", siteUrl);
  eleventyConfig.addGlobalData("sitePathPrefix", sitePathPrefix);

  eleventyConfig.addLayoutAlias("page", "layouts/page.njk");
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy")
  );

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter("htmlDateString", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd")
  );

  eleventyConfig.addFilter("head", (array, n) => {
    if (n < 0) return array.slice(n);
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("slugify", slugify);

  // During `npm start`, serve source images directly instead of copying
  // them into `dev/` on every rebuild. Production media is optimized by
  // the CI pipeline (scripts/optimize-media.mjs) after Eleventy runs.
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy({ "src/_includes/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/_includes/js": "js" });
  eleventyConfig.addPassthroughCopy({
    [assetFiles.stylesheet]: assetPaths.stylesheet.slice(1),
  });
  eleventyConfig.addPassthroughCopy({ "src/_includes/favicons": "favicons" });
  eleventyConfig.addPassthroughCopy(".nojekyll");
  // No CNAME yet — this deploys to the GitHub Pages project URL until Julia
  // has a real domain. Once she does: add a CNAME file with that domain,
  // pass it through here, and flip pathPrefix (below) to "/".

  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({ class: "direct-link", symbol: "#" }),
  });
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Renders business.json as a schema.org RealEstateAgent JSON-LD block.
  // Missing/empty fields are dropped automatically by JSON.stringify.
  eleventyConfig.addFilter("businessSchema", (business, absoluteSiteUrl) => {
    const sameAs = Object.values(business.social || {}).filter(Boolean);
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: business.name,
      jobTitle: business.title,
      description: business.tagline,
      url: `${absoluteSiteUrl}/`,
      image: business.photo ? `${absoluteSiteUrl}${business.photo}` : undefined,
      telephone: business.phoneCell,
      email: business.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.streetAddress,
        addressLocality: business.addressLocality,
        addressRegion: business.addressRegion,
        postalCode: business.postalCode,
        addressCountry: "US",
      },
    };
    if (sameAs.length) schema.sameAs = sameAs;
    return JSON.stringify(schema, null, 2);
  });

  // Renders a single listing as a schema.org RealEstateListing JSON-LD
  // block. Only matters once real (indexable) listings exist — sample
  // listings carry noindex, so crawlers skip these pages entirely anyway.
  eleventyConfig.addFilter("listingSchema", (listing, absoluteSiteUrl, slug) => {
    const priceNumber = parseFloat(String(listing.price || "").replace(/[^0-9.]/g, "")) || undefined;
    const availabilityByStatus = {
      "For Sale": "https://schema.org/InStock",
      Pending: "https://schema.org/LimitedAvailability",
      Sold: "https://schema.org/SoldOut",
    };
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: [listing.address, listing.location].filter(Boolean).join(", "),
      description: listing.blurb,
      url: `${absoluteSiteUrl}/listings/${slug}/`,
      about: {
        "@type": "SingleFamilyResidence",
        name: listing.address,
        address: {
          "@type": "PostalAddress",
          streetAddress: listing.address,
          addressLocality: listing.location,
        },
        numberOfBedrooms: listing.beds,
        numberOfBathroomsTotal: listing.baths,
        floorSize: listing.sqft
          ? { "@type": "QuantitativeValue", value: listing.sqft, unitCode: "FTK" }
          : undefined,
      },
      offers: priceNumber
        ? {
            "@type": "Offer",
            price: priceNumber,
            priceCurrency: "USD",
            availability: availabilityByStatus[listing.status],
          }
        : undefined,
    };
    return JSON.stringify(schema, null, 2);
  });

  // Listings, each with a precomputed `slug` — dumped as a JSON data island
  // (see base.njk) so client-side scripts (recently-viewed, compare) can
  // look up full listing details for a slug read out of localStorage
  // without re-deriving the slug themselves.
  eleventyConfig.addFilter("listingsWithSlugs", (list) =>
    (list || []).map((item) => ({ ...item, slug: slugify(item.address) }))
  );

  // Renders a list of {question, answer} pairs as a schema.org FAQPage
  // JSON-LD block (src/faq.njk).
  eleventyConfig.addFilter("faqSchema", (faqs, absoluteSiteUrl) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      url: `${absoluteSiteUrl}/faq/`,
      mainEntity: (faqs || []).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    return JSON.stringify(schema, null, 2);
  });

  // Combines a listing's cover photo (`image`) with any additional gallery
  // photos (`images`) into one ordered, empty-filtered list for the detail
  // page gallery. Stays empty for every sample listing (no `image`/`images`
  // set), which correctly falls back to the illustrated placeholder.
  eleventyConfig.addFilter("galleryImages", (listing) => {
    const images = [listing && listing.image, ...((listing && listing.images) || [])];
    return images.filter(Boolean);
  });

  // Normalizes a YouTube or Vimeo URL (whatever format an agent is likely
  // to paste — watch?v=, youtu.be, a plain vimeo.com link) into its
  // embeddable iframe-src form. Passes unrecognized-but-plausible URLs
  // through as a best effort; returns null for anything unparseable so the
  // template can skip rendering rather than embed a broken iframe.
  eleventyConfig.addFilter("embedVideoUrl", (url) => {
    if (!url) return null;
    let parsed;
    try {
      parsed = new URL(url);
    } catch (err) {
      return null;
    }
    const host = parsed.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com") return url;
    return url;
  });

  // Renders a list of {name, url} crumbs as a schema.org BreadcrumbList
  // JSON-LD block (src/listing-detail.njk).
  eleventyConfig.addFilter("breadcrumbSchema", (crumbs, absoluteSiteUrl) => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: (crumbs || []).map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: crumb.url ? `${absoluteSiteUrl}${crumb.url}` : undefined,
      })),
    };
    return JSON.stringify(schema, null, 2);
  });

  return {
    templateFormats: ["md", "njk", "html", "liquid"],
    // GitHub Pages project site (no custom domain yet) serves this at
    // /julia-ketsaa-remax/, so every root-relative href/src needs that
    // prefix. Eleventy's bundled html-base-plugin (registered via the RSS
    // plugin above) rewrites them automatically based on this value. Once
    // Julia has a real domain pointed at this repo (via CNAME), change this
    // to "/" and update the sitemap hostname above to match.
    pathPrefix: `${sitePathPrefix}/`,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: outputDirectory,
    },
  };
};
