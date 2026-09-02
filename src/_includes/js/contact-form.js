// Contact form on /contact/. Same honesty pattern as newsletter.js: fully
// built and validated, but not wired to a real email/lead service yet —
// tells the visitor that plainly instead of pretending to send it.
//
// To go live: pick a form backend (Formspree, Netlify Forms, a lender's
// own API, etc.), then replace the `data-endpoint` attribute on
// <form id="contact-form"> in components/contact-form.njk with its URL.
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("contact-form-status");
  const button = form.querySelector("button[type='submit']");
  const endpoint = form.dataset.endpoint;
  const isConfigured = endpoint && endpoint !== "CONTACT_FORM_ENDPOINT_NOT_CONFIGURED";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!isConfigured) {
      status.textContent =
        "Thanks for reaching out! This form isn't connected yet — please call or text " +
        "Julia directly in the meantime, or email her using the address above.";
      form.reset();
      return;
    }

    button.disabled = true;
    status.textContent = "Sending...";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        message: form.message.value,
      }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        status.textContent = "Message sent — Julia will be in touch soon.";
        form.reset();
      })
      .catch(function () {
        status.textContent = "Something went wrong. Please try again in a moment.";
      })
      .finally(function () {
        button.disabled = false;
      });
  });
})();
