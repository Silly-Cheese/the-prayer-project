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

  const loader = createLoader("Preparing a quiet place to pray");
  document.body.prepend(loader);

  const hideLoader = () => {
    loader.classList.add("hide");
    document.documentElement.classList.remove("site-loading");
    setTimeout(() => loader.remove(), 650);
  };

  window.addEventListener("load", () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 1800);
}

function setupPageTransitions() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const destination = new URL(href, window.location.href);
    const current = new URL(window.location.href);
    const samePageAnchor = destination.pathname === current.pathname && destination.hash;
    if (samePageAnchor) return;
    if (destination.origin !== current.origin) return;

    event.preventDefault();
    showPageTransition(destination.href);
  });
}

function showPageTransition(url) {
  let loader = document.getElementById("pageTransitionLoader");
  if (!loader) {
    loader = createLoader("Opening the next page");
    loader.id = "pageTransitionLoader";
    loader.classList.add("page-transition-loader");
    document.body.appendChild(loader);
  }

  document.documentElement.classList.add("site-loading");
  requestAnimationFrame(() => loader.classList.add("show"));
  setTimeout(() => { window.location.href = url; }, 420);
}

function createLoader(subtitle) {
  const loader = document.createElement("div");
  loader.id = "siteLoader";
  loader.className = "site-loader";
  loader.innerHTML = `
    <div class="loader-mark">✦</div>
    <div class="loader-title">The Prayer Project</div>
    <div class="loader-subtitle">${subtitle}</div>
    <div class="loader-line"><span></span></div>
  `;
  return loader;
}

function setupScrollAnimations() {
  const animatedSelector = [
    "main h1",
    "main h2",
    "main h3",
    ".lead",
    ".eyebrow",
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
    ".empty",
    "form label",
    "footer"
  ].join(",");

  const seen = new WeakSet();
  let observer;

  const animateElements = (root = document) => {
    const elements = [...root.querySelectorAll(animatedSelector)]
      .filter((element) => !element.closest(".nav") && !element.closest(".site-loader") && !element.closest(".page-transition-loader"));

    elements.forEach((element, index) => {
      if (seen.has(element)) return;
      seen.add(element);
      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index % 8, 7) * 55}ms`);
      if (observer) observer.observe(element);
      else element.classList.add("visible");
    });
  };

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });
  }

  animateElements(document);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches?.(animatedSelector)) animateElements(node.parentElement || document);
        else animateElements(node);
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
