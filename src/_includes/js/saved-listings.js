// Shared "save a listing" helper. Used by listing cards (Home + Listings
// pages) and each listing's own detail page. Purely client-side — saved
// listings live in this browser's localStorage only, nothing is sent
// anywhere or shared across devices.
(function () {
  const STORAGE_KEY = "julia-ketsaa-remax:saved-listings";

  function readSaved() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeSaved(slugs) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch (err) {
      // Storage unavailable (private mode, disabled, quota) — fail silently,
      // buttons just won't persist state across reloads.
    }
  }

  const SavedListings = {
    getAll: readSaved,
    isSaved: function (slug) {
      return readSaved().indexOf(slug) !== -1;
    },
    toggle: function (slug) {
      const saved = readSaved();
      const index = saved.indexOf(slug);
      if (index === -1) {
        saved.push(slug);
      } else {
        saved.splice(index, 1);
      }
      writeSaved(saved);
      window.dispatchEvent(new CustomEvent("savedlistings:change", { detail: { slugs: saved } }));
      return index === -1; // true if it's now saved
    },
  };
  window.SavedListings = SavedListings;

  function refreshButton(button) {
    const slug = button.dataset.slug;
    const isSaved = SavedListings.isSaved(slug);
    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
    const label = button.dataset.label || "listing";
    button.setAttribute("aria-label", (isSaved ? "Remove " : "Save ") + label + (isSaved ? " from" : " to") + " your saved list");
  }

  function wireButton(button) {
    refreshButton(button);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      SavedListings.toggle(button.dataset.slug);
      refreshButton(button);
    });
  }

  document.querySelectorAll("[data-save-toggle]").forEach(wireButton);

  // Keep every save button on the page in sync if state changes elsewhere
  // (e.g. the "Saved only" filter unsaving something from a filtered list).
  window.addEventListener("savedlistings:change", function () {
    document.querySelectorAll("[data-save-toggle]").forEach(refreshButton);
  });
})();
