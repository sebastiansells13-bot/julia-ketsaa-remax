// Tracks recently-viewed listings in localStorage (most-recent-first, capped)
// and renders a compact strip of them on the Listings page. Purely
// client-side, same as saved-listings.js.
(function () {
  const STORAGE_KEY = "julia-ketsaa-remax:recently-viewed";
  const MAX_ENTRIES = 6;

  function readViewed() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeViewed(slugs) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch (err) {
      // Storage unavailable — recently-viewed just won't persist.
    }
  }

  // On a listing's own detail page: record it as viewed.
  const detailEl = document.querySelector(".listing-detail[data-listing-slug]");
  if (detailEl) {
    const slug = detailEl.dataset.listingSlug;
    if (slug) {
      const viewed = readViewed().filter(function (s) {
        return s !== slug;
      });
      viewed.unshift(slug);
      writeViewed(viewed.slice(0, MAX_ENTRIES));
    }
  }

  // On the Listings page: render a strip of them, if any.
  const strip = document.getElementById("recently-viewed");
  if (!strip) return;

  const dataEl = document.getElementById("listings-data");
  if (!dataEl) return;

  let allListings;
  try {
    allListings = JSON.parse(dataEl.textContent);
  } catch (err) {
    return;
  }

  const viewedSlugs = readViewed();
  const viewedListings = viewedSlugs
    .map(function (slug) {
      return allListings.find(function (item) {
        return item.slug === slug;
      });
    })
    .filter(Boolean);

  if (!viewedListings.length) return;

  const list = strip.querySelector("ul");
  viewedListings.forEach(function (item) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = (window.SITE_BASE || "") + "/listings/" + item.slug + "/";
    a.innerHTML =
      '<span class="recently-viewed__address">' +
      item.address +
      '</span><span class="recently-viewed__price">' +
      item.price +
      "</span>";
    li.appendChild(a);
    list.appendChild(li);
  });

  strip.hidden = false;
})();
