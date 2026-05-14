document.addEventListener("DOMContentLoaded", () => {
  setupLoader();
  setupPageTransitions();
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
    <div class="nav-primary"><a href="${home}" data-page="index.html">Home</a><a href="${wall}">Prayer Wall</a><a class="nav-cta" href="${submit}">Submit</a></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Learn <span>▾</span></button><div class="nav-group-grid"><a href="lords-prayer.html" data-page="lords-prayer.html"><strong>Lord's Prayer</strong><span>How Jesus taught us to pray</span></a><a href="prayers.html" data-page="prayers.html"><strong>Prayers</strong><span>Simple prayers for hard moments</span></a><a href="bible-story.html" data-page="bible-story.html"><strong>Bible Story</strong><span>Creation, fall, redemption, and hope</span></a><a href="answered.html" data-page="answered.html"><strong>Answered Prayers</strong><span>Remember what God has brought through</span></a><a href="about.html" data-page="about.html"><strong>About</strong><span>The purpose of The Prayer Project</span></a></div></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Support <span>▾</span></button><div class="nav-group-grid"><a class="nav-crisis" href="crisis.html" data-page="crisis.html"><strong>Crisis Help</strong><span>Immediate help and support resources</span></a><a href="status.html" data-page="status.html"><strong>Site Status</strong><span>Submissions, email, and system status</span></a><a href="privacy.html" data-page="privacy.html"><strong>Privacy</strong><span>How request information is handled</span></a><a href="terms.html" data-page="terms.html"><strong>Terms</strong><span>Site rules and responsible use</span></a><a href="login.html" data-page="login.html"><strong>Admin</strong><span>Protected moderation dashboard</span></a></div></div>`;

  navLinks.querySelectorAll("[data-page]").forEach(link => { if (link.dataset.page === path) link.classList.add("active"); });
  const toggle = document.querySelector(".nav-toggle");
  const closeDesktopDropdowns = () => navLinks.querySelectorAll(".nav-group.open").forEach(group => { group.classList.remove("open"); group.querySelector(".nav-group-title")?.setAttribute("aria-expanded", "false"); });
  const closeMenu = () => { navLinks.classList.remove("open"); toggle?.classList.remove("open"); toggle?.setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); closeDesktopDropdowns(); };
  toggle?.addEventListener("click", () => { const isOpen = navLinks.classList.toggle("open"); toggle.classList.toggle("open", isOpen); toggle.setAttribute("aria-expanded", String(isOpen)); document.body.classList.toggle("nav-open", isOpen); closeDesktopDropdowns(); }, { passive: true });
  navLinks.querySelectorAll(".nav-group-title").forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); const group = button.closest(".nav-group"); const isOpen = group.classList.contains("open"); closeDesktopDropdowns(); if (!isOpen) { group.classList.add("open"); button.setAttribute("aria-expanded", "true"); } }));
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => { if (!event.target.closest(".nav-group")) closeDesktopDropdowns(); }, { passive: true });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
});

function setupLoader() {
  if (document.getElementById("siteLoader")) return;
  document.documentElement.classList.add("site-loading");
  const loader = createLoader("Opening");
  document.body.prepend(loader);
  let hidden = false;
  const hideLoader = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add("hide");
    document.documentElement.classList.remove("site-loading");
    setTimeout(() => loader.remove(), 160);
  };
  if (document.readyState === "complete") requestAnimationFrame(hideLoader);
  else window.addEventListener("load", () => setTimeout(hideLoader, 20), { once: true });
  setTimeout(hideLoader, 420);
}

function setupPageTransitions() {
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || link.target === "_blank" || link.hasAttribute("download")) return;
    const destination = new URL(href, window.location.href), current = new URL(window.location.href);
    if (destination.origin !== current.origin || (destination.pathname === current.pathname && destination.hash)) return;
    event.preventDefault();
    showPageTransition(destination.href);
  });
}

function showPageTransition(url) {
  let loader = document.getElementById("pageTransitionLoader");
  if (!loader) {
    loader = createLoader("Opening");
    loader.id = "pageTransitionLoader";
    loader.classList.add("page-transition-loader");
    document.body.appendChild(loader);
  }
  document.documentElement.classList.add("site-loading");
  loader.classList.remove("hide");
  loader.style.opacity = "1";
  loader.style.visibility = "visible";
  requestAnimationFrame(() => loader.classList.add("show"));
  setTimeout(() => { window.location.assign(url); }, 120);
}

function createLoader(subtitle) {
  const loader = document.createElement("div");
  loader.id = "siteLoader";
  loader.className = "site-loader";
  loader.innerHTML = `<div class="loader-mark">✦</div><div class="loader-title">The Prayer Project</div><div class="loader-subtitle">${subtitle}</div>`;
  return loader;
}

function setupScrollAnimations() {
  const lowPower = window.matchMedia("(max-width: 760px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lowPower) {
    document.documentElement.classList.add("performance-mode");
    return;
  }
  const animatedSelector = ["main h1", "main h2", ".lead", ".eyebrow", ".submit-card", ".verse", ".stat", ".section-title", ".toolbar", ".quick-card", ".prayer-card", ".about-card", ".answered-card", ".status-card", ".card", ".panel", ".chapter", ".prayer", ".scripture-card", ".summary-card", ".note", ".empty"].join(",");
  const elements = [...document.querySelectorAll(animatedSelector)].filter(element => !element.closest(".nav") && !element.closest(".site-loader") && !element.closest(".page-transition-loader")).slice(0, 80);
  if (!("IntersectionObserver" in window)) { elements.forEach(el => el.classList.add("visible")); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });
  elements.forEach((element, index) => { element.classList.add("reveal"); element.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 25}ms`); observer.observe(element); });
}
