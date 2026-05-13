document.addEventListener("DOMContentLoaded", () => {
  setupLoader();
  setupScrollAnimations();

  const navLinks = document.querySelector(".nav-links");
  const navInner = document.querySelector(".nav-inner");
  if (!navLinks || !navInner) return;

  const path = window.location.pathname.split("/").pop() || "index.html";
  const onHome = path === "index.html" || path === "";
  const home = "index.html";
  const submit = onHome ? "#submit" : "index.html#submit";
  const wall = onHome ? "#wall" : "index.html#wall";

  if (!document.querySelector(".nav-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "nav-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.innerHTML = `<span></span><span></span><span></span>`;
    navInner.appendChild(toggle);
  }

  navLinks.innerHTML = `
    <div class="nav-primary">
      <a href="${home}" data-page="index.html">Home</a>
      <a href="${wall}">Prayer Wall</a>
      <a class="nav-cta" href="${submit}">Submit</a>
    </div>

    <div class="nav-group">
      <button class="nav-group-title" type="button" aria-expanded="false">Learn <span>▾</span></button>
      <div class="nav-group-grid">
        <a href="lords-prayer.html" data-page="lords-prayer.html"><strong>Lord's Prayer</strong><span>How Jesus taught us to pray</span></a>
        <a href="prayers.html" data-page="prayers.html"><strong>Prayers</strong><span>Simple prayers for hard moments</span></a>
        <a href="bible-story.html" data-page="bible-story.html"><strong>Bible Story</strong><span>Creation, fall, redemption, and hope</span></a>
        <a href="about.html" data-page="about.html"><strong>About</strong><span>The purpose of The Prayer Project</span></a>
      </div>
    </div>

    <div class="nav-group">
      <button class="nav-group-title" type="button" aria-expanded="false">Support <span>▾</span></button>
      <div class="nav-group-grid">
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

  const toggle = document.querySelector(".nav-toggle");

  const closeDesktopDropdowns = () => {
    navLinks.querySelectorAll(".nav-group.open").forEach((group) => {
      group.classList.remove("open");
      group.querySelector(".nav-group-title")?.setAttribute("aria-expanded", "false");
    });
  };

  const closeMenu = () => {
    navLinks.classList.remove("open");
    toggle?.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    closeDesktopDropdowns();
  };

  toggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
    closeDesktopDropdowns();
  });

  navLinks.querySelectorAll(".nav-group-title").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const group = button.closest(".nav-group");
      const isOpen = group.classList.contains("open");

      closeDesktopDropdowns();

      if (!isOpen) {
        group.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-group")) return;
    closeDesktopDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
});

function setupLoader() {
  if (document.getElementById("siteLoader")) return;

  document.documentElement.classList.add("site-loading");

  const loader = document.createElement("div");
  loader.id = "siteLoader";
  loader.className = "site-loader";
  loader.innerHTML = `
    <div class="loader-mark">✦</div>
    <div class="loader-title">The Prayer Project</div>
    <div class="loader-subtitle">Preparing a quiet place to pray</div>
    <div class="loader-line"><span></span></div>
  `;
  document.body.prepend(loader);

  const hideLoader = () => {
    loader.classList.add("hide");
    document.documentElement.classList.remove("site-loading");
    setTimeout(() => loader.remove(), 650);
  };

  window.addEventListener("load", () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 1800);
}

function setupScrollAnimations() {
  const animatedSelector = [
    ".hero-copy",
    ".submit-card",
    ".verse",
    ".stat",
    ".section-title",
    ".toolbar",
    ".prayer-card",
    ".about-card",
    ".card",
    ".panel",
    ".chapter",
    ".prayer",
    ".scripture-card",
    ".summary-card",
    ".note",
    ".empty"
  ].join(",");

  const elements = [...document.querySelectorAll(animatedSelector)]
    .filter((element) => !element.closest(".nav") && !element.closest(".site-loader"));

  elements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  elements.forEach((element) => observer.observe(element));
}
