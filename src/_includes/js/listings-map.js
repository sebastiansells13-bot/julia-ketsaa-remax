// "All Listings" map on the /listings/ page — one pin per listing that has
// `lat`/`lng` set, each with a popup linking to that listing's own page.
// Built on Leaflet + OpenStreetMap tiles (loaded only on this page — see
// base.njk), the same free, no-API-key approach Julia's broker site
// (BoldTrail) uses for its own map search. A listing with no coordinates
// simply gets no pin — no guessed or fake placement.
(function () {
  const mapEl = document.getElementById("listings-map");
  if (!mapEl || typeof L === "undefined" || typeof window.t !== "function") return;

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

  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markers = {};
  const bounds = [];

  function popupHtml(listing) {
    const href = (window.SITE_BASE || "") + "/listings/" + listing.slug + "/";
    const statusKey = "status." + listing.status.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (
      "<strong>" + listing.address + "</strong><br>" +
      listing.price + " · " + window.t(statusKey) + "<br>" +
      '<a href="' + href + '">' + window.t("listingdetail.viewListing") + "</a>"
    );
  }

  geocoded.forEach(function (listing) {
    const marker = L.marker([listing.lat, listing.lng]);
    marker.bindPopup(popupHtml(listing));
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
  window.addEventListener("lang:changed", function () {
    geocoded.forEach(function (listing) {
      const marker = markers[listing.slug];
      if (marker) marker.setPopupContent(popupHtml(listing));
    });
  });
})();
