// Lightweight English/Spanish toggle for this site's own static chrome and
// marketing pages (nav, footer, forms, About/Contact/Home Value/FAQ/404/Why
// Las Cruces, the Fair Housing, Accessibility, Compare, and Mortgage
// Calculator pages). Client-side only — there's no separate /es/ URL per
// page, so this doesn't help a Spanish-language search show up in Google
// the way translated pages would; it's a visitor-facing convenience
// toggle, not an SEO strategy.
//
// What it does NOT translate, by design: anything Julia writes herself
// through the CMS (blog posts, listing descriptions, the services list,
// testimonials) — those stay in whatever language she wrote them in, the
// same as any real i18n setup with a single-language content source.
//
// Markup contract:
//   data-i18n="key"             → element's text content is replaced
//   data-i18n-placeholder="key" → element's `placeholder` attribute is replaced
//   data-i18n-lang="en"|"es"    → element is shown only when that's the
//     current language (the other is `hidden`) — for content that comes
//     from business.json rather than the dictionary (bio, tagline,
//     disclaimer): render both language versions server-side as sibling
//     elements (see macros/bilingual.njk) and let this toggle pick one, so
//     a Spanish translation never has to be kept in sync with a separate
//     copy of the English text living in this file.
// Relies on window.t()/window.i18nLang() from i18n-runtime.js, which must
// load before this script (see base.njk) — that file owns parsing the
// #i18n-data dictionary island.
(function () {
  if (typeof window.t !== "function") return;

  function applyTo(el, lang) {
    // Cache the original English copy once, on the element itself, so
    // switching back to English restores exactly what the template
    // rendered — no need to keep a parallel "en" copy in the dictionary
    // for elements where the template text IS the English string.
    if (el.dataset.i18n) {
      if (el.dataset.i18nEnCache === undefined) el.dataset.i18nEnCache = el.textContent;
      el.textContent = lang === "en" ? el.dataset.i18nEnCache : window.t(el.dataset.i18n);
    }
    if (el.dataset.i18nPlaceholder) {
      if (el.dataset.i18nPlaceholderEnCache === undefined) {
        el.dataset.i18nPlaceholderEnCache = el.getAttribute("placeholder") || "";
      }
      el.setAttribute(
        "placeholder",
        lang === "en" ? el.dataset.i18nPlaceholderEnCache : window.t(el.dataset.i18nPlaceholder)
      );
    }
  }

  function applyAll(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n], [data-i18n-placeholder]").forEach(function (el) {
      applyTo(el, lang);
    });
    document.querySelectorAll("[data-i18n-lang]").forEach(function (el) {
      el.hidden = el.dataset.i18nLang !== lang;
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.langToggle === lang));
    });
    // Lets a script that builds its own markup at runtime (e.g.
    // listings-map.js's Leaflet popups, compare.js's table) react to a
    // language switch instead of only ever reading the dictionary once at
    // page load.
    window.dispatchEvent(new CustomEvent("lang:changed", { detail: lang }));
  }

  function setLanguage(lang) {
    try {
      localStorage.setItem("lang", lang);
    } catch (err) {
      // Private browsing / storage blocked — still apply for this page view.
    }
    applyAll(lang);
  }

  document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLanguage(btn.dataset.langToggle);
    });
  });

  applyAll(window.i18nLang());
})();
