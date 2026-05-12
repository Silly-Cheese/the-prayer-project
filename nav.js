document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks) return;

  const path = window.location.pathname.split("/").pop() || "index.html";
  const onHome = path === "index.html" || path === "";
  const home = "index.html";
  const submit = onHome ? "#submit" : "index.html#submit";
  const wall = onHome ? "#wall" : "index.html#wall";

  navLinks.innerHTML = `
    <a href="${home}" data-page="index.html">Home</a>
    <a href="${wall}">Prayer Wall</a>
    <a class="nav-cta" href="${submit}">Submit</a>
    <div class="nav-menu">
      <button class="nav-menu-btn" type="button">Learn ▾</button>
      <div class="nav-mobile-label">Learn</div>
      <div class="nav-menu-panel">
        <a href="lords-prayer.html" data-page="lords-prayer.html">Lord's Prayer<span>How Jesus taught us to pray</span></a>
        <a href="prayers.html" data-page="prayers.html">Prayers<span>Simple prayers for hard moments</span></a>
        <a href="bible-story.html" data-page="bible-story.html">Bible Story<span>Creation, fall, redemption, and hope</span></a>
        <a href="about.html" data-page="about.html">About<span>The purpose of The Prayer Project</span></a>
      </div>
    </div>
    <div class="nav-menu">
      <button class="nav-menu-btn" type="button">Support ▾</button>
      <div class="nav-mobile-label">Support</div>
      <div class="nav-menu-panel">
        <a class="nav-crisis" href="crisis.html" data-page="crisis.html">Crisis Help<span>Immediate help and support resources</span></a>
        <a href="privacy.html" data-page="privacy.html">Privacy<span>How request information is handled</span></a>
        <a href="terms.html" data-page="terms.html">Terms<span>Site rules and responsible use</span></a>
        <a href="login.html" data-page="login.html">Admin<span>Protected moderation dashboard</span></a>
      </div>
    </div>
  `;

  navLinks.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === path) link.classList.add("active");
  });
});
