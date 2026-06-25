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
import { createUser } from "../services/userService.js";

function fournisseurFormBody(fournisseur, errors = {}) {
  const isEdit = fournisseur !== null;
  return `
    <div>
      <!-- Nom -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurNom">Nom *</label>
        <input class="w-full rounded-2xl border ${errors.nom ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="text" id="fournisseurNom" value="${escapeHtml(fournisseur?.nom || "")}" placeholder="ndeye diagne" autocomplete="off" />
        ${errors.nom ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.nom}</p>` : ''}
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurEmail">Email *</label>
        <input class="w-full rounded-2xl border ${errors.email ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="email" id="fournisseurEmail" value="${escapeHtml(fournisseur?.email || "")}" placeholder="ndeye@gmail.com" autocomplete="off" />
        ${errors.email ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.email}</p>` : ''}
      </div>

      <!-- Mot de passe (uniquement à la création) -->
      ${!isEdit ? `
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurMotDePasse">Mot de passe *</label>
        <input class="w-full rounded-2xl border ${errors.motDePasse ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="password" id="fournisseurMotDePasse" placeholder="••••••••" autocomplete="new-password" />
        ${errors.motDePasse ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.motDePasse}</p>` : ''}
      </div>
      ` : ''}

      <!-- Téléphone -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurTelephone">Téléphone *</label>
        <input class="w-full rounded-2xl border ${errors.telephone ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="text" id="fournisseurTelephone" value="${escapeHtml(fournisseur?.telephone || "")}" placeholder="77 000 00 00" autocomplete="off" />
        ${errors.telephone ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.telephone}</p>` : ''}
      </div>

      <!-- Adresse -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurAdresse">Adresse *</label>
        <input class="w-full rounded-2xl border ${errors.adresse ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="text" id="fournisseurAdresse" value="${escapeHtml(fournisseur?.adresse || "")}" placeholder="Dakar, Sénégal" autocomplete="off" />
        ${errors.adresse ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.adresse}</p>` : ''}
      </div>

      <!-- Type -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurType">Type *</label>
        <input class="w-full rounded-2xl border ${errors.type ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="text" id="fournisseurType" value="${escapeHtml(fournisseur?.type || "")}" placeholder="Grossiste" autocomplete="off" />
        ${errors.type ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.type}</p>` : ''}
      </div>

      <!-- Date d'inscription -->
      <div class="mb-4">
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500" for="fournisseurDateInscription">Date d'inscription *</label>
        <input class="w-full rounded-2xl border ${errors.dateInscription ? 'border-rose-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          type="date" id="fournisseurDateInscription" value="${escapeHtml(fournisseur?.dateInscription || "")}" />
        ${errors.dateInscription ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.dateInscription}</p>` : ''}
      </div>
    </div>
  `;
}

async function openfournisseurForm(fournisseur = null) {
  const isEdit = fournisseur !== null;
  let errors = {};

  openModal({
    title: isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur",
    icon: "fa-truck",
    body: fournisseurFormBody(fournisseur, errors),
    confirmLabel: isEdit ? "Enregistrer" : "Créer",
    onConfirm: async (modalElement) => {
      errors = {};

      const nom = modalElement.querySelector("#fournisseurNom").value;
      const email = modalElement.querySelector("#fournisseurEmail").value;
      const telephone = modalElement.querySelector("#fournisseurTelephone").value;
      const adresse = modalElement.querySelector("#fournisseurAdresse").value;
      const type = modalElement.querySelector("#fournisseurType").value;
      const dateInscription = modalElement.querySelector("#fournisseurDateInscription").value;
      const motDePasse = !isEdit
        ? modalElement.querySelector("#fournisseurMotDePasse")?.value
        : null;

      let hasErrors = false;

      if (!nom.trim()) { errors.nom = "Le nom est requis";
         hasErrors = true; }
      if (!email.trim()) { errors.email = "L'email est requis";
         hasErrors = true; }
      if (!isEdit && !motDePasse?.trim()) { errors.motDePasse = "Le mot de passe est requis";
         hasErrors = true; }
      if (!telephone.trim()) { errors.telephone = "Le téléphone est requis";
         hasErrors = true; }
      if (!adresse.trim()) { errors.adresse = "L'adresse est requise";
         hasErrors = true; }
      if (!type.trim()) { errors.type = "Le type est requis"; hasErrors = true; }
      if (!dateInscription.trim()) { errors.dateInscription = "La date d'inscription est requise";
         hasErrors = true; }

      if (hasErrors) {
        const bodyContainer = modalElement.querySelector('[data-modal-form]');
        bodyContainer.innerHTML = fournisseurFormBody(
          { nom, email, telephone, adresse, type, dateInscription },
          errors
        );
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

        if (isEdit) {
          await updatefournisseurs(fournisseur.id, fournisseurData);
          showToast("Fournisseur modifié avec succès.");
        } else {
          const newFournisseur = await createfournisseurs(fournisseurData);
          await createUser({
            email: email.trim(),
            motDePasse: motDePasse.trim(),
            role: "fournisseur",
            nom: nom.trim(),
            fournisseurId: newFournisseur.id,
          });
          showToast("Fournisseur créé avec succès.");
        }

        await navigate("fournisseurs");
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

  app.innerHTML = `
    <section>
      ${pageHeader({
        kicker: "Référentiel",
        title: "Fournisseurs",
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
          emptyMessage: "Aucun fournisseur enregistré.",
          columns: [
            { label: "Nom", render: (four) => `<strong class="font-bold text-slate-950">${escapeHtml(four.nom)}</strong>` },
            { label: "Email", render: (four) => `<span class="text-sm text-slate-600">${escapeHtml(four.email)}</span>` },
            { label: "Téléphone", render: (four) => `<span class="text-sm text-slate-600">${escapeHtml(four.telephone)}</span>` },
            { label: "Adresse", render: (four) => `<span class="text-sm text-slate-600">${escapeHtml(four.adresse)}</span>` },
            { label: "Type", render: (four) => `<span class="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">${escapeHtml(four.type)}</span>` },
            { label: "Date inscription", render: (four) => `<span class="text-sm text-slate-600">${escapeHtml(four.dateInscription)}</span>` },
            {
              label: "Actions",
              render: (four) => `
                <div class="flex flex-wrap gap-2">
                  <button class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50" data-edit="${escapeHtml(four.id)}">
                    <i class="fa-solid fa-pen"></i>
                    Modifier
                  </button>
                  <button class="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700" data-delete="${escapeHtml(four.id)}">
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
            await deletefournisseurs(id);
            showToast("Fournisseur supprimé.");
            await navigate("fournisseurs");
          } catch (error) {
            showToast(error.message, "error");
          }
        },
      });
    });
  });
}
