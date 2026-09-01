// Client-side filter + sort for the /listings/ page. All 4 (or however many)
// listings are still server-rendered in the HTML — this just shows/hides and
// reorders them, so it degrades gracefully with JS disabled (everything is
// simply visible, unfiltered, in server order).
(function () {
  const toolbar = document.getElementById("listings-toolbar");
  const grid = document.getElementById("listings-grid");
  if (!toolbar || !grid) return;

  const statusSelect = document.getElementById("filter-status");
  const bedsSelect = document.getElementById("filter-beds");
  const bathsSelect = document.getElementById("filter-baths");
  const sortSelect = document.getElementById("sort-listings");
  const emptyMessage = document.getElementById("listings-empty");

  const cards = Array.from(grid.querySelectorAll(".listing-card"));
  const originalOrder = cards.slice();

  function priceValue(card) {
    return parseInt((card.dataset.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
  }

  // Beds/baths/sqft can be fractional (e.g. 2.5 baths) — parseFloat handles
  // both whole and fractional values.
  function numValue(card, key) {
    return parseFloat(card.dataset[key]) || 0;
  }

  function apply() {
    const status = statusSelect.value;
    const minBeds = parseFloat(bedsSelect.value) || 0;
    const minBaths = parseFloat(bathsSelect.value) || 0;
    const sort = sortSelect.value;

    const visible = cards.filter(function (card) {
      const matchesStatus = status === "all" || card.dataset.status === status;
      const matchesBeds = numValue(card, "beds") >= minBeds;
      const matchesBaths = numValue(card, "baths") >= minBaths;
      return matchesStatus && matchesBeds && matchesBaths;
    });

    let ordered;
    if (sort === "default") {
      ordered = originalOrder.filter(function (card) {
        return visible.indexOf(card) !== -1;
      });
    } else {
      ordered = visible.slice().sort(function (a, b) {
        switch (sort) {
          case "price-asc":
            return priceValue(a) - priceValue(b);
          case "price-desc":
            return priceValue(b) - priceValue(a);
          case "beds-desc":
            return numValue(b, "beds") - numValue(a, "beds");
          case "baths-desc":
            return numValue(b, "baths") - numValue(a, "baths");
          case "sqft-desc":
            return numValue(b, "sqft") - numValue(a, "sqft");
          default:
            return 0;
        }
      });
    }

    cards.forEach(function (card) {
      card.hidden = true;
    });
    ordered.forEach(function (card) {
      card.hidden = false;
      grid.appendChild(card);
    });

    if (emptyMessage) emptyMessage.hidden = ordered.length > 0;
  }

  statusSelect.addEventListener("change", apply);
  bedsSelect.addEventListener("change", apply);
  bathsSelect.addEventListener("change", apply);
  sortSelect.addEventListener("change", apply);
})();
