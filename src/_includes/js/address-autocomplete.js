// Google Places address autocomplete for the "What's My Home Worth?" form's
// Property Address field (src/home-value.njk, [data-address-autocomplete]).
// Only that field uses this — the Listings and 404 search boxes filter
// Julia's own small local listing list by plain substring match, not a real
// address lookup, so a Google-picked formatted address wouldn't reliably
// match any of them.
//
// Does nothing unless window.GOOGLE_MAPS_API_KEY is set to a real key (see
// the comment atop googleMapsApiKey in eleventy.config.cjs) — with no key,
// these fields are just plain text inputs, same as before this script
// existed.
(function () {
  const inputs = document.querySelectorAll("[data-address-autocomplete]");
  const apiKey = window.GOOGLE_MAPS_API_KEY;
  if (!inputs.length || !apiKey) return;

  window.__initAddressAutocomplete = function () {
    // Bias (not restrict) suggestions toward the Las Cruces, NM area.
    const lasCrucesBounds = new google.maps.LatLngBounds(
      { lat: 32.15, lng: -106.95 },
      { lat: 32.5, lng: -106.55 }
    );
    inputs.forEach(function (input) {
      new google.maps.places.Autocomplete(input, {
        types: ["address"],
        bounds: lasCrucesBounds,
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
      });
    });
  };

  const script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=" +
    encodeURIComponent(apiKey) +
    "&libraries=places&loading=async&callback=__initAddressAutocomplete";
  script.async = true;
  document.head.appendChild(script);
})();
