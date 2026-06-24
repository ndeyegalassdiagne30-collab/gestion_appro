import { login } from "../services/authService.js";

export function renderLoginPage() {
  document.getElementById("sidebarRoot").innerHTML = "";
  document.getElementById("navbarRoot").innerHTML = "";

  document.body.className = "min-h-screen font-sans text-slate-900";
  document.querySelector("main").className = "min-h-screen pt-0 lg:pl-0";
  document.getElementById("app").className = "";

  document.getElementById("app").innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-white p-4">

      <!-- Card de connexion -->
      <div class="w-full max-w-md">

        <!-- Logo + titre -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-200">
            <i class="fa-solid fa-layer-group text-2xl text-white"></i>
          </div>
          <h1 class="text-3xl font-black tracking-tight text-slate-950">Gestion Appro</h1>
        </div>

        <!-- Formulaire -->
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <h2 class="mb-1 text-xl font-black text-slate-950">Connexion</h2>
          <p class="mb-6 text-sm text-slate-500">Accédez à votre espace de gestion</p>

          <div id="loginError" class="mb-4 hidden rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"></div>

          <form id="loginForm" novalidate>
            <!-- Email -->
            <div class="mb-4">
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="loginEmail">
                Adresse email
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <i class="fa-solid fa-envelope text-sm"></i>
                </div>
                <input
                  class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  type="email"
                  id="loginEmail"
                  placeholder="admin@gestion.com"
                  autocomplete="email"
                />
              </div>
              <p id="loginEmailError" class="mt-1 hidden text-xs font-semibold text-rose-500"></p>
            </div>

            <!-- Mot de passe -->
            <div class="mb-6">
              <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="loginPassword">
                Mot de passe
              </label>
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <i class="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  type="password"
                  id="loginPassword"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
              <p id="loginPasswordError" class="mt-1 hidden text-xs font-semibold text-rose-500"></p>
            </div>

            <!-- Bouton -->
            <button
              type="submit"
              id="loginBtn"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
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
