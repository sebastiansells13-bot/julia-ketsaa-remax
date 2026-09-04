// Lightweight English/Spanish toggle for this site's own static chrome and
// marketing pages (nav, footer, forms, About/Contact/Home Value/FAQ/404/Why
// Las Cruces, the Fair Housing and Accessibility pages). Client-side only —
// there's no separate /es/ URL per page, so this doesn't help a Spanish-
// language search show up in Google the way translated pages would; it's a
// visitor-facing convenience toggle, not an SEO strategy.
//
// What it does NOT translate, by design: anything Julia writes herself
// through the CMS (blog posts, listing descriptions, the services list,
// testimonials) — those stay in whatever language she wrote them in, the
// same as any real i18n setup with a single-language content source.
//
// Markup contract:
//   data-i18n="key"            → element's text content is replaced
//   data-i18n-placeholder="key" → element's `placeholder` attribute is replaced
// The dictionary (English + Spanish) is dumped into the page as JSON by
// base.njk (#i18n-data), same pattern as the #listings-data island.
(function () {
  const STORAGE_KEY = "lang";
  const dataEl = document.getElementById("i18n-data");
  if (!dataEl) return;

  let dict;
  try {
    dict = JSON.parse(dataEl.textContent);
  } catch (err) {
    return;
  }

  function currentLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "es" ? "es" : "en";
    } catch (err) {
      return "en";
    }
  }

  function translate(key, lang) {
    const entry = dict[key];
    if (!entry) return null;
    return entry[lang] || entry.en || null;
  }

  function applyTo(el, lang) {
    // Cache the original English copy once, on the element itself, so
    // switching back to English restores exactly what the template
    // rendered — no need to keep a parallel "en" copy in the dictionary
    // for elements where the template text IS the English string.
    if (el.dataset.i18n) {
      if (el.dataset.i18nEnCache === undefined) el.dataset.i18nEnCache = el.textContent;
      const text = lang === "en" ? el.dataset.i18nEnCache : translate(el.dataset.i18n, lang);
      if (text !== null) el.textContent = text;
    }
    if (el.dataset.i18nPlaceholder) {
      if (el.dataset.i18nPlaceholderEnCache === undefined) {
        el.dataset.i18nPlaceholderEnCache = el.getAttribute("placeholder") || "";
      }
      const text =
        lang === "en" ? el.dataset.i18nPlaceholderEnCache : translate(el.dataset.i18nPlaceholder, lang);
      if (text !== null) el.setAttribute("placeholder", text);
    }
  }

  function applyAll(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n], [data-i18n-placeholder]").forEach(function (el) {
      applyTo(el, lang);
    });
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.langToggle === lang));
    });
  }

  function setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
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

  applyAll(currentLang());
})();
