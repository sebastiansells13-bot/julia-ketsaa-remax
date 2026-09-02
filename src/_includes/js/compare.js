// Renders the /compare/ page: a side-by-side table of whatever listings
// are currently saved (localStorage, via saved-listings.js), looked up
// from the #listings-data JSON island in base.njk.
(function () {
  const wrap = document.getElementById("compare-table-wrap");
  const emptyState = document.getElementById("compare-empty");
  if (!wrap || !emptyState) return;

  const dataEl = document.getElementById("listings-data");
  if (!dataEl) return;

  let allListings;
  try {
    allListings = JSON.parse(dataEl.textContent);
  } catch (err) {
    return;
  }

  const rows = [
    { label: "Status", get: (l) => l.status },
    { label: "Price", get: (l) => l.price },
    { label: "Beds", get: (l) => l.beds },
    { label: "Baths", get: (l) => l.baths },
    { label: "Sqft", get: (l) => l.sqft },
    { label: "Year Built", get: (l) => l.yearBuilt || "—" },
    { label: "Lot Size", get: (l) => l.lotSize || "—" },
    { label: "Location", get: (l) => l.location },
  ];

  function render() {
    const saved = (window.SavedListings && window.SavedListings.getAll()) || [];
    const listings = saved
      .map(function (slug) {
        return allListings.find(function (item) {
          return item.slug === slug;
        });
      })
      .filter(Boolean);

    if (!listings.length) {
      wrap.hidden = true;
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    wrap.hidden = false;

    const table = document.getElementById("compare-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const headRow = document.createElement("tr");
    headRow.appendChild(document.createElement("th"));
    listings.forEach(function (item) {
      const th = document.createElement("th");
      const a = document.createElement("a");
      a.href = (window.SITE_BASE || "") + "/listings/" + item.slug + "/";
      a.textContent = item.address;
      th.appendChild(a);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "compare-table__remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", function () {
        window.SavedListings.toggle(item.slug);
      });
      th.appendChild(removeBtn);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    rows.forEach(function (row) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = row.label;
      tr.appendChild(th);
      listings.forEach(function (item) {
        const td = document.createElement("td");
        td.textContent = row.get(item);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  render();
  // Removing a listing (here or on any other page) should re-render live.
  window.addEventListener("savedlistings:change", render);
})();
