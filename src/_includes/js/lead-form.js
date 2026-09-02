// Shared handler for every form on the site that collects a visitor's
// contact info (Contact page, "What's My Home Worth?"). Same honest
// "not connected yet" pattern as newsletter.js: fully validated, but each
// form only actually submits once its own `data-endpoint` is filled in
// with a real backend — until then it tells the visitor plainly instead of
// silently discarding what they typed.
//
// Markup contract, on any <form data-lead-form>:
//   data-endpoint              required backend URL once one exists
//   data-not-connected-message shown instead of submitting, while endpoint is a placeholder
//   data-success-message       shown after a real submission succeeds (optional)
//   a [data-lead-form-status] element for status messages
(function () {
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    const statusEl = form.querySelector("[data-lead-form-status]");
    const button = form.querySelector("button[type='submit']");
    const endpoint = form.dataset.endpoint || "";
    const isConfigured = endpoint && !endpoint.includes("NOT_CONFIGURED");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!isConfigured) {
        if (statusEl) statusEl.textContent = form.dataset.notConnectedMessage || "This form isn't connected yet.";
        form.reset();
        return;
      }

      if (button) button.disabled = true;
      if (statusEl) statusEl.textContent = "Sending...";

      const data = {};
      new FormData(form).forEach(function (value, key) {
        data[key] = value;
      });

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          if (statusEl) statusEl.textContent = form.dataset.successMessage || "Sent — thanks!";
          form.reset();
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "Something went wrong. Please try again in a moment.";
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  });
})();
