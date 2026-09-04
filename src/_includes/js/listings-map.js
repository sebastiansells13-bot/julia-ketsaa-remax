// "All Listings" map on the /listings/ page — one pin per listing that has
// `lat`/`lng` set, each with a popup linking to that listing's own page.
// Built on Leaflet + OpenStreetMap tiles (loaded only on this page — see
// base.njk), the same free, no-API-key approach Julia's broker site
// (BoldTrail) uses for its own map search. A listing with no coordinates
// simply gets no pin — no guessed or fake placement.
(function () {
  const mapEl = document.getElementById("listings-map");
  if (!mapEl || typeof L === "undefined") return;

  const dataEl = document.getElementById("listings-data");
  if (!dataEl) return;

  let listings;
  try {
    listings = JSON.parse(dataEl.textContent);
  } catch (err) {
    return;
  }

  const geocoded = listings.filter(function (l) {
    return typeof l.lat === "number" && typeof l.lng === "number";
  });

  if (!geocoded.length) {
    mapEl.hidden = true;
    return;
  }

  // Small, self-contained translation lookup (same #i18n-data island and
  // localStorage key as i18n.js) — this file builds its own markup at
  // runtime, so it can't rely on that script's [data-i18n] pass.
  let i18nDict = {};
  const i18nDataEl = document.getElementById("i18n-data");
  if (i18nDataEl) {
    try {
      i18nDict = JSON.parse(i18nDataEl.textContent);
    } catch (err) {
      i18nDict = {};
    }
  }
  function currentLang() {
    try {
      return localStorage.getItem("lang") === "es" ? "es" : "en";
    } catch (err) {
      return "en";
    }
  }
  function t(key, lang) {
    const entry = i18nDict[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  }

  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markers = {};
  const bounds = [];

  function popupHtml(listing, lang) {
    const href = (window.SITE_BASE || "") + "/listings/" + listing.slug + "/";
    const statusKey = "status." + listing.status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (
      "<strong>" + listing.address + "</strong><br>" +
      listing.price + " · " + t(statusKey, lang) + "<br>" +
      '<a href="' + href + '">' + t("listingdetail.viewListing", lang) + "</a>"
    );
  }

  geocoded.forEach(function (listing) {
    const marker = L.marker([listing.lat, listing.lng]);
    marker.bindPopup(popupHtml(listing, currentLang()));
    marker.addTo(map);
    markers[listing.slug] = marker;
    bounds.push([listing.lat, listing.lng]);
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  } else {
    map.setView(bounds[0], 14);
  }

  // Keep pins in sync with the list's own filters (search/status/beds/
  // baths/tabs/saved-only) — listings-filter.js dispatches this after every
  // filter pass, so the map never shows a listing the list has hidden.
  window.addEventListener("listings:filtered", function (event) {
    const visibleSlugs = event.detail || [];
    Object.keys(markers).forEach(function (slug) {
      const marker = markers[slug];
      const shouldShow = visibleSlugs.indexOf(slug) !== -1;
      const isShown = map.hasLayer(marker);
      if (shouldShow && !isShown) marker.addTo(map);
      if (!shouldShow && isShown) map.removeLayer(marker);
    });
  });

  // Re-render popup text (address/price are unaffected — only the status
  // word and the link label are ever translated) when the language toggle
  // switches, so a popup opened after that shows the right language.
  window.addEventListener("lang:changed", function (event) {
    const lang = event.detail === "es" ? "es" : "en";
    geocoded.forEach(function (listing) {
      const marker = markers[listing.slug];
      if (marker) marker.setPopupContent(popupHtml(listing, lang));
    });
  });
})();
