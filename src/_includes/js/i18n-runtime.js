// Shared translation helpers for scripts that build their own markup or
// status messages at runtime instead of relying on i18n.js's static
// [data-i18n] pass — lead-form.js, newsletter.js, saved-listings.js,
// share-listing.js, mortgage-calculator.js, compare.js, listings-map.js.
// Must load before all of those (see base.njk) — each one just calls
// window.t(key) / window.i18nLang() and assumes both already exist.
(function () {
  let dict = {};
  const dataEl = document.getElementById("i18n-data");
  if (dataEl) {
    try {
      dict = JSON.parse(dataEl.textContent);
    } catch (err) {
      dict = {};
    }
  }

  function i18nLang() {
    try {
      return localStorage.getItem("lang") === "es" ? "es" : "en";
    } catch (err) {
      return "en";
    }
  }

  // t("form.hello", {name: "Julia"}) looks up the key in the current
  // language (falling back to English, then to the key itself if it's
  // missing entirely) and replaces any {name}-style placeholders.
  function t(key, vars) {
    const entry = dict[key];
    let text = entry ? entry[i18nLang()] || entry.en || key : key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.split("{" + name + "}").join(vars[name]);
      });
    }
    return text;
  }

  window.i18nLang = i18nLang;
  window.t = t;
})();
