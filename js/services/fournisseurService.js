import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizefournisseurs(data) {
  return {
    id: data.id,
    nom: String(data.nom || "").trim(),
    email: String(data.email || "").trim(),
    telephone: String(data.telephone || "").trim(),
    adresse: String(data.adresse || "").trim(),
    type: String(data.type || "").trim(),
    dateInscription: String(data.dateInscription || "").trim(),
    active: data.active || false,

  };
}

export async function getfournisseurs() {
  return apiRequest(ENDPOINTS.fournisseurs, {}, "Impossible de charger les fournisseurs.");
}

export async function createfournisseurs(data) {
  required(data.nom, "Le nom du fournisseurs est obligatoire.");
  required(data.email, "L'email est obligatoire.");
  required(data.telephone, "Le telephone est obligatoire.");
  required(data.adresse, "L'adresse est obligatoire.");
  required(data.type, "Le type est obligatoire.");
  required(data.dateInscription, "La date d'inscription est obligatoire.");


  const fournisseurs = normalizefournisseurs({
    id: createId("four"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.fournisseurs,
    {
      method: "POST",
      body: JSON.stringify(fournisseurs),
    },
    "Impossible de créer le fournisseurs."
  );
}

export async function updatefournisseurs(id, data) {
  required(data.nom, "Le nom du fournisseurs est obligatoire.");
  required(data.email, "L'email est obligatoire.");
  required(data.telephone, "Le telephone est obligatoire.");
  required(data.adresse, "L'adresse est obligatoire.");
  required(data.type, "Le type est obligatoire.");
  required(data.dateInscription, "La date d'inscription est obligatoire.");

  const fournisseurs = normalizefournisseurs({ id, ...data });

  return apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(fournisseurs),
    },
    "Impossible de modifier le fournisseurs."
  );
}

export async function deletefournisseurs(id) {
  return apiRequest(
    `${ENDPOINTS.fournisseurs}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le fournisseurs."
  );
}