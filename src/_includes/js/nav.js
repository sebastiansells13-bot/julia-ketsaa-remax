// Mobile nav toggle. The nav is a plain, always-in-the-DOM list — this just
// shows/hides it below the header's mobile breakpoint (see .site-header in
// components.scss) and keeps the toggle button's aria-expanded in sync.
(function () {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  // Tapping a link closes the menu (helpful once it's a full-screen-ish
  // dropdown rather than a persistent inline bar).
  nav.addEventListener("click", function (event) {
    if (event.target.tagName === "A") setOpen(false);
  });
})();
