function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function logout() {
  clearAuth();
  window.location.href = "index.html";
}

function showFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = "message " + type;
  el.style.display = "block";
}

function populateNav() {
  const nav = document.getElementById("navLinks");
  if (!nav) return;
  let html = '<li><a href="index.html">Home</a></li>';
  html += '<li><a href="books.html">Books</a></li>';
  html += '<li><a href="admin-books.html">Admin</a></li>';
  nav.innerHTML = html;
}

function setupHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const messageEl = document.getElementById("registerMessage");
  messageEl.style.display = "none";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let valid = true;
  document.querySelectorAll(".field-error").forEach((e) => (e.style.display = "none"));

  if (!name) {
    showFieldError("nameError");
    valid = false;
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    showFieldError("emailError");
    valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError("passwordError");
    valid = false;
  }
  if (!valid) return;

  document.getElementById("registerBtn").disabled = true;
  document.getElementById("registerBtn").textContent = "Registering...";

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (err) {
    showMessage(messageEl, err.message, "error");
  } finally {
    document.getElementById("registerBtn").disabled = false;
    document.getElementById("registerBtn").textContent = "Register";
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const messageEl = document.getElementById("loginMessage");
  messageEl.style.display = "none";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let valid = true;
  document.querySelectorAll(".field-error").forEach((e) => (e.style.display = "none"));

  if (!email) {
    showFieldError("emailError");
    valid = false;
  }
  if (!password) {
    showFieldError("passwordError");
    valid = false;
  }
  if (!valid) return;

  document.getElementById("loginBtn").disabled = true;
  document.getElementById("loginBtn").textContent = "Logging in...";

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (err) {
    showMessage(messageEl, err.message, "error");
  } finally {
    document.getElementById("loginBtn").disabled = false;
    document.getElementById("loginBtn").textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateNav();
  setupHamburger();
});
