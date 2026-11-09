/* ---------- Config ---------- */
const CONFIG = {
  // WhatsApp number in international format, no "+" or dashes, e.g. "60123456789".
  // Leave empty to hide the WhatsApp button.
  whatsappNumber: "60196971080",
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
function projectTile(p, i) {
  const no = String(i + 1).padStart(2, "0");
  const newBadge = p.isNew ? `<span class="badge badge--new">New</span>` : "";
  const tags = (p.tags || []).slice(0, p.size ? 3 : 2).map((t) => `<span>${esc(t)}</span>`).join("");
  const preview =
    (p.size === "xl" || p.size === "tall") && p.features
      ? `<span class="project__preview">${p.features.slice(0, p.size === "xl" ? 8 : 5).map((f) => `<span>${esc(f)}</span>`).join("")}</span>`
      : "";
  return `
    <button type="button" class="tile tile--project${p.size ? " size-" + p.size : ""}" data-id="${esc(p.id)}" data-group="${esc(p.group)}" data-reveal aria-haspopup="dialog">
      <span class="project__head">
        <span class="project__no">${no}</span>
        ${newBadge}
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
        <span class="badge badge--${esc(p.status)}">${STATUS_LABEL[p.status]}</span>${p.isNew ? ` <span class="badge badge--new">New</span>` : ""}
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

/* ---------- Live preview carousel (phone mockups with the real apps) ---------- */
(function live() {
  const track = $("#liveTrack");
  const dotsWrap = $("#liveDots");
  const section = $("#live");
  const apps = (window.PROJECTS || []).filter((p) => p.link);
  if (!track || !apps.length) { if (section) section.hidden = true; return; }

  track.innerHTML = apps.map((p, i) => `
    <li class="slide" data-index="${i}" aria-roledescription="slide" aria-label="${i + 1} of ${apps.length}: ${esc(p.title)}">
      <div class="phone">
        <div class="phone__screen">
          <div class="phone__placeholder" aria-hidden="true"><span>${p.icon || "✨"}</span><strong>${esc(p.title)}</strong><small>Loading live app…</small></div>
          <iframe title="Live preview of ${esc(p.title)}" data-src="${esc(p.link)}" tabindex="-1" loading="lazy"
            sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe>
        </div>
      </div>
      <div class="slide__meta">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.subtitle)}</p>
        <a class="btn btn--primary btn--sm" href="${esc(p.link)}" target="_blank" rel="noopener" tabindex="-1">Open the app <span aria-hidden="true">↗</span></a>
      </div>
    </li>`).join("");
  dotsWrap.innerHTML = apps.map((p, i) =>
    `<button type="button" role="tab" aria-label="${esc(p.title)}" aria-selected="false" data-dot="${i}"></button>`).join("");

  const slides = $$(".slide", track);
  const dots = $$("[data-dot]", dotsWrap);
  let active = -1, nearView = false;

  const load = (i) => {
    const f = slides[i] && $("iframe", slides[i]);
    if (!f || f.getAttribute("src")) return;
    f.addEventListener("load", () => f.classList.add("is-loaded"), { once: true });
    f.src = f.dataset.src;
  };
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    slides.forEach((sl, k) => {
      const on = k === i;
      sl.classList.toggle("is-active", on);
      $("a", sl).tabIndex = on ? 0 : -1;
    });
    dots.forEach((d, k) => d.setAttribute("aria-selected", String(k === i)));
    if (nearView) [i - 1, i, i + 1].forEach(load);
  };
  const goTo = (i, smooth = true) => {
    const n = slides.length, k = ((i % n) + n) % n, sl = slides[k];
    track.scrollTo({ left: sl.offsetLeft - (track.clientWidth - sl.offsetWidth) / 2, behavior: smooth && !reduced ? "smooth" : "auto" });
    setActive(k);
  };
  const nearest = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, dist = Infinity;
    slides.forEach((sl, k) => {
      const d = Math.abs(sl.offsetLeft + sl.offsetWidth / 2 - mid);
      if (d < dist) { dist = d; best = k; }
    });
    return best;
  };

  let raf = 0;
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => setActive(nearest()));
  }, { passive: true });

  /* Autoplay: only while visible, not hovered/focused, and never with reduced motion */
  let hold = 0, hovering = false, inView = false;
  const pause = () => { hold = Date.now() + 9000; };

  track.addEventListener("click", (e) => {
    const sl = e.target.closest(".slide");
    if (sl && !sl.classList.contains("is-active")) { e.preventDefault(); goTo(+sl.dataset.index); pause(); }
  });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); pause(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); pause(); }
  });
  $("[data-carousel-prev]").addEventListener("click", () => { goTo(active - 1); pause(); });
  $("[data-carousel-next]").addEventListener("click", () => { goTo(active + 1); pause(); });
  dots.forEach((d) => d.addEventListener("click", () => { goTo(+d.dataset.dot); pause(); }));

  section.addEventListener("pointerenter", () => (hovering = true));
  section.addEventListener("pointerleave", () => (hovering = false));
  track.addEventListener("pointerdown", pause, { passive: true });
  track.addEventListener("touchstart", pause, { passive: true });
  if (!reduced) setInterval(() => {
    if (inView && !hovering && !document.hidden && Date.now() > hold && !section.contains(document.activeElement)) goTo(active + 1);
  }, 4500);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => {
      inView = e.isIntersecting;
      if (e.isIntersecting && !nearView) { nearView = true; [active - 1, active, active + 1].forEach(load); }
    }), { rootMargin: "200px 0px" }).observe(section);
  } else { nearView = true; }

  /* Scale each 390px-wide iframe so the real app fills the phone screen exactly */
  const fit = () => slides.forEach((sl) => {
    const screen = $(".phone__screen", sl), f = $("iframe", sl);
    const k = screen.clientWidth / 390;
    f.style.transform = `scale(${k})`;
    f.style.height = screen.clientHeight / k + "px";
  });
  fit();
  addEventListener("resize", () => { fit(); goTo(active, false); });
  // Start on the newest app when there are phones to show on both sides
  const start = Math.max(0, apps.findIndex((p) => p.isNew));
  requestAnimationFrame(() => goTo(slides.length > 2 ? start : 0, false));
})();

/* ---------- Skills carousel ---------- */
(function skills() {
  const list = window.SKILLS || [];
  const a = $("#skillsRowA"), b = $("#skillsRowB");
  if (!a || !list.length) return;
  const card = (s, hidden) => {
    const mono = s.color === "currentColor";
    return `
    <li class="skill"${hidden ? ' aria-hidden="true"' : ""}>
      <div class="skill__card" style="--brand:${mono ? "var(--text)" : esc(s.color)}"${mono ? " data-mono" : ""}>
        <div class="skill__top">
          <span class="skill__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${esc(s.path)}"/></svg></span>
          <div><div class="skill__name">${esc(s.name)}</div><div class="skill__note">${esc(s.note)}</div></div>
        </div>
        <div class="skill__label"><span>Proficiency</span><b>${s.level}%</b></div>
        <div class="skill__bar" role="progressbar" aria-label="${esc(s.name)} proficiency" aria-valuenow="${s.level}" aria-valuemin="0" aria-valuemax="100"><i style="--lvl:${s.level}%"></i></div>
      </div>
    </li>`;
  };
  // Each row holds the list twice so the CSS loop (translateX -50%) is seamless.
  a.innerHTML = list.map((s) => card(s)).join("") + list.map((s) => card(s, true)).join("");
  const rev = [...list].reverse();
  b.innerHTML = rev.map((s) => card(s, true)).join("").repeat(2);
})();

/* ---------- Typing code editor ---------- */
(function code() {
  const el = $("#codeTyping");
  if (!el) return;
  const n = (window.PROJECTS || []).length;
  const T = [
    ["c", "// PwaStudio — apps for real businesses\n"],
    ["k", "const "], ["v", "pwaStudio"], ["p", " = {\n"],
    ["", "  owner"], ["p", ": "], ["s", '"Nafi"'], ["p", ",\n"],
    ["", "  basedIn"], ["p", ": "], ["s", '"Taiping, Perak"'], ["p", ",\n"],
    ["", "  stack"], ["p", ": ["], ["s", '"HTML"'], ["p", ", "], ["s", '"CSS"'], ["p", ", "], ["s", '"JS"'], ["p", ", "], ["s", '"Firebase"'], ["p", "],\n"],
    ["", "  liveApps"], ["p", ": "], ["n", String(n)], ["p", ",\n"],
    ["", "  "], ["f", "build"], ["p", "(idea) {\n"],
    ["k", "    return "], ["", "idea."], ["f", "toPWA"], ["p", "()."], ["f", "mobileFirst"], ["p", "()."], ["f", "launch"], ["p", "();\n"],
    ["p", "  },\n};\n\n"],
    ["", "pwaStudio."], ["f", "build"], ["p", "("], ["s", '"your next app"'], ["p", ");"], ["c", " // 🚀"],
  ].map(([c, t]) => [c, Array.from(t)]);
  const total = T.reduce((x, [, t]) => x + t.length, 0);
  const lines = T.reduce((x, [, t]) => x + t.filter((ch) => ch === "\n").length, 1);
  el.parentElement.style.minHeight = `calc(${lines} * 1.75em + 2.7rem)`;

  const render = (count) => {
    let left = count, html = "";
    for (const [c, t] of T) {
      if (left <= 0) break;
      const part = esc(t.slice(0, left).join(""));
      html += c ? `<span class="tok-${c}">${part}</span>` : part;
      left -= t.length;
    }
    el.innerHTML = html;
  };
  let timer = 0;
  const play = () => {
    clearTimeout(timer);
    if (reduced) { render(total); return; }
    let i = 0;
    const step = () => {
      i = Math.min(total, i + 1 + Math.floor(Math.random() * 3));
      render(i);
      if (i < total) timer = setTimeout(step, 14 + Math.random() * 22);
    };
    step();
  };
  $("#codeReplay").addEventListener("click", play);
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { threshold: 0.4 });
    io.observe(el);
  } else play();
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
  const stat = $("[data-count-projects]");
  if (stat && n) stat.dataset.count = n;
})();

/* ---------- PWA ---------- */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
