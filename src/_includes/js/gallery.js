// Listing photo gallery + lightbox (src/listing-detail.njk). No-ops
// entirely when a listing has no photos (samples show the illustrated
// placeholder instead, which isn't part of this gallery at all).
(function () {
  const root = document.getElementById("listing-gallery");
  if (!root) return;

  const mainBtn = root.querySelector("[data-gallery-open]");
  const mainImg = root.querySelector("[data-gallery-main-img]");
  const thumbs = Array.from(root.querySelectorAll("[data-gallery-thumb]"));
  if (!mainImg) return;

  const images = thumbs.length ? thumbs.map((t) => t.dataset.src) : [mainImg.src];
  let currentIndex = 0;

  function setActive(index) {
    currentIndex = (index + images.length) % images.length;
    mainImg.src = images[currentIndex];
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === currentIndex));
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", function () {
      setActive(i);
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  if (!lightbox || !lightboxImg) return;

  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  if (images.length <= 1) {
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
  }

  function syncLightbox() {
    lightboxImg.src = images[currentIndex];
  }

  function openLightbox() {
    syncLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function step(delta) {
    setActive(currentIndex + delta);
    syncLightbox();
  }

  if (mainBtn) mainBtn.addEventListener("click", openLightbox);
  lightbox.querySelector("[data-lightbox-close]").addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  });
})();
