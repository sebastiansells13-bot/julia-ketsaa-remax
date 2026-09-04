// Newsletter signup form.
//
// This form is fully built and validated, but it is NOT wired to a live
// email service yet — doing that requires an account (Mailchimp,
// ConvertKit, Formspree, etc.) that only Julia can create and connect.
// Rather than silently "succeeding" and quietly discarding every address
// typed in, it tells the visitor honestly that signups aren't live yet.
//
// To go live: create an account with an email provider, get their form
// action URL (or API endpoint), and replace the `data-endpoint` attribute
// on the <form id="newsletter-form"> in components/newsletter-form.njk with
// it. Once that attribute no longer equals
// "NEWSLETTER_ENDPOINT_NOT_CONFIGURED", this script will submit to it
// instead of showing the "coming soon" message.
(function () {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const status = document.getElementById("newsletter-status");
  const button = form.querySelector("button[type='submit']");
  const endpoint = form.dataset.endpoint;
  const isConfigured = endpoint && endpoint !== "NEWSLETTER_ENDPOINT_NOT_CONFIGURED";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!isConfigured) {
      status.textContent = window.t
        ? window.t("newsletter.notConnected")
        : "Thanks for the interest! Email signups aren't connected yet — check back soon, or call/text Julia directly in the meantime.";
      form.reset();
      return;
    }

    // Live path, once an endpoint is configured above.
    button.disabled = true;
    status.textContent = window.t ? window.t("form.sending") : "Submitting...";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email.value }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        status.textContent = window.t ? window.t("newsletter.subscribed") : "You're subscribed — thanks!";
        form.reset();
      })
      .catch(() => {
        status.textContent = window.t ? window.t("form.somethingWrong") : "Something went wrong. Please try again in a moment.";
      })
      .finally(() => {
        button.disabled = false;
      });
  });
})();
