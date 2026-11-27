document.addEventListener("DOMContentLoaded", () => {
  setupLoader();
  setupPageTransitions();
  setupScrollAnimations();
  setupCrisisResourceReviewStamp();
  setupSuicidePreventionMonth();
  if (!location.pathname.split("/").pop()?.startsWith("admin") && (document.body.classList.contains("public-page") || document.body.classList.contains("home-page"))) {
    if (new URLSearchParams(location.search).get("gratitude")==="preview") setupGratitudeMonth();
    else import("./campaign-public.js").then(m=>m.mountCampaigns()).then(exclusive=>{if(!exclusive)setupGratitudeMonth();}).catch(()=>setupGratitudeMonth());
  }
  setupPublicFooter();

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
    <div class="nav-primary"><a href="${wall}">Prayer Wall</a><a href="about.html" data-page="about.html">About</a><a class="nav-cta" href="${submit}">Request Prayer</a></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Initiatives <span>▾</span></button><div class="nav-group-grid"><a href="bibles-within-reach.html" data-page="bibles-within-reach.html"><strong>Bibles Within Reach</strong><span>Scripture access and practical outreach</span></a><a href="bwr-campaign.html" data-page="bwr-campaign.html"><strong>2027 Campaign</strong><span>The planned six-month fundraising campaign</span></a><a href="bwr-partners.html" data-page="bwr-partners.html"><strong>Partner With BWR</strong><span>Help build the distribution network</span></a><a href="bwr-bible.html" data-page="bwr-bible.html"><strong>Bible & Purchasing</strong><span>Selection, purchasing, and stewardship</span></a><a href="scholarship.html" data-page="scholarship.html"><strong>Beacon Scholars</strong><span>Future $500–$10,000 award vision after BWR</span></a></div></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Resources <span>▾</span></button><div class="nav-group-grid"><a href="lords-prayer.html" data-page="lords-prayer.html"><strong>Lord's Prayer</strong><span>How Jesus taught us to pray</span></a><a href="prayers.html" data-page="prayers.html"><strong>Prayers</strong><span>Simple prayers for difficult moments</span></a><a href="bible-story.html" data-page="bible-story.html"><strong>Bible Story</strong><span>Creation, fall, redemption, and hope</span></a><a href="answered.html" data-page="answered.html"><strong>Answered Prayers</strong><span>Stories and updates from the prayer wall</span></a><a class="nav-crisis" href="crisis.html" data-page="crisis.html"><strong>Crisis Help</strong><span>Immediate support and safety resources</span></a></div></div>
    <div class="nav-group"><button class="nav-group-title" type="button" aria-expanded="false">Get Involved <span>▾</span></button><div class="nav-group-grid"><a href="https://volunteer.ask4prayers.com"><strong>Volunteer</strong><span>Pray, serve, and help build chapters</span></a><a href="status.html" data-page="status.html"><strong>Site Status</strong><span>Submission, email, and system status</span></a><a href="privacy.html" data-page="privacy.html"><strong>Privacy</strong><span>How request information is handled</span></a><a href="terms.html" data-page="terms.html"><strong>Terms</strong><span>Site rules and responsible use</span></a><a href="login.html" data-page="login.html"><strong>Administration</strong><span>Protected moderation access</span></a></div></div>`;

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

function setupPublicFooter() {
  if (!document.body.classList.contains("public-page")) return;
  let footer = document.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    document.body.appendChild(footer);
  }
  footer.className = "tpp-footer";
  footer.innerHTML = `
    <div class="shell tpp-footer-inner">
      <div class="tpp-footer-top">
        <div class="tpp-footer-brand">
          <div class="tpp-footer-mark" aria-hidden="true">✦</div>
          <div>
            <strong>The Prayer Project</strong>
            <p>A place to ask for prayer, pray for others, find biblical encouragement, and carry compassion into practical service.</p>
          </div>
        </div>
        <div class="tpp-footer-links">
          <a href="index.html#wall">Prayer Wall</a>
          <a href="index.html#submit">Request Prayer</a>
          <a href="about.html">About</a>
          <a href="answered.html">Answered Prayers</a>
          <a href="lords-prayer.html">Lord's Prayer</a>
          <a href="prayers.html">Prayers</a>
          <a href="bible-story.html">Bible Story</a>
          <a href="bibles-within-reach.html">Bibles Within Reach</a>
          <a href="scholarship.html">Beacon Scholars</a>
          <a href="https://volunteer.ask4prayers.com/">Volunteer</a>
          <a href="crisis.html">Crisis Resources</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>
      <div class="tpp-footer-bottom">
        <span>Prayer • Presence • Practical Care</span>
        <span><a href="status.html">Site Status</a> · <a href="login.html">Administration</a></span>
      </div>
    </div>`;
}

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

function setupCrisisResourceReviewStamp() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  if (page !== "crisis.html" || document.getElementById("crisisGuidanceReview")) return;
  const host = document.querySelector(".footer-note") || document.querySelector("main");
  if (!host) return;
  const stamp = document.createElement("aside");
  stamp.id = "crisisGuidanceReview";
  stamp.setAttribute("aria-label", "Crisis guidance review information");
  stamp.style.cssText = "margin-top:18px;padding:18px 20px;border-radius:22px;border:1px solid rgba(216,195,165,.18);background:rgba(216,195,165,.055);color:var(--muted);font-size:13px;line-height:1.7";
  stamp.innerHTML = `<strong style="display:block;color:var(--warm2);margin-bottom:6px">Crisis guidance reviewed August 31, 2026</strong><span>This page is periodically checked against current U.S. guidance from the 988 Suicide & Crisis Lifeline, the National Institute of Mental Health, and SAMHSA. Resources can change; for immediate physical danger, use emergency services.</span><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px"><a href="https://988lifeline.org/" target="_blank" rel="noopener" style="color:var(--warm2);font-weight:800">988 Lifeline</a><a href="https://www.nimh.nih.gov/health/topics/suicide-prevention" target="_blank" rel="noopener" style="color:var(--warm2);font-weight:800">NIMH</a><a href="https://www.samhsa.gov/find-help/988" target="_blank" rel="noopener" style="color:var(--warm2);font-weight:800">SAMHSA</a></div>`;
  host.appendChild(stamp);
}

function trapFocusWithin(container) {
  const handler = event => {
    if (event.key !== "Tab" || !document.body.contains(container)) return;
    const focusable = [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
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
  const onHome = page === "index.html" || page === "";
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
  banner.setAttribute("aria-label", "Suicide Prevention Awareness Month crisis resources");
  banner.hidden = true;
  banner.innerHTML = `
    <div class="tpp-spm-banner-inner">
      <div class="tpp-spm-banner-copy">
        <div class="tpp-spm-banner-mark" aria-hidden="true">!</div>
        <div><strong>September is Suicide Prevention Awareness Month.</strong><span>Suicidal thoughts and warning signs can be a crisis and should never be ignored. If you or someone you know may not be safe, <b>call or text 988 now.</b></span></div>
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

  if (onHome && !document.getElementById("tppSpmHomeSection")) {
    const homeSection = document.createElement("section");
    homeSection.className = "tpp-spm-home";
    homeSection.id = "tppSpmHomeSection";
    homeSection.innerHTML = `
      <div class="shell">
        <div class="tpp-spm-home-card">
          <div class="tpp-spm-home-top">
            <div>
              <div class="tpp-spm-home-kicker">September • Recognize the crisis</div>
              <h2>Check on someone today.</h2>
              <p>Someone can look okay and still be struggling. If something feels different, ask. Listen without judgment. Take statements about suicide seriously. You do not need perfect words to help someone reach support.</p>
              <div class="tpp-spm-home-actions">
                <a class="primary" href="tel:988">Call 988</a>
                <a href="sms:988">Text 988</a>
                <a href="crisis.html">View Crisis Resources</a>
              </div>
            </div>
            <aside class="tpp-spm-home-callout">
              <strong>It is okay to ask directly.</strong>
              <p>If you are worried about someone, asking “Are you thinking about suicide?” can open an important conversation. Listen, stay present, and help them connect with immediate support. If there is life-threatening danger, call 911.</p>
            </aside>
          </div>
        </div>
      </div>`;
    const wall = document.getElementById("wall");
    if (wall) wall.insertAdjacentElement("beforebegin", homeSection);
    else document.querySelector("main")?.appendChild(homeSection);
  }

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
      <p class="tpp-spm-lead" id="tppSpmLead">September is a time to remember lives lost to suicide, stand beside people who have struggled, recognize warning signs, and make it easier for someone to say, “I need help.” At The Prayer Project, we want to be unmistakably clear: suicidal thoughts can be an urgent safety crisis, and no one should have to carry that crisis alone.</p>

      <div class="tpp-spm-crisis-box">
        <span class="label">This is a crisis</span>
        <strong>If you may hurt yourself, have a suicide plan, or are afraid you may not stay safe, do not wait to see if it passes.</strong>
        <span>Call or text 988 now and tell someone you trust what is happening. If there is immediate life-threatening danger, call 911 or go to the nearest emergency department.</span>
      </div>

      <div class="tpp-spm-emergency">
        <h3>I may not be safe right now.</h3>
        <p>You do not need to explain everything before asking for help. Choose the fastest safe option available to you.</p>
        <div class="tpp-spm-emergency-actions">
          <a href="tel:988" data-spm-remember>Call 988</a>
          <a href="sms:988" data-spm-remember>Text 988</a>
          <a class="danger" href="tel:911" data-spm-remember>Call 911</a>
          <a href="crisis.html" data-spm-remember>Crisis Resources</a>
        </div>
      </div>

      <div class="tpp-spm-section">
        <h3>Warning signs deserve attention.</h3>
        <p>Warning signs can look different from person to person, but these are reasons to check in and seek help—especially when they are new, increasing, or connected to a painful event or loss.</p>
        <div class="tpp-spm-warning-grid">
          <div class="tpp-spm-warning"><strong>Talking about wanting to die</strong>, having no reason to live, or believing others would be better off without them.</div>
          <div class="tpp-spm-warning"><strong>Feeling hopeless, trapped, or in unbearable pain</strong>, or saying there is no solution.</div>
          <div class="tpp-spm-warning"><strong>Withdrawing, saying goodbye, or giving away important possessions</strong> in an unusual or concerning way.</div>
          <div class="tpp-spm-warning"><strong>Extreme mood or behavior changes</strong>, dangerous risk-taking, agitation, or major changes in sleep or substance use.</div>
        </div>
      </div>

      <div class="tpp-spm-section">
        <h3>Concerned about someone?</h3>
        <p>Take statements about suicide seriously. You do not have to diagnose them or solve everything. Your job is to help them stay connected to people and professional support.</p>
        <div class="tpp-spm-help-steps">
          <div class="tpp-spm-help-step"><b>1</b><div><strong>Ask directly.</strong><span>“Are you thinking about suicide?” is an appropriate question when you are concerned.</span></div></div>
          <div class="tpp-spm-help-step"><b>2</b><div><strong>Be there and listen.</strong><span>Stay calm, listen without judgment, and take what they say seriously.</span></div></div>
          <div class="tpp-spm-help-step"><b>3</b><div><strong>Help keep them safe.</strong><span>If it is safe for you to do so, stay with them or help move them away from immediate danger while support is being contacted.</span></div></div>
          <div class="tpp-spm-help-step"><b>4</b><div><strong>Help them connect.</strong><span>Call or text 988 together, involve a trusted person, or seek emergency care when needed.</span></div></div>
          <div class="tpp-spm-help-step"><b>5</b><div><strong>Follow up.</strong><span>Check back in after the immediate moment. Continued connection matters.</span></div></div>
        </div>
      </div>

      <div class="tpp-spm-faith">
        <strong>Prayer and crisis care are not competing choices.</strong>
        <span>A mental-health crisis is not evidence of weak faith. Prayer can be part of care, and so can calling 988, talking with a counselor, seeking medical care, or asking someone to stay with you. Asking for immediate help is not a failure of faith.</span>
      </div>

      <p>September is also a reminder for all of us: check on people, listen closely, notice changes, take warning signs seriously, and make sure the people around us know where help can be found.</p>
      <div class="tpp-spm-actions">
        <a class="tpp-spm-action primary" href="tel:988" data-spm-remember aria-label="Call 988 Suicide and Crisis Lifeline">Call 988</a>
        <a class="tpp-spm-action secondary" href="sms:988" data-spm-remember aria-label="Text 988 Suicide and Crisis Lifeline">Text 988</a>
        <a class="tpp-spm-action" href="crisis.html" data-spm-remember>Crisis Resources</a>
        <button class="tpp-spm-action" type="button" data-spm-dismiss>Continue to Site</button>
      </div>
      <p class="tpp-spm-fineprint">In the United States, the 988 Suicide & Crisis Lifeline is available 24/7. If you or someone else is in immediate life-threatening danger, call 911 or go to the nearest emergency department.</p>
    </div>`;

  document.body.appendChild(modal);
  document.body.classList.add("tpp-spm-modal-open");
  const releaseFocusTrap = trapFocusWithin(modal);
  const escapeHandler = event => { if (event.key === "Escape" && document.getElementById("tppSuicidePreventionModal")) dismiss(); };

  const dismiss = () => {
    remember();
    releaseFocusTrap();
    document.removeEventListener("keydown", escapeHandler);
    modal.remove();
    document.body.classList.remove("tpp-spm-modal-open");
    showBanner();
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };

  modal.querySelectorAll("[data-spm-dismiss]").forEach(button => button.addEventListener("click", dismiss));
  modal.querySelectorAll("[data-spm-remember]").forEach(link => link.addEventListener("click", remember));
  document.addEventListener("keydown", escapeHandler);
  requestAnimationFrame(() => modal.querySelector(".tpp-spm-close")?.focus());
}


// November gratitude campaign — public pages only.
function setupGratitudeMonth() {
  const now = new Date();
  const preview = new URLSearchParams(location.search).get("gratitude") === "preview";
  const page = location.pathname.split("/").pop() || "index.html";
  const home = page === "index.html";
  if (!home && !document.body.classList.contains("public-page")) return;
  if (page === "crisis.html" || page === "login.html" || page.startsWith("admin")) return;
  if (!preview && now.getMonth() !== 10) return;
  if (document.getElementById("tppGratitudeBanner")) return;
  const thanksgiving = new Date(now.getFullYear(), 10, 1);
  thanksgiving.setDate(1 + (4 - thanksgiving.getDay() + 7) % 7 + 21);
  const isDay = now.getMonth() === 10 && now.getDate() === thanksgiving.getDate();
  const isWeek = now.getMonth() === 10 && now.getDate() >= thanksgiving.getDate() - 3 && now.getDate() <= thanksgiving.getDate() + 3;
  const greeting = isDay ? "Happy Thanksgiving!" : isWeek ? "Happy Thanksgiving Week!" : "November — A Month of Gratitude";
  const prompts = [
    "Thank someone who has quietly stood beside you.",
    "Remember a small kindness you received recently.",
    "Thank God for a person who has encouraged you.",
    "Take a moment to appreciate something you usually overlook.",
    "Offer a prayer of thanks for a blessing, however small.",
    "Share a kind word with someone who may need it.",
    "Remember a moment of hope that helped you keep going."
  ];
  const prompt = prompts[(now.getDate() - 1) % prompts.length];
  const css = document.createElement("style");
  css.textContent = `
    .tpp-gratitude{box-sizing:border-box;color:#f9ead5;background:radial-gradient(ellipse at top right,#57351f 0,transparent 55%),linear-gradient(115deg,#21140e,#382116 65%,#21140e);border-block:1px solid #865735}
    .tpp-gratitude-inner{width:min(1160px,calc(100% - 40px));margin:auto;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 0}
    .tpp-gratitude strong{color:#ffe3ad}.tpp-gratitude small{display:block;color:#ebcba8;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800}
    .tpp-gratitude button,.tpp-gratitude a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border-radius:999px;background:#f4d29b;color:#2c190e;border:1px solid #f4d29b;font:inherit;font-size:14px;font-weight:800;text-decoration:none;cursor:pointer}
    .tpp-gratitude :focus-visible{outline:3px solid #fff;outline-offset:4px}
    .tpp-gratitude-feature{padding:clamp(30px,6vw,76px) 0}
    .tpp-gratitude-feature .tpp-gratitude-inner{display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(20px,5vw,60px)}
    .tpp-gratitude h2{font-family:"Playfair Display",Georgia,serif;font-size:clamp(36px,6vw,72px);line-height:1.06;letter-spacing:-.035em;margin:12px 0 18px;color:#fff3df}
    .tpp-gratitude p{color:#f0d9c0;line-height:1.75;margin:0 0 16px}
    .tpp-gratitude-reflection{padding:24px;border:1px solid #9b714c;border-radius:20px;background:#21140e;color:#f9ead5}
    .tpp-gratitude-reflection blockquote{font:600 24px/1.4 Georgia,serif;margin:12px 0;color:#ffe3ad}
    .tpp-gratitude-dialog{box-sizing:border-box;width:min(760px,calc(100% - 28px));max-height:calc(100% - 28px);overflow:auto;border:1px solid #9b714c;border-radius:24px;padding:clamp(24px,5vw,48px);box-shadow:0 24px 100px #0009}
    .tpp-gratitude-dialog::backdrop{background:#000b}
    .tpp-gratitude-dialog .tpp-gratitude-close{float:right;min-width:44px;padding:8px;font-size:22px}
    .tpp-gratitude-dialog h2{font-size:clamp(36px,6vw,60px)}
    .tpp-gratitude-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
    @media(max-width:700px){.tpp-gratitude-feature .tpp-gratitude-inner{grid-template-columns:1fr}.tpp-gratitude-inner{flex-wrap:wrap}}
  `;
  document.head.appendChild(css);
  const banner = document.createElement("section");
  banner.id = "tppGratitudeBanner";
  banner.className = "tpp-gratitude";
  banner.setAttribute("aria-label","November gratitude campaign");
  banner.innerHTML = `<div class="tpp-gratitude-inner"><div><small>November • The Prayer Project</small><strong>${greeting}</strong> — Give thanks. Show kindness. Appreciate the little things.</div><button type="button" data-gratitude-open>Read our Thanksgiving message</button></div>`;
  document.querySelector(".nav")?.after(banner);
  if (!banner.isConnected) document.body.prepend(banner);
  const message = `<p>In a world where we are constantly reminded of what we do not have, may we never forget to appreciate what we already do.</p><p>This November, remember the people who have stood beside you, the opportunities you have received, the memories you have made, and the quiet blessings that often go unnoticed.</p><p>Thankfulness does not mean pretending life is easy. If this season is difficult, you are welcome here exactly as you are. Even a small moment of comfort or kindness can be worth remembering.</p><p>May gratitude extend beyond Thanksgiving Day and become something we carry with us every day.</p>`;
  const reflection = `<aside class="tpp-gratitude-reflection"><small>Scripture for the season</small><blockquote>In every thing give thanks.</blockquote><p>1 Thessalonians 5:18 (KJV)</p><small>Today's gratitude challenge</small><p>${prompt}</p></aside>`;
  if (home) {
    const feature = document.createElement("section");
    feature.className = "tpp-gratitude tpp-gratitude-feature";
    feature.id = "tppGratitudeFeature";
    feature.innerHTML = `<div class="tpp-gratitude-inner"><div><small>A season of thanksgiving • November</small><h2>Remain thankful.</h2>${message}<div class="tpp-gratitude-actions"><a href="#submit">Ask for prayer</a><a href="#wall">Pray for someone</a></div></div>${reflection}</div>`;
    const hero = document.querySelector(".home-hero");
    if (hero) hero.after(feature); else document.querySelector("main")?.prepend(feature);
  }
  const dialog = document.createElement("dialog");
  dialog.className = "tpp-gratitude tpp-gratitude-dialog";
  dialog.setAttribute("aria-labelledby","tppGratitudeTitle");
  dialog.innerHTML = `<button class="tpp-gratitude-close" type="button" data-gratitude-close aria-label="Close Thanksgiving message">×</button><small>The Prayer Project • A Month of Gratitude</small><h2 id="tppGratitudeTitle">${greeting}</h2>${message}${reflection}<div class="tpp-gratitude-actions"><button type="button" data-gratitude-close>Continue to website</button><a href="index.html#submit">Request prayer</a></div>`;
  document.body.appendChild(dialog);
  const key = "tpp-gratitude-seen-" + now.getFullYear();
  let seen = false;
  try { seen = localStorage.getItem(key) === "1"; } catch (_) {}
  const open = () => { if (!dialog.open && typeof dialog.showModal === "function") dialog.showModal(); };
  banner.querySelector("button").addEventListener("click", open);
  dialog.querySelectorAll("[data-gratitude-close]").forEach(b => b.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("close", () => { if (!preview) { try { localStorage.setItem(key,"1"); } catch (_) {} } });
  if ((home && !seen || preview) && !document.getElementById("tppSuicidePreventionModal")) open();
}
