import { ENDPOINTS } from "../config/api.js";
import { apiRequest } from "./apiClient.js";
import { createId } from "../utils/id.js";
import { required } from "../utils/validators.js";

function normalizeProduit(data) {
  return {
    id: data.id,
    libelle: String(data.libelle || "").trim(),
    prix: parseFloat(data.prix) || 0,
    quantite: parseInt(data.quantite) || 0,
    categorieId: data.categorieId || null,
    imageUrl: data.imageUrl || null,
    imagePublicId: data.imagePublicId || null,
  };
}

export async function getProduits() {
  return apiRequest(ENDPOINTS.produits, {}, "Impossible de charger les produits.");
}

export async function createProduit(data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix est obligatoire.");
  required(data.quantite, "La quantité est obligatoire.");
  required(data.categorieId, "La catégorie est obligatoire.");

  const produit = normalizeProduit({
    id: createId("prod"),
    ...data,
  });

  return apiRequest(
    ENDPOINTS.produits,
    {
      method: "POST",
      body: JSON.stringify(produit),
    },
    "Impossible de créer le produit."
  );
}

export async function updateProduit(id, data) {
  required(data.libelle, "Le libellé du produit est obligatoire.");
  required(data.prix, "Le prix est obligatoire.");
  required(data.quantite, "La quantité est obligatoire.");
  required(data.categorieId, "La catégorie est obligatoire.");

  const produit = normalizeProduit({ id, ...data });

  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(produit),
    },
    "Impossible de modifier le produit."
  );
}

export async function deleteProduit(id) {
  return apiRequest(
    `${ENDPOINTS.produits}/${id}`,
    {
      method: "DELETE",
    },
    "Impossible de supprimer le produit."
  );
}