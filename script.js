/* ---------- Config ---------- */
const CONFIG = {
  // WhatsApp number in international format, no "+" or dashes, e.g. "60123456789".
  // Leave empty to hide the WhatsApp button.
  whatsappNumber: "",
  whatsappMessage: "Hi Nafi, I'd like to discuss an app project with PwaStudio.",
};

const STATUS_LABEL = { live: "Live", built: "Built", planned: "In planning", concept: "Concept" };

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) document.documentElement.classList.add("reduced");

/* ---------- Theme ---------- */
$("#themeToggle").addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
});

/* ---------- Nav: mobile menu, scroll state, progress, scroll-spy pill ---------- */
(function nav() {
  const btn = $("#menuToggle");
  const links = $("#navLinks");
  const pill = $(".nav__pill");
  const navLinks = $$("[data-nav]");
  const progress = $("#progress");

  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  navLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav")) setMenu(false); });

  const movePill = (a) => {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      $("#nav").classList.toggle("is-scrolled", y > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

      let current = null;
      navLinks.forEach((a) => {
        const sec = $(a.getAttribute("href"));
        if (sec && sec.getBoundingClientRect().top <= innerHeight * 0.4) current = a;
      });
      navLinks.forEach((a) => a.classList.toggle("is-active", a === current));
      movePill(current);
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
})();

/* ---------- Project tiles ---------- */
function projectTile(p) {
  const tags = (p.tags || []).slice(0, p.size ? 3 : 2).map((t) => `<span>${esc(t)}</span>`).join("");
  const preview =
    (p.size === "xl" || p.size === "tall") && p.features
      ? `<span class="project__preview">${p.features.slice(0, p.size === "xl" ? 8 : 5).map((f) => `<span>${esc(f)}</span>`).join("")}</span>`
      : "";
  return `
    <button type="button" class="tile tile--project${p.size ? " size-" + p.size : ""}" data-id="${esc(p.id)}" data-group="${esc(p.group)}" data-reveal aria-haspopup="dialog">
      <span class="project__head">
        <span class="project__no">${esc(p.no)}</span>
        <span class="badge badge--${esc(p.status)}">${STATUS_LABEL[p.status]}</span>
      </span>
      <span class="project__icon" aria-hidden="true">${p.icon || "✨"}</span>
      <span class="project__title">${esc(p.title)}</span>
      <span class="project__sub">${esc(p.subtitle)}</span>
      <span class="project__summary">${esc(p.summary)}</span>
      ${preview}
      <span class="project__foot">
        <span class="project__tags">${tags}</span>
        <span class="project__more">Details <span aria-hidden="true">→</span></span>
      </span>
    </button>`;
}

function modalContent(p) {
  const list = (items) => items.map((x) => `<li>${esc(x)}</li>`).join("");
  return `
    <button type="button" class="icon-btn modal__close" data-close aria-label="Close">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="modal__head">
      <span class="project__icon" aria-hidden="true">${p.icon || "✨"}</span>
      <div>
        <span class="badge badge--${esc(p.status)}">${STATUS_LABEL[p.status]}</span>
        <h2 id="modalTitle">${esc(p.title)}</h2>
        <p class="modal__sub">${esc(p.subtitle)}</p>
      </div>
    </div>
    <p class="modal__desc">${esc(p.description)}</p>
    ${(p.extra || []).map((e) => `<div class="modal__block"><h3>${esc(e.label)}</h3><p>${esc(e.value)}</p></div>`).join("")}
    ${p.features ? `<div class="modal__block"><h3>${esc(p.featuresLabel || "Features")}</h3><ul class="modal__features">${list(p.features)}</ul></div>` : ""}
    ${p.objective ? `<div class="modal__block"><h3>Goal</h3><p class="modal__objective">${esc(p.objective)}</p></div>` : ""}
    ${p.tech ? `<div class="modal__block"><h3>Tech</h3><ul class="modal__meta">${list(p.tech)}</ul></div>` : ""}
    <div class="modal__block"><h3>Category</h3><ul class="modal__meta">${list(p.tags || [])}</ul></div>
    ${p.link ? `<a class="btn btn--primary" href="${esc(p.link)}" target="_blank" rel="noopener">Open the app <span aria-hidden="true">↗</span></a>` : ""}`;
}

(function work() {
  const grid = $("#projectGrid");
  const list = window.PROJECTS || [];
  grid.innerHTML = list.map(projectTile).join("");
  const tiles = $$(".tile--project", grid);

  /* Filter with sliding pill + FLIP layout animation */
  const filters = $$(".filter");
  const pill = $(".filters__pill");
  const movePill = (b) => {
    pill.style.width = b.offsetWidth + "px";
    pill.style.height = b.offsetHeight + "px";
    pill.style.top = b.offsetTop + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  };
  requestAnimationFrame(() => movePill($(".filter.is-active")));
  addEventListener("resize", () => movePill($(".filter.is-active")));

  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      movePill(btn);

      const first = new Map(tiles.filter((t) => !t.hidden).map((t) => [t, t.getBoundingClientRect()]));
      tiles.forEach((t) => {
        t.hidden = f !== "all" && t.dataset.group !== f;
        t.classList.add("is-visible");
      });
      if (reduced) return;
      tiles.forEach((t, i) => {
        if (t.hidden) return;
        const last = t.getBoundingClientRect();
        const prev = first.get(t);
        if (prev) {
          const dx = prev.left - last.left, dy = prev.top - last.top;
          const sx = prev.width / last.width, sy = prev.height / last.height;
          if (dx || dy || sx !== 1 || sy !== 1)
            t.animate(
              [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, transformOrigin: "0 0" }, { transform: "none", transformOrigin: "0 0" }],
              { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" }
            );
        } else {
          t.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], {
            duration: 500, delay: i * 25, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards",
          });
        }
      });
    })
  );

  /* Detail dialog */
  const modal = $("#projectModal");
  const body = $("#modalBody");
  let lastFocus = null;
  const close = () => {
    if (!modal.open || modal.classList.contains("is-closing")) return;
    if (reduced) { modal.close(); return; }
    modal.classList.add("is-closing");
    modal.addEventListener("animationend", () => { modal.classList.remove("is-closing"); modal.close(); }, { once: true });
  };
  modal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (location.hash.startsWith("#project-")) history.replaceState(null, "", location.pathname + location.search);
    lastFocus && lastFocus.focus({ preventScroll: true });
  });
  modal.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-close]")) close(); });

  const open = (id, trigger) => {
    const p = list.find((x) => x.id === id);
    if (!p) return;
    lastFocus = trigger || document.activeElement;
    body.innerHTML = modalContent(p);
    body.scrollTop = 0;
    modal.showModal();
    document.body.classList.add("modal-open");
    history.replaceState(null, "", "#project-" + id);
  };
  grid.addEventListener("click", (e) => {
    const t = e.target.closest(".tile--project");
    if (t) open(t.dataset.id, t);
  });
  if (location.hash.startsWith("#project-")) open(location.hash.slice(9));
})();

/* ---------- Pointer spotlight on tiles ---------- */
if (matchMedia("(hover: hover)").matches) {
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest(".tile");
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });
}

/* ---------- Reveal (staggered) + count-up ---------- */
(function reveal() {
  const items = $$("[data-reveal]");
  const counters = $$("[data-count]");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting);
    batch.forEach((e, i) => {
      e.target.style.setProperty("--d", Math.min(i, 6) * 70 + "ms");
      e.target.classList.add("is-visible");
      e.target.addEventListener("transitionend", () => e.target.style.removeProperty("--d"), { once: true });
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((el) => io.observe(el));

  const countUp = (el) => {
    const end = +el.dataset.count, suffix = el.dataset.suffix || "", t0 = performance.now(), dur = 1400;
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const co = new IntersectionObserver((entries) =>
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } })
  );
  counters.forEach((el) => co.observe(el));
})();

/* ---------- Contact + footer ---------- */
(function contact() {
  const wa = $("#waButton");
  if (CONFIG.whatsappNumber) {
    wa.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    wa.hidden = false;
  }
  $("#year").textContent = new Date().getFullYear();
  const n = (window.PROJECTS || []).length;
  const stat = $('[data-count="15"]');
  if (stat && n) stat.dataset.count = n;
})();

/* ---------- PWA ---------- */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
