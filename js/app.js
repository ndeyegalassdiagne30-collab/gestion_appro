import { renderSidebar } from "./components/sidebar.js";
import { renderNavbar } from "./components/navbar.js";
import { navigate, initRouter } from "./router.js";

function mountLayout() {
  document.getElementById("sidebarRoot").innerHTML = renderSidebar();
  document.getElementById("navbarRoot").innerHTML = renderNavbar();
}

function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggle = document.getElementById("sidebarToggle");

  const close = () => {
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (overlay) overlay.classList.add("hidden");
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (sidebar) sidebar.classList.remove("-translate-x-full");
      if (overlay) overlay.classList.remove("hidden");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", close);
  }

  return { close };
}

function initNavigation(sidebar) {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigate(button.dataset.page);
      if (window.innerWidth < 1024) sidebar.close();
    });
  });
}

function startApp() {
  mountLayout();
  const sidebar = initSidebar();
  initNavigation(sidebar);
  initRouter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}