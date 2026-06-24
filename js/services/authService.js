import { API_BASE_URL } from "../config/api.js";

const AUTH_KEY = "gestion_appro_user";

export function getCurrentUser() {
  const stored = localStorage.getItem(AUTH_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function isFournisseur() {
  const user = getCurrentUser();
  return user?.role === "fournisseur";
}

export async function login(email, motDePasse) {
  const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Erreur de connexion au serveur");

  const users = await response.json();
  const user = users.find(u => u.email === email && u.motDePasse === motDePasse);

  if (!user) throw new Error("Email ou mot de passe incorrect");

  const { motDePasse: _, ...safeUser } = user;
  localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
  return safeUser;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
}
