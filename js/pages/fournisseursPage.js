import { pageHeader } from "../components/pageHeader.js";
import { renderTable } from "../components/table.js";
import { openModal, openConfirm } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { escapeHtml } from "../utils/html.js";
import { navigate } from "../router.js";
import {
  createfournisseurs,
  deletefournisseurs,
  getfournisseurs,
  updatefournisseurs,
} from "../services/fournisseurService.js";
// import { getCategories } from "../services/categorieService.js";
// import { uploadProductImage } from "../services/cloudinaryService.js";

function categorieFormBody(fournisseur , errors = {}) {
  return `
    <div>
      <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Nom</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.nom || "")}"autocomplete="off" />
       <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Email</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.email || "")}"autocomplete="off" />
       <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Telephone</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.telephone || "")}"autocomplete="off" />
       <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Adresse</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.adresse || "")}"autocomplete="off" />
       <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Type</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.type || "")}"autocomplete="off" />
       <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="categorieLibelle">Date d'inscription</label>
      <input class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" type="text" id="categorieLibelle" value="${escapeHtml(fournisseur?.dateInscription || "")}"autocomplete="off" />
    </div>
  `;
}

async function openfournisseurForm(fournisseur = null) {
  let fournisseurs = [];
  try {
    fournisseurs = await getCategories();
  } catch (error) {
    console.error('Erreur chargement des fournisseurs:', error);
    showToast('Erreur lors du chargement des fournisseurs', 'error');
  }

  let errors = {};
  let currentfournisseur = fournisseur;

  const modal = openModal({
    title: fournisseur ? "Modifier le fournisseur" : "Nouveau fournisseur",
    icon: "fa-tag",
    body: fournisseurFormBody(fournisseur, errors),
    confirmLabel: fournisseur ? "Enregistrer" : "Créer",
    onConfirm: async (modalElement) => {
      errors = {};
      
      const nom = modalElement.querySelector("#fournisseurNom").value;
      const email = modalElement.querySelector("#fournisseurEmail").value;
      const telephone = modalElement.querySelector("#fournisseurTelephone").value;
      const adresse = modalElement.querySelector("#fournisseurAdresse").value;
      const type = modalElement.querySelector("#fournisseurType").value;
      const dateInscription = modalElement.querySelector("#fournisseurDateInscription").value;
 

      let hasErrors = false;

      if (!nom.trim()) {
        errors.nom = "Le nom est requis";
        hasErrors = true;
      }

      if (!email.trim()) {
        errors.email = "L'email est requis";
        hasErrors = true;
      }

      if (!telephone.trim()) {
        errors.telephone = "Le telephone est requis";
        hasErrors = true;
      }

      if (!adresse.trim()) {
        errors.adresse = "L'adresse est requise";
        hasErrors = true;
      }

      if (!type.trim()) {
        errors.type = "Le type est requis";
        hasErrors = true;
      }

      if (!dateInscription.trim()) {
        errors.dateInscription = "La date d'inscription est requise";
        hasErrors = true;
      }

      if (hasErrors) {
        const bodyContainer = modalElement.querySelector('[data-modal-form]');
        const newBody = fournisseurFormBody(currentfournisseur, errors);
        bodyContainer.innerHTML = newBody;
        return false;
      }

      try {
        const fournisseurData = {
          nom: nom.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          adresse: adresse.trim(),
          type: type.trim(),
          dateInscription: dateInscription.trim(),
        };

        if (fournisseur) {
          await updatefournisseur(fournisseur.id, fournisseurData);
          showToast("fournisseur modifié avec succès.");
        } else {
          await createfournisseur(fournisseurData);
          showToast("fournisseur créé avec succès.");
        }

        const currentPage = new URLSearchParams(window.location.search).get('page') || 'fournisseurs';
        await navigate(currentPage);
        return true;
      } catch (error) {
        showToast(error.message || "Erreur lors de l'opération", "error");
        return false;
      }
    },
  });
}

export async function renderfournisseursPage() {
  const app = document.getElementById("app");
  
  let fournisseurs = [];
  try {
    fournisseurs = await getfournisseurs();
  } catch (error) {
    showToast('Erreur chargement des fournisseurs', 'error');
    fournisseurs = [];
  }

//   let categories = [];
//   try {
//     categories = await getCategories();
//   } catch (error) {
//     console.error('Erreur chargement catégories:', error);
//   }

//   const categorieMap = {};
//   categories.forEach(cat => {
//     categorieMap[cat.id] = cat.libelle;
//   });

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "fournisseurs",
        subtitle: "Créer, modifier et supprimer les fournisseurs de l'application.",
        actionLabel: "Nouveau fournisseur",
        actionId: "addfournisseurBtn",
        actionIcon: "fa-plus",
      })}

      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 class="text-xl font-black text-slate-950">Liste des fournisseurs</h2>
            <p class="text-sm text-slate-500">${fournisseurs.length} fournisseur(s) enregistré(s).</p>
          </div>
        </div>

      ${renderTable({
          rows: fournisseurs,
          emptyMessage: "Aucune fournisseur enregistrée.",
          columns: [
            { label: "nom", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.nom)}</strong>` },
            { label: "email", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.email)}</strong>` },
            { label: "telephone", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.telephone)}</strong>` },
            { label: "adresse", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.adresse)}</strong>` },
            { label: "type", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.type)}</strong>` },
            { label: "dateInscription", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.dateInscription)}</strong>` },
            {
              label: "Actions",
              render: (four) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(cat.id)}">
                    <i class="fa-solid fa-pen"></i>
                    Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(cat.id)}">
                    <i class="fa-solid fa-trash"></i>
                    Supprimer
                  </button>
                </div>
              `,
            },
          ],
        })}
      </article>
    </section>
  `;

  bindfournisseurEvents(fournisseurs);
}

function bindfournisseurEvents(fournisseurs) {
  document.getElementById("addfournisseurBtn").addEventListener("click", () => openfournisseurForm());

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const fournisseur = fournisseurs.find((item) => item.id === button.dataset.edit);
      if (fournisseur) openfournisseurForm(fournisseur);
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.delete;

      openConfirm({
        message: "Voulez-vous supprimer ce fournisseur ?",
        onConfirm: async () => {
          try {
            await deletefournisseur(id);
            showToast("fournisseur supprimé.");
            const currentPage = new URLSearchParams(window.location.search).get('page') || 'fournisseurs';
            await navigate(currentPage);
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}