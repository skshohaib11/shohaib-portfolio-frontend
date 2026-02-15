const API = "https://shohaib-portfolio-backend-production.up.railway.app/api";

async function login() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const error    = document.getElementById("error");
  error.textContent = "";

  if (!email || !password) {
    error.textContent = "Please enter email and password";
    return;
  }

  try {
    const res  = await fetch(`${API}/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      error.textContent = data.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";

  } catch {
    error.textContent = "Cannot connect to server";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", e => {
    if (e.key === "Enter") login();
  });
});