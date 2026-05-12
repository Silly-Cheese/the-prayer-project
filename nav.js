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
      <button class="nav-menu-btn" type="button" aria-expanded="false">Learn <span>▾</span></button>
      <div class="nav-menu-panel">
        <a href="lords-prayer.html" data-page="lords-prayer.html"><strong>Lord's Prayer</strong><span>How Jesus taught us to pray</span></a>
        <a href="prayers.html" data-page="prayers.html"><strong>Prayers</strong><span>Simple prayers for hard moments</span></a>
        <a href="bible-story.html" data-page="bible-story.html"><strong>Bible Story</strong><span>Creation, fall, redemption, and hope</span></a>
        <a href="about.html" data-page="about.html"><strong>About</strong><span>The purpose of The Prayer Project</span></a>
      </div>
    </div>
    <div class="nav-menu">
      <button class="nav-menu-btn" type="button" aria-expanded="false">Support <span>▾</span></button>
      <div class="nav-menu-panel">
        <a class="nav-crisis" href="crisis.html" data-page="crisis.html"><strong>Crisis Help</strong><span>Immediate help and support resources</span></a>
        <a href="privacy.html" data-page="privacy.html"><strong>Privacy</strong><span>How request information is handled</span></a>
        <a href="terms.html" data-page="terms.html"><strong>Terms</strong><span>Site rules and responsible use</span></a>
        <a href="login.html" data-page="login.html"><strong>Admin</strong><span>Protected moderation dashboard</span></a>
      </div>
    </div>
  `;

  navLinks.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === path) link.classList.add("active");
  });

  navLinks.querySelectorAll(".nav-menu-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const menu = button.closest(".nav-menu");
      const isOpen = menu.classList.contains("open");

      navLinks.querySelectorAll(".nav-menu.open").forEach((openMenu) => {
        openMenu.classList.remove("open");
        openMenu.querySelector(".nav-menu-btn")?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        menu.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-menu")) return;
    navLinks.querySelectorAll(".nav-menu.open").forEach((openMenu) => {
      openMenu.classList.remove("open");
      openMenu.querySelector(".nav-menu-btn")?.setAttribute("aria-expanded", "false");
    });
  });
});
