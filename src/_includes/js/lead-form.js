// Shared handler for every form on the site that collects a visitor's
// contact info (Contact page, "What's My Home Worth?", each listing's
// Schedule a Tour and Ask Julia forms). Same honest "not connected yet"
// pattern as newsletter.js: fully validated, but each form only actually
// submits once its own `data-endpoint` is filled in with a real backend —
// until then it tells the visitor plainly instead of silently discarding
// what they typed.
//
// Markup contract, on any <form data-lead-form>:
//   data-endpoint            required backend URL once one exists
//   data-not-connected-key   src/_data/i18n.json key for the message shown
//                            instead of submitting, while endpoint is a placeholder
//   data-success-key         i18n.json key shown after a real submission succeeds
//   data-message-vars        optional JSON object of {name} substitutions for
//                            either message above, e.g. {"address":"123 Main St"} —
//                            build it with Nunjucks as {{ {"address": listing.address} | dump }},
//                            NOT `| safe` (the HTML-escaping is what keeps the
//                            embedded quotes valid inside the attribute)
//   a [data-lead-form-status] element for status messages
// Messages are looked up through window.t() (i18n-runtime.js, which must
// load before this script) so they respect the site's language toggle —
// don't hardcode an English string in a form's markup for these two.
(function () {
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    const statusEl = form.querySelector("[data-lead-form-status]");
    const button = form.querySelector("button[type='submit']");
    const endpoint = form.dataset.endpoint || "";
    const isConfigured = endpoint && !endpoint.includes("NOT_CONFIGURED");

    let vars = {};
    if (form.dataset.messageVars) {
      try {
        vars = JSON.parse(form.dataset.messageVars);
      } catch (err) {
        vars = {};
      }
    }

    function message(keyAttr, fallbackKey) {
      const key = form.dataset[keyAttr] || fallbackKey;
      return window.t ? window.t(key, vars) : key;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (!isConfigured) {
        if (statusEl) statusEl.textContent = message("notConnectedKey", "form.notConnectedGeneric");
        form.reset();
        return;
      }

      if (button) button.disabled = true;
      if (statusEl) statusEl.textContent = window.t ? window.t("form.sending") : "Sending...";

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
          if (statusEl) statusEl.textContent = message("successKey", "form.sentGeneric");
          form.reset();
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = window.t ? window.t("form.somethingWrong") : "Something went wrong. Please try again in a moment.";
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
    });
  });
})();
