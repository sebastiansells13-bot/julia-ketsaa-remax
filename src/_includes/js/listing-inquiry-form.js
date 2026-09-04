// Reveals the "Schedule a Tour" fields inside the combined listing
// inquiry form (components/listing-inquiry-form.njk) when its checkbox
// is checked. The page's "Request a Showing" quick-action link
// (data-reveal-tour) also checks that box and reveals the fields, so a
// visitor who clicks it lands on the same form as "Ask a Question" but
// with the tour fields already open, instead of needing two forms.
(function () {
  const checkbox = document.getElementById("inquiry-wants-tour");
  const tourFields = document.getElementById("inquiry-tour-fields");
  if (!checkbox || !tourFields) return;

  function sync() {
    tourFields.hidden = !checkbox.checked;
  }

  checkbox.addEventListener("change", sync);

  document.querySelectorAll("[data-reveal-tour]").forEach(function (link) {
    link.addEventListener("click", function () {
      checkbox.checked = true;
      sync();
    });
  });

  sync();
})();
