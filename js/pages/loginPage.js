import { login } from "../services/authService.js";

export function renderLoginPage() {
  document.getElementById("sidebarRoot").innerHTML = "";
  document.getElementById("navbarRoot").innerHTML = "";

  document.body.className = "min-h-screen font-sans text-slate-900";
  document.querySelector("main").className = "min-h-screen pt-0 lg:pl-0";
  document.getElementById("app").className = "";

  document.getElementById("app").innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-indigo-600 p-4">

      <!-- Card de connexion -->
      <div class="w-full max-w-md">

        <!-- Logo + titre -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg">
            <i class="fa-solid fa-layer-group text-2xl text-white"></i>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-white">Gestion Appro</h1>
          <p class="mt-1 text-sm text-indigo-200">L2 221 — 2025/2026</p>
        </div>

        <!-- Formulaire -->
        <div class="rounded-3xl bg-indigo-700 p-8 shadow-2xl">
          <h2 class="mb-1 text-xl font-black text-white">Connexion</h2>
          <p class="mb-6 text-sm text-indigo-300">Accédez à votre espace de gestion</p>

          <div id="loginError" class="mb-4 hidden rounded-2xl bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-200 border border-rose-400/30"></div>

          <form id="loginForm" novalidate>
            <!-- Email -->
            <div class="mb-4">
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-200" for="loginEmail">
                Adresse email
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-300">
                  <i class="fa-solid fa-envelope text-sm"></i>
                </div>
                <input
                  class="w-full rounded-2xl border border-indigo-500 bg-indigo-600 py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-indigo-400 focus:border-white focus:ring-4 focus:ring-white/20"
                  type="email"
                  id="loginEmail"
                  placeholder="admin@gestion.com"
                  autocomplete="email"
                />
              </div>
              <p id="loginEmailError" class="mt-1 hidden text-xs font-semibold text-rose-300"></p>
            </div>

            <!-- Mot de passe -->
            <div class="mb-6">
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-200" for="loginPassword">
                Mot de passe
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-indigo-300">
                  <i class="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  class="w-full rounded-2xl border border-indigo-500 bg-indigo-600 py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-indigo-400 focus:border-white focus:ring-4 focus:ring-white/20"
                  type="password"
                  id="loginPassword"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
              <p id="loginPasswordError" class="mt-1 hidden text-xs font-semibold text-rose-300"></p>
            </div>

            <!-- Bouton -->
            <button
              type="submit"
              id="loginBtn"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i class="fa-solid fa-right-to-bracket"></i>
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  `;

  bindLoginEvents();
}

function bindLoginEvents() {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("loginError");
  const emailError = document.getElementById("loginEmailError");
  const passwordError = document.getElementById("loginPasswordError");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorBox.classList.add("hidden");
    emailError.classList.add("hidden");
    passwordError.classList.add("hidden");

    const email = emailInput.value.trim();
    const motDePasse = passwordInput.value;

    let hasErrors = false;

    if (!email) {
      emailError.textContent = "L'email est requis";
      emailError.classList.remove("hidden");
      hasErrors = true;
    }

    if (!motDePasse) {
      passwordError.textContent = "Le mot de passe est requis";
      passwordError.classList.remove("hidden");
      hasErrors = true;
    }

    if (hasErrors) return;

    loginBtn.disabled = true;
    loginBtn.innerHTML = `
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700"></div>
      Connexion en cours...
    `;

    try {
      await login(email, motDePasse);
      window.location.reload();
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.classList.remove("hidden");
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `
        <i class="fa-solid fa-right-to-bracket"></i>
        Se connecter
      `;
    }
  });
}
