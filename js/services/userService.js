import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";

export async function createUser(data) {
  const user = {
    id: createId("usr"),
    email: data.email,
    motDePasse: data.motDePasse,
    role: data.role || "fournisseur",
    nom: data.nom || "",
    fournisseurId: data.fournisseurId || null,
  };

  return apiRequest(
    ENDPOINTS.users,
    {
      method: "POST",
      body: JSON.stringify(user),
    },
    "Impossible de créer le compte utilisateur."
  );
}
