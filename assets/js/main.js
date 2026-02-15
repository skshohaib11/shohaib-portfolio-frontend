/* ============================================================
   CONFIG
   ↓ Change to Railway URL when deploying
============================================================ */
const API_BASE = "https://shohaib-portfolio-backend-production.up.railway.app";
const API_URL  = `${API_BASE}/api/cms/content`;

/* ============================================================
   HELPERS
============================================================ */
function formatMonthYear(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* ============================================================
   BOOT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL)
    .then(r => r.json())
    .then(data => {
      renderHero(data.hero);
      renderSkills(data.skillCategories || []);
      renderProjects(data.projects      || []);
      renderExperience(data.experience  || []);
      renderEducation(data.education    || []);
    })
    .catch(() => console.warn("⚠️ Backend not running — showing static fallback content"));

  initNavbar();
  initSmoothScroll();
});

/* ============================================================
   HERO
============================================================ */
function renderHero(hero) {
  if (!hero) return;
  const titleEl   = document.getElementById("site-hero-title");
  const taglineEl = document.getElementById("site-hero-tagline");
  if (titleEl)   titleEl.textContent   = hero.title   || "";
  if (taglineEl) taglineEl.textContent = hero.tagline || "";
  // store name so inline typing script can use it
  window._cmsHeroName = hero.name || "";
}

/* ============================================================
   SKILLS
============================================================ */
function renderSkills(categories) {
  const container = document.getElementById("skills-sections");
  if (!container) return;
  container.innerHTML = "";
  categories.forEach((cat, i) => {
    const section = document.createElement("div");
    section.className = "sk-card";
    section.innerHTML = `
      <h4>${cat.title}</h4>
      <div class="chips">
        ${cat.items.map(item => `<span class="chip">${item}</span>`).join("")}
      </div>`;
    container.appendChild(section);
    setTimeout(() => section.classList.add("vis"), i * 80);
  });
}

/* ============================================================
   PROJECTS
============================================================ */
function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container) return;
  container.innerHTML = "";
  if (!projects.length) {
    container.innerHTML = `<p style="color:var(--t3);font-family:var(--font-m);font-size:12px;letter-spacing:2px">// No projects yet — add one via the admin panel.</p>`;
    return;
  }
  projects.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "p-card";
    const imgHTML = p.image
      ? `<div class="p-img"><img src="${API_BASE}${p.image}" alt="${p.title}" loading="lazy"/></div>`
      : `<div class="p-img-ph"><span>${p.title}</span></div>`;
    card.innerHTML = `
      ${imgHTML}
      <div class="p-body">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${p.tools && p.tools.length
          ? `<div class="p-tools">${p.tools.map(t => `<span class="p-tool">${t}</span>`).join("")}</div>`
          : ""}
        ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="p-link" onclick="event.stopPropagation()">View Project</a>` : ""}
      </div>`;
    if (p.link) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => window.open(p.link, "_blank"));
    }
    container.appendChild(card);
    setTimeout(() => card.classList.add("vis"), i * 100);
  });
}

/* ============================================================
   EXPERIENCE
============================================================ */
function renderExperience(experience) {
  const container = document.getElementById("experience-container");
  if (!container) return;
  container.innerHTML = "";
  experience.forEach((exp, i) => {
    const div   = document.createElement("div");
    div.className = "exp-card";
    const resps = Array.isArray(exp.responsibilities) ? exp.responsibilities : [];
    const initLetter = (exp.company || "?")[0].toUpperCase();
    const logoHTML = exp.logo
      ? `<div class="exp-logo"><img src="${API_BASE}${exp.logo}" alt="${exp.company}"
           onerror="this.parentElement.innerHTML='<span class=\\'exp-init\\'>${initLetter}</span>'"/></div>`
      : `<div class="exp-logo"><span class="exp-init">${initLetter}</span></div>`;
    div.innerHTML = `
      ${logoHTML}
      <div class="exp-content">
        <h4>${exp.company}</h4>
        <p class="exp-desig">${exp.designation}</p>
        <p class="exp-dur">${formatMonthYear(exp.from)} — ${exp.to ? formatMonthYear(exp.to) : "Present"}</p>
        <ul>${resps.map(r => `<li>${r}</li>`).join("")}</ul>
      </div>`;
    container.appendChild(div);
    setTimeout(() => div.classList.add("vis"), i * 120);
  });
}

/* ============================================================
   EDUCATION
============================================================ */
function renderEducation(education) {
  const container = document.getElementById("education-container");
  if (!container) return;
  container.innerHTML = "";
  education.forEach((edu, i) => {
    const div   = document.createElement("div");
    div.className = "edu-card";
    const initLetter = (edu.institute || "?")[0].toUpperCase();
    const logoHTML = edu.image
      ? `<div class="edu-logo"><img src="${API_BASE}${edu.image}" alt="${edu.institute}"
           onerror="this.parentElement.innerHTML='<span class=\\'edu-init\\'>${initLetter}</span>'"/></div>`
      : `<div class="edu-logo"><span class="edu-init">${initLetter}</span></div>`;
    div.innerHTML = `
      ${logoHTML}
      <div class="edu-content">
        <h4>${edu.institute}</h4>
        <p class="edu-deg">${edu.degree}</p>
        ${edu.year        ? `<p class="edu-yr">${edu.year}</p>`         : ""}
        ${edu.description ? `<p class="edu-desc">${edu.description}</p>` : ""}
      </div>`;
    container.appendChild(div);
    setTimeout(() => div.classList.add("vis"), i * 120);
  });
}

/* ============================================================
   NAVBAR SCROLL
============================================================ */
function initNavbar() {
  const navbar = document.getElementById("nav");
  if (!navbar) return;
  window.addEventListener("scroll", () => navbar.classList.toggle("sc", scrollY > 50), { passive: true });
}

/* ============================================================
   SMOOTH SCROLL
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
