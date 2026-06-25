import { showToast } from "./components/toast.js";
import { renderCategoriesPage } from "./pages/categoriesPage.js";
import { renderProduitsPage } from "./pages/produitsPage.js";
import { renderfournisseursPage } from "./pages/fournisseursPage.js";
import { isAdmin, isFournisseur } from "./services/authService.js";

const routes = {
  categories: renderCategoriesPage,
  produits: renderProduitsPage,
  fournisseurs: renderfournisseursPage,
};

const titles = {
  categories: "Catégories",
  produits: "Produits",
  fournisseurs: "Fournisseurs",
};
//Détermine la page par défaut affichée après la connexion
function getDefaultPage() {
  return isAdmin() ? "categories" : "produits";
}
//Vérifie si un utilisateur a le droit d'accéder à une page spécifique
function isPageAllowed(page) {
  if (isAdmin()) 
    return true;
  if (isFournisseur()) 
    return page === "produits";
  return false;
}

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') || getDefaultPage();
}

function updateURL(page) {
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  window.history.pushState({ page }, '', url);
}

export async function navigate(page) {
  if (!page) page = getDefaultPage();

  if (!isPageAllowed(page)) {
    page = getDefaultPage();
  }

  updateURL(page);

  const app = document.getElementById("app");
  const route = routes[page] || routes[getDefaultPage()];

  document.querySelectorAll("[data-page]").forEach((button) => {
    const isActive = button.dataset.page === page;
    button.classList.toggle("bg-slate-950", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-lg", isActive);
    button.classList.toggle("shadow-slate-200", isActive);
    button.classList.toggle("text-slate-600", !isActive);
    button.classList.toggle("hover:bg-slate-100", !isActive);
    button.classList.toggle("hover:text-slate-950", !isActive);
  });

  const navbarTitle = document.getElementById("navbarTitle");
  if (navbarTitle) {
    navbarTitle.textContent = titles[page] || titles[getDefaultPage()];
  }

  app.innerHTML = `
    <div class="grid min-h-[50vh] place-items-center rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div>
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p class="mt-4 text-sm font-bold text-slate-500">Chargement...</p>
      </div>
    </div>
  `;

  try {
    await route();
  } catch (error) {
    app.innerHTML = `
      <section class="rounded-[2rem] border border-rose-200 bg-white p-8 shadow-sm">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-slate-950">Erreur de chargement</h1>
        <p class="mt-2 text-sm leading-6 text-slate-600">${error.message}</p>
        <p class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Vérifie que JSON Server est bien lancé avec :
          <strong class="font-black text-slate-950">npx json-server db.json --port 3000</strong>
        </p>
      </section>
    `;
    showToast(error.message, "error");
  }
}

window.addEventListener('popstate', (event) => {
  const page = event.state?.page || getPageFromURL();
  navigate(page);
});

export function initRouter() {
  const page = getPageFromURL();
  navigate(page);
}
