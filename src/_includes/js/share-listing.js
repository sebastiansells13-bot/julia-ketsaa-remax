// Share button on each listing's detail page. Uses the browser's native
// share sheet (Web Share API) where available — mainly mobile — and falls
// back to copying the link to the clipboard everywhere else. No account,
// no third-party service.
(function () {
  const button = document.querySelector("[data-share-listing]");
  if (!button) return;

  const label = button.querySelector("span");
  const defaultText = label ? label.textContent : "Share";

  function flash(text, revertAfter) {
    if (!label) return;
    label.textContent = text;
    if (revertAfter) {
      setTimeout(function () {
        label.textContent = defaultText;
      }, 2000);
    }
  }

  button.addEventListener("click", async function () {
    const shareData = {
      title: button.dataset.title || document.title,
      url: location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // AbortError just means the visitor canceled the native share
        // sheet — not an error worth surfacing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(location.href);
      flash("Link copied!", true);
    } catch (err) {
      flash("Copy failed — copy from the address bar", true);
    }
  });
})();
