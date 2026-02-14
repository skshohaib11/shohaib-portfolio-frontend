/* ============================================================
   CONFIG — must match backend port
============================================================ */
const API_BASE = "http://localhost:3000/api/cms";
const token    = localStorage.getItem("token");

/* Redirect if not logged in */
if (!token) window.location.href = "login.html";

/* ============================================================
   HELPERS
============================================================ */
async function fetchCMS() {
  const res = await fetch(`${API_BASE}/content`);
  if (!res.ok) throw new Error("Failed to fetch content");
  return res.json();
}

async function apiRequest(url, method, body = null) {
  const headers = { Authorization: `Bearer ${token}` };
  const options = { method, headers };

  if (body instanceof FormData) {
    /* Do NOT set Content-Type — browser sets it with boundary */
    options.body = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const ct  = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return { ok: res.ok };
}

function setStatus(elId, msg, ok = true) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className   = ok ? "status-ok" : "status-err";
  setTimeout(() => { el.textContent = ""; el.className = ""; }, 5000);
}

/* ============================================================
   HERO
============================================================ */
async function loadHero() {
  try {
    const cms = await fetchCMS();
    if (!cms.hero) return;
    document.getElementById("hero-name").value    = cms.hero.name    || "";
    document.getElementById("hero-title").value   = cms.hero.title   || "";
    document.getElementById("hero-tagline").value = cms.hero.tagline || "";
  } catch (e) { setStatus("hero-status", "Failed to load hero data", false); }
}

async function updateHero() {
  const name    = document.getElementById("hero-name").value.trim();
  const title   = document.getElementById("hero-title").value.trim();
  const tagline = document.getElementById("hero-tagline").value.trim();
  if (!name || !title || !tagline) {
    setStatus("hero-status", "All fields are required", false);
    return;
  }
  try {
    const data = await apiRequest(`${API_BASE}/hero`, "PUT", { name, title, tagline });
    setStatus("hero-status", data.message || "Hero updated ✅");
  } catch { setStatus("hero-status", "Failed to update hero", false); }
}

/* ============================================================
   SKILLS
============================================================ */
async function loadSkills() {
  const container = document.getElementById("skills-list");
  if (!container) return;
  try {
    const cms = await fetchCMS();
    container.innerHTML = "";
    cms.skillCategories.forEach(cat => {
      const block = document.createElement("div");
      block.innerHTML = `<h4>${cat.title}</h4>`;
      const group = document.createElement("div");
      group.className = "skills-group";
      cat.items.forEach((item, i) => {
        const pill = document.createElement("span");
        pill.className = "skill-item";
        pill.innerHTML = `${item} <button onclick="deleteSkill('${cat.id}',${i})" title="Remove">✕</button>`;
        group.appendChild(pill);
      });
      block.appendChild(group);
      container.appendChild(block);
    });
  } catch { container.innerHTML = `<p style="color:#ff6b6b;font-size:12px">Failed to load skills</p>`; }
}

async function addSkill() {
  const category = document.getElementById("skill-category").value;
  const name     = document.getElementById("skill-name").value.trim();
  if (!name) { setStatus("skill-status", "Enter a skill name", false); return; }
  try {
    const data = await apiRequest(`${API_BASE}/skill-categories/${category}/items`, "POST", { name });
    setStatus("skill-status", data.message || "Skill added ✅");
    document.getElementById("skill-name").value = "";
    loadSkills();
  } catch { setStatus("skill-status", "Failed to add skill", false); }
}

async function deleteSkill(catId, idx) {
  try {
    await apiRequest(`${API_BASE}/skill-categories/${catId}/items/${idx}`, "DELETE");
    loadSkills();
  } catch { setStatus("skill-status", "Failed to delete skill", false); }
}

/* ============================================================
   PROJECTS
============================================================ */
async function loadProjects() {
  const container = document.getElementById("projects-list");
  if (!container) return;
  try {
    const cms = await fetchCMS();
    container.innerHTML = "";
    if (!(cms.projects || []).length) {
      container.innerHTML = `<p style="color:var(--t3);font-family:var(--font-m);font-size:11px">No projects yet.</p>`;
      return;
    }
    (cms.projects || []).forEach(p => {
      const div = document.createElement("div");
      div.className = "cms-item";
      div.innerHTML = `
        <div>
          <strong>${p.title}</strong>
          ${p.tools && p.tools.length ? `<br><span>${p.tools.join(", ")}</span>` : ""}
        </div>
        <button onclick="deleteProject('${p.id}')">Delete</button>`;
      container.appendChild(div);
    });
  } catch { container.innerHTML = `<p style="color:#ff6b6b;font-size:12px">Failed to load projects</p>`; }
}

async function addProject() {
  const title       = document.getElementById("project-title").value.trim();
  const tools       = document.getElementById("project-tools").value;
  const description = document.getElementById("project-description").value.trim();
  const link        = document.getElementById("project-link").value.trim();
  const imageFile   = document.getElementById("project-image").files[0];

  if (!title || !description) {
    setStatus("project-status", "Title and description are required", false);
    return;
  }

  const fd = new FormData();
  fd.append("title",       title);
  fd.append("tools",       tools);
  fd.append("description", description);
  fd.append("link",        link);
  if (imageFile) fd.append("image", imageFile);

  try {
    const data = await apiRequest(`${API_BASE}/projects`, "POST", fd);
    setStatus("project-status", data.message || "Project added ✅");
    ["project-title","project-tools","project-description","project-link"].forEach(id =>
      document.getElementById(id).value = "");
    document.getElementById("project-image").value = "";
    loadProjects();
  } catch { setStatus("project-status", "Failed to add project", false); }
}

async function deleteProject(id) {
  if (!confirm("Delete this project? This cannot be undone.")) return;
  try {
    const data = await apiRequest(`${API_BASE}/projects/${id}`, "DELETE");
    setStatus("project-status", data.message || "Deleted ✅");
    loadProjects();
  } catch { setStatus("project-status", "Failed to delete project", false); }
}

/* ============================================================
   EXPERIENCE
============================================================ */
async function loadExperience() {
  const container = document.getElementById("experience-list");
  if (!container) return;
  try {
    const cms = await fetchCMS();
    container.innerHTML = "";
    if (!(cms.experience || []).length) {
      container.innerHTML = `<p style="color:var(--t3);font-family:var(--font-m);font-size:11px">No experience yet.</p>`;
      return;
    }
    (cms.experience || []).forEach(exp => {
      const div = document.createElement("div");
      div.className = "cms-item";
      div.innerHTML = `
        <div>
          <strong>${exp.company}</strong>
          <br><span>${exp.designation}</span>
        </div>
        <button onclick="deleteExperience('${exp.id}')">Delete</button>`;
      container.appendChild(div);
    });
  } catch { container.innerHTML = `<p style="color:#ff6b6b;font-size:12px">Failed to load experience</p>`; }
}

async function addExperience() {
  const company          = document.getElementById("exp-company").value.trim();
  const designation      = document.getElementById("exp-designation").value.trim();
  const from             = document.getElementById("exp-from").value;
  const to               = document.getElementById("exp-to").value;
  const responsibilities = document.getElementById("exp-responsibilities").value;
  const logoFile         = document.getElementById("exp-logo").files[0];

  if (!company || !designation) {
    setStatus("exp-status", "Company and designation are required", false);
    return;
  }

  const fd = new FormData();
  fd.append("company",          company);
  fd.append("designation",      designation);
  fd.append("from",             from);
  fd.append("to",               to);
  fd.append("responsibilities", responsibilities);
  if (logoFile) fd.append("logo", logoFile);

  try {
    const data = await apiRequest(`${API_BASE}/experience`, "POST", fd);
    setStatus("exp-status", data.message || "Experience added ✅");
    ["exp-company","exp-designation","exp-responsibilities"].forEach(id =>
      document.getElementById(id).value = "");
    document.getElementById("exp-from").value  = "";
    document.getElementById("exp-to").value    = "";
    document.getElementById("exp-logo").value  = "";
    loadExperience();
  } catch { setStatus("exp-status", "Failed to add experience", false); }
}

async function deleteExperience(id) {
  if (!confirm("Delete this experience entry?")) return;
  try {
    const data = await apiRequest(`${API_BASE}/experience/${id}`, "DELETE");
    setStatus("exp-status", data.message || "Deleted ✅");
    loadExperience();
  } catch { setStatus("exp-status", "Failed to delete experience", false); }
}

/* ============================================================
   EDUCATION
============================================================ */
async function loadEducation() {
  const container = document.getElementById("education-list");
  if (!container) return;
  try {
    const cms = await fetchCMS();
    container.innerHTML = "";
    if (!(cms.education || []).length) {
      container.innerHTML = `<p style="color:var(--t3);font-family:var(--font-m);font-size:11px">No education yet.</p>`;
      return;
    }
    (cms.education || []).forEach(edu => {
      const div = document.createElement("div");
      div.className = "cms-item";
      div.innerHTML = `
        <div>
          <strong>${edu.institute}</strong>
          <br><span>${edu.degree}${edu.year ? " — " + edu.year : ""}</span>
        </div>
        <button onclick="deleteEducation('${edu.id}')">Delete</button>`;
      container.appendChild(div);
    });
  } catch { container.innerHTML = `<p style="color:#ff6b6b;font-size:12px">Failed to load education</p>`; }
}

async function addEducation() {
  const institute   = document.getElementById("edu-institute").value.trim();
  const degree      = document.getElementById("edu-degree").value.trim();
  const year        = document.getElementById("edu-year").value.trim();
  const description = document.getElementById("edu-description").value.trim();
  const imageFile   = document.getElementById("edu-image").files[0];

  if (!institute || !degree) {
    setStatus("edu-status", "Institute and degree are required", false);
    return;
  }

  const fd = new FormData();
  fd.append("institute",   institute);
  fd.append("degree",      degree);
  fd.append("year",        year);
  fd.append("description", description);
  if (imageFile) fd.append("image", imageFile);

  try {
    const data = await apiRequest(`${API_BASE}/education`, "POST", fd);
    setStatus("edu-status", data.message || "Education added ✅");
    ["edu-institute","edu-degree","edu-year","edu-description"].forEach(id =>
      document.getElementById(id).value = "");
    document.getElementById("edu-image").value = "";
    loadEducation();
  } catch { setStatus("edu-status", "Failed to add education", false); }
}

async function deleteEducation(id) {
  if (!confirm("Delete this education entry?")) return;
  try {
    const data = await apiRequest(`${API_BASE}/education/${id}`, "DELETE");
    setStatus("edu-status", data.message || "Deleted ✅");
    loadEducation();
  } catch { setStatus("edu-status", "Failed to delete education", false); }
}

/* ============================================================
   INIT — auto-loads the right data based on which page we're on
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("hero-name"))       loadHero();
  if (document.getElementById("skills-list"))     loadSkills();
  if (document.getElementById("projects-list"))   loadProjects();
  if (document.getElementById("experience-list")) loadExperience();
  if (document.getElementById("education-list"))  loadEducation();
});
