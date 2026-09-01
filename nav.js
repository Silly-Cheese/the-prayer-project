document.addEventListener("DOMContentLoaded", () => {
  setupLoader();
  setupPageTransitions();
  setupScrollAnimations();
  setupSuicidePreventionMonth();

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
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Initiatives <span>▾</span></button><div class="nav-group-grid"><a href="bibles-within-reach.html" data-page="bibles-within-reach.html"><strong>Bibles Within Reach</strong><span>The mission, story, and vision</span></a><a href="bwr-bible.html" data-page="bwr-bible.html"><strong>Bible & Purchasing</strong><span>Mardel, the preferred Bible, and stewardship</span></a><a href="bwr-partners.html" data-page="bwr-partners.html"><strong>Partner With BWR</strong><span>Build the network with us now</span></a><a href="bwr-campaign.html" data-page="bwr-campaign.html"><strong>2027 BWR Campaign</strong><span>The $50K goal, timeline, and plan</span></a></div></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Support <span>▾</span></button><div class="nav-group-grid"><a class="nav-crisis" href="crisis.html" data-page="crisis.html"><strong>Crisis Help</strong><span>Immediate help and support resources</span></a><a href="https://volunteer.ask4prayers.com"><strong>Volunteer</strong><span>Apply, serve, and help create chapters</span></a><a href="status.html" data-page="status.html"><strong>Site Status</strong><span>Submissions, email, and system status</span></a><a href="privacy.html" data-page="privacy.html"><strong>Privacy</strong><span>How request information is handled</span></a><a href="terms.html" data-page="terms.html"><strong>Terms</strong><span>Site rules and responsible use</span></a><a href="login.html" data-page="login.html"><strong>Admin</strong><span>Protected moderation dashboard</span></a></div></div>`;

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
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:") || link.target === "_blank" || link.hasAttribute("download")) return;
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

function setupSuicidePreventionMonth() {
  const now = new Date();
  const params = new URLSearchParams(window.location.search);
  const previewMode = params.get("spm") === "preview";
  const resetMode = params.get("spm") === "reset";
  const isSeptember = now.getMonth() === 8;
  const isPreviewEve = now.getMonth() === 7 && now.getDate() === 31;
  if (!isSeptember && !isPreviewEve && !previewMode && !resetMode) return;

  if (!document.querySelector('link[data-tpp-spm-style]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "./suicide-prevention-month.css";
    stylesheet.dataset.tppSpmStyle = "true";
    document.head.appendChild(stylesheet);
  }

  const page = window.location.pathname.split("/").pop() || "index.html";
  const onCrisisPage = page === "crisis.html";
  const storageKey = `tpp-suicide-prevention-seen-${now.getFullYear()}`;
  const previousFocus = document.activeElement;
  let hasSeen = false;

  try {
    if (resetMode) window.localStorage.removeItem(storageKey);
    hasSeen = window.localStorage.getItem(storageKey) === "1";
  } catch (_) {}
  if (previewMode || resetMode) hasSeen = false;

  const remember = () => {
    if (previewMode) return;
    try { window.localStorage.setItem(storageKey, "1"); } catch (_) {}
  };

  const banner = document.createElement("section");
  banner.className = "tpp-spm-banner";
  banner.id = "tppSuicidePreventionBanner";
  banner.setAttribute("aria-label", "Suicide Prevention Awareness Month resources");
  banner.hidden = true;
  banner.innerHTML = `
    <div class="tpp-spm-banner-inner">
      <div class="tpp-spm-banner-copy">
        <div class="tpp-spm-banner-mark" aria-hidden="true">✦</div>
        <div><strong>September is Suicide Prevention Awareness Month.</strong> <span>You matter, and you do not have to face a crisis alone. In the U.S., <b>call or text 988</b> for 24/7 support.</span></div>
      </div>
      <div class="tpp-spm-banner-actions">
        <a class="tpp-spm-banner-action primary" href="tel:988" aria-label="Call 988 Suicide and Crisis Lifeline">Call 988</a>
        <a class="tpp-spm-banner-action" href="sms:988" aria-label="Text 988 Suicide and Crisis Lifeline">Text 988</a>
        <a class="tpp-spm-banner-action" href="crisis.html">Crisis Resources</a>
      </div>
    </div>`;

  const nav = document.querySelector(".nav");
  if (nav) nav.insertAdjacentElement("afterend", banner);
  else document.body.prepend(banner);

  const showBanner = () => { banner.hidden = false; };

  if (onCrisisPage || hasSeen) {
    showBanner();
    return;
  }

  const modal = document.createElement("div");
  modal.className = "tpp-spm-modal";
  modal.id = "tppSuicidePreventionModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "tppSpmTitle");
  modal.setAttribute("aria-describedby", "tppSpmLead");
  modal.innerHTML = `
    <div class="tpp-spm-backdrop" aria-hidden="true"></div>
    <div class="tpp-spm-dialog">
      <button class="tpp-spm-close" type="button" data-spm-dismiss aria-label="Close Suicide Prevention Awareness Month message">×</button>
      <div class="tpp-spm-eyebrow">September • Suicide Prevention Awareness Month</div>
      <h2 id="tppSpmTitle">Your life has value. Your story is not finished.</h2>
      <p class="tpp-spm-lead" id="tppSpmLead">September is a time to remember lives lost to suicide, stand beside people who have struggled, and make it easier for someone to say, “I need help.” At The Prayer Project, we want to say this clearly: no one should have to carry a crisis alone.</p>
      <p>Prayer can be part of care. So can speaking with a trained crisis counselor. If you are overwhelmed, in emotional distress, thinking about suicide, worried about someone you love, or simply need someone to talk to, immediate support is available.</p>
      <div class="tpp-spm-highlight"><strong>In the United States, call or text 988.</strong><span>The 988 Suicide & Crisis Lifeline is available 24 hours a day, 7 days a week, offering free, confidential, judgment-free support from trained crisis counselors.</span></div>
      <p>Reaching out is not weakness, and asking for immediate help is not a failure of faith. This month is a reminder to check on people, listen without judgment, take warning signs seriously, and make sure the people around us know where help can be found.</p>
      <div class="tpp-spm-actions">
        <a class="tpp-spm-action primary" href="tel:988" data-spm-remember aria-label="Call 988 Suicide and Crisis Lifeline">Call 988</a>
        <a class="tpp-spm-action secondary" href="sms:988" data-spm-remember aria-label="Text 988 Suicide and Crisis Lifeline">Text 988</a>
        <a class="tpp-spm-action" href="crisis.html" data-spm-remember>Crisis Resources</a>
        <button class="tpp-spm-action" type="button" data-spm-dismiss>Continue to Site</button>
      </div>
      <p class="tpp-spm-fineprint">If you or someone else is in immediate danger, call 911 or go to the nearest emergency room.</p>
    </div>`;

  document.body.appendChild(modal);
  document.body.classList.add("tpp-spm-modal-open");

  const dismiss = () => {
    remember();
    modal.remove();
    document.body.classList.remove("tpp-spm-modal-open");
    showBanner();
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };

  modal.querySelectorAll("[data-spm-dismiss]").forEach(button => button.addEventListener("click", dismiss));
  modal.querySelectorAll("[data-spm-remember]").forEach(link => link.addEventListener("click", remember));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.getElementById("tppSuicidePreventionModal")) dismiss();
  }, { once: true });
  requestAnimationFrame(() => modal.querySelector(".tpp-spm-close")?.focus());
}
