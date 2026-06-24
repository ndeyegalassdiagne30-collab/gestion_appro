import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { navigate } from "../router.js";
import {
  createProduit,
  deleteProduit,
  getProduits,
  updateProduit,
} from "../services/produitService.js";
import { getCategories } from "../services/categorieService.js";
import { uploadProductImage } from "../services/cloudinaryService.js";
import { isAdmin } from "../services/authService.js";

export function produitFormBody(produit, categories = [], errors = {}) {
  const optionsHtml = categories.map(categorie => `
    <option value="${categorie.id}" ${produit?.categorieId == categorie.id ? 'selected' : ''}>
      ${escapeHtml(categorie.libelle)}
    </option>
  `).join('');

  return `
    <div>
      <!-- Libellé -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitLibelle">Libellé *</label>
        <input class="w-full rounded-2xl border ${errors.libelle ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="produitLibelle" value="${escapeHtml(produit?.libelle || "")}" placeholder="ex: Ordinateur" autocomplete="off" />
        ${errors.libelle ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.libelle}</p>` : ''}
      </div>

      <!-- Prix -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitPrix">Prix *</label>
        <input class="w-full rounded-2xl border ${errors.prix ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" step="0.01" id="produitPrix" value="${escapeHtml(produit?.prix || "")}" placeholder="ex: 99.99" autocomplete="off" />
        ${errors.prix ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.prix}</p>` : ''}
      </div>

      <!-- Quantité -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitQuantite">Quantité *</label>
        <input class="w-full rounded-2xl border ${errors.quantite ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="number" id="produitQuantite" value="${escapeHtml(produit?.quantite || "")}" placeholder="ex: 10" autocomplete="off" />
        ${errors.quantite ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.quantite}</p>` : ''}
      </div>

      <!-- Catégorie -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitCategorie">Catégorie *</label>
        <select class="w-full rounded-2xl border ${errors.categorieId ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" id="produitCategorie">
          <option value="">Sélectionner une catégorie</option>
          ${optionsHtml}
        </select>
        ${errors.categorieId ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.categorieId}</p>` : ''}
      </div>

      <!-- Image -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="produitImage">Image (optionnel)</label>
        <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-indigo-600 hover:file:bg-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="file" id="produitImage" accept="image/*" />
        ${errors.image ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.image}</p>` : ''}
        ${produit?.imageUrl ? `<div class="mt-2"><img src="${produit.imageUrl}" alt="Image du produit" class="h-20 w-20 rounded-xl object-cover" /></div>` : ''}
      </div>
    </div>
  `;
}

async function openProduitForm(produit = null) {
  let categories = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
    showToast('Erreur lors du chargement des catégories', 'error');
  }

  let errors = {};
  let currentProduit = produit;

  const modal = openModal({
    title: produit ? "Modifier le produit" : "Nouveau produit",
    icon: "fa-tag",
    body: produitFormBody(produit, categories, errors),
    confirmLabel: produit ? "Enregistrer" : "Créer",
    onConfirm: async (modalElement) => {
      errors = {};
      
      const libelle = modalElement.querySelector("#produitLibelle").value;
      const prix = modalElement.querySelector("#produitPrix").value;
      const quantite = modalElement.querySelector("#produitQuantite").value;
      const categorieId = modalElement.querySelector("#produitCategorie").value;
      const imageFile = modalElement.querySelector("#produitImage")?.files[0];

      let hasErrors = false;

      if (!libelle.trim()) {
        errors.libelle = "Le libellé est requis";
        hasErrors = true;
      }

      if (!prix || parseFloat(prix) <= 0) {
        errors.prix = "Le prix doit être supérieur à 0";
        hasErrors = true;
      }

      if (!quantite || parseInt(quantite) < 0) {
        errors.quantite = "La quantité ne peut pas être négative";
        hasErrors = true;
      }

      if (!categorieId) {
        errors.categorieId = "Veuillez sélectionner une catégorie";
        hasErrors = true;
      }

      if (imageFile) {
        try {
          const result = await uploadProductImage(imageFile);
          currentProduit = {
            ...currentProduit,
            imageUrl: result.imageUrl,
            imagePublicId: result.imagePublicId,
          };
        } catch (error) {
          errors.image = error.message;
          hasErrors = true;
        }
      }

      if (hasErrors) {
        const bodyContainer = modalElement.querySelector('[data-modal-form]');
        const newBody = produitFormBody(currentProduit, categories, errors);
        bodyContainer.innerHTML = newBody;
        return false;
      }

      try {
        const produitData = {
          libelle: libelle.trim(),
          prix: parseFloat(prix),
          quantite: parseInt(quantite),
          categorieId: categorieId,
          imageUrl: currentProduit?.imageUrl || null,
          imagePublicId: currentProduit?.imagePublicId || null,
        };

        if (produit) {
          await updateProduit(produit.id, produitData);
          showToast("Produit modifié avec succès.");
        } else {
          await createProduit(produitData);
          showToast("Produit créé avec succès.");
        }

        const currentPage = new URLSearchParams(window.location.search).get('page') || 'produits';
        await navigate(currentPage);
        return true;
      } catch (error) {
        showToast(error.message || "Erreur lors de l'opération", "error");
        return false;
      }
    },
  });
}

export async function renderProduitsPage() {
  const app = document.getElementById("app");
  
  let produits = [];
  try {
    produits = await getProduits();
  } catch (error) {
    showToast('Erreur chargement des produits', 'error');
    produits = [];
  }

  let categories = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
  }

  const categorieMap = {};
  categories.forEach(cat => {
    categorieMap[cat.id] = cat.libelle;
  });

  const admin = isAdmin();

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "Produits",
        subtitle: admin
          ? "Créer, modifier et supprimer les produits de l'application."
          : "Consultation des produits disponibles.",
        actionLabel: admin ? "Nouveau produit" : null,
        actionId: admin ? "addProduitBtn" : null,
        actionIcon: admin ? "fa-plus" : null,
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des produits</h2>
            <p class="text-sm text-slate-500">${produits.length} produit(s) enregistré(s).</p>
          </div>
        </div>

        ${renderTable({
          rows: produits,
          emptyMessage: "Aucun produit enregistré.",
          columns: [
            {
              label: "Image",
              render: (prod) => {
                if (prod.imageUrl) {
                  return `<img src="${prod.imageUrl}" alt="${prod.libelle}" class="h-12 w-12 rounded-xl object-cover" />`;
                }
                return `<span class="text-xs text-slate-400">Aucune</span>`;
              }
            },
            { 
              label: "Libellé", 
              render: (prod) => `<strong class="font-bold text-slate-950">${escapeHtml(prod.libelle)}</strong>` 
            },
            { 
              label: "Prix", 
              render: (prod) => `<strong class="font-bold text-slate-950">${escapeHtml(prod.prix)} €</strong>` 
            },
            { 
              label: "Quantité", 
              render: (prod) => `<strong class="font-bold text-slate-950">${escapeHtml(prod.quantite)}</strong>` 
            },
            { 
              label: "Catégorie", 
              render: (prod) => {
                const categorieLibelle = categorieMap[prod.categorieId] || 'Non catégorisé';
                return `<span class="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">${escapeHtml(categorieLibelle)}</span>`;
              } 
            },
            
            {
              label: "Actions",
              render: (prod) => admin ? `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(prod.id)}">
                    <i class="fa-solid fa-pen"></i>
                    Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(prod.id)}">
                    <i class="fa-solid fa-trash"></i>
                    Supprimer
                  </button>
                </div>
              ` : `<span class="text-xs text-slate-400">Lecture seule</span>`,
            },
          ],
        })}
      </article>
    </section>
  `;

  if (admin) bindProduitEvents(produits);
}

function bindProduitEvents(produits) {
  document.getElementById("addProduitBtn").addEventListener("click", () => openProduitForm());

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const produit = produits.find((item) => item.id === button.dataset.edit);
      if (produit) openProduitForm(produit);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;

      openConfirm({
        message: "Voulez-vous supprimer ce produit ?",
        onConfirm: async () => {
          try {
            await deleteProduit(id);
            showToast("Produit supprimé.");
            const currentPage = new URLSearchParams(window.location.search).get('page') || 'produits';
            await navigate(currentPage);
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}