/* ---------- Konfigurasi ---------- */
const CONFIG = {
  // Nombor WhatsApp dalam format antarabangsa tanpa "+" atau sengkang, cth: "60123456789".
  // Biarkan kosong untuk menyembunyikan butang WhatsApp.
  whatsappNumber: "",
  whatsappMessage: "Salam Nafi, saya berminat untuk berbincang tentang projek aplikasi dengan PwaStudio.",
};

const STATUS_LABEL = {
  live: "Dalam talian",
  built: "Dibangunkan",
  planned: "Dirancang",
  concept: "Konsep",
};

/* ---------- Utiliti ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Tema ---------- */
(function theme() {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (_) {}
  if (saved) root.dataset.theme = saved;

  $("#themeToggle").addEventListener("click", () => {
    const isDark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
  });
})();

/* ---------- Menu mudah alih ---------- */
(function menu() {
  const btn = $("#menuToggle");
  const links = $("#navLinks");
  const close = () => {
    links.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach((a) => a.addEventListener("click", close));
  window.addEventListener("scroll", () => $("#nav").classList.toggle("is-scrolled", scrollY > 8), { passive: true });
})();

/* ---------- Kad projek ---------- */
function projectCard(p) {
  const tags = (p.tags || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const tech = p.tech ? `<p class="card__tech"><span>Teknologi:</span> ${p.tech.map(esc).join(" · ")}</p>` : "";
  const extra = (p.extra || [])
    .map((e) => `<p class="card__meta"><span>${esc(e.label)}:</span> ${esc(e.value)}</p>`)
    .join("");
  const objective = p.objective ? `<p class="card__objective"><span>Objektif:</span> ${esc(p.objective)}</p>` : "";
  const features = p.features
    ? `<details class="card__details">
         <summary>${esc(p.featuresLabel || "Fungsi")} <span class="count">${p.features.length}</span></summary>
         <ul class="card__features">${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
       </details>`
    : "";
  const link = p.link
    ? `<a class="btn btn--sm card__link" href="${esc(p.link)}" target="_blank" rel="noopener">Buka aplikasi ↗</a>`
    : "";

  return `
    <article class="card${p.status === "live" ? " card--featured" : ""}" data-group="${esc(p.group)}">
      <header class="card__head">
        <span class="card__icon" aria-hidden="true">${p.icon || "✨"}</span>
        <span class="card__no">${esc(p.no)}</span>
        <span class="status status--${esc(p.status)}">${STATUS_LABEL[p.status] || ""}</span>
      </header>
      <h3 class="card__title">${esc(p.title)}</h3>
      <p class="card__subtitle">${esc(p.subtitle)}</p>
      <ul class="card__tags">${tags}</ul>
      <p class="card__desc">${esc(p.description)}</p>
      ${extra}
      ${features}
      ${objective}
      ${tech}
      ${link}
    </article>`;
}

(function renderProjects() {
  const grid = $("#projectGrid");
  const list = window.PROJECTS || [];
  grid.innerHTML = list.map(projectCard).join("");
  $("#statProjects").textContent = list.length;

  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      $$(".filter").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      $$(".card", grid).forEach((card) => {
        card.hidden = f !== "all" && card.dataset.group !== f;
      });
    })
  );
})();

/* ---------- Animasi muncul ---------- */
(function reveal() {
  const items = $$(".section h2, .card, .focus__card, .skill-group, .cta");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  items.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

/* ---------- WhatsApp & tahun ---------- */
(function contact() {
  const wa = $("#waButton");
  if (CONFIG.whatsappNumber) {
    wa.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    wa.hidden = false;
  }
  $("#year").textContent = new Date().getFullYear();
})();

/* ---------- PWA ---------- */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
