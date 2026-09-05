// Small shared helpers a handful of the scripts below all needed their own
// copy of: reading the listings array out of base.njk's #listings-data JSON
// island (compare.js, listings-map.js, recently-viewed.js all did this
// identically), and reading/writing a JSON array in localStorage with the
// same silent-failure behavior (saved-listings.js, recently-viewed.js) —
// private browsing, disabled storage, or a full quota should degrade a
// feature, not throw. No dependency on i18n or anything else here, so this
// loads first.
(function () {
  window.getListingsData = function () {
    var dataEl = document.getElementById("listings-data");
    if (!dataEl) return null;
    try {
      return JSON.parse(dataEl.textContent);
    } catch (err) {
      return null;
    }
  };

  window.readJSONArray = function (key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  };

  window.writeJSONArray = function (key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Storage unavailable (private mode, disabled, quota) — fail
      // silently; callers just won't persist state across reloads.
    }
  };
})();
