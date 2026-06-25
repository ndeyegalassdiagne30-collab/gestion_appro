# Documentation Technique — SPA Gestion Approvisionnement

---

## Fichiers touchés

### Nouveaux fichiers créés (phase 1 — fonctionnalités de base)

| Fichier | Rôle |
|---------|------|
| `js/config/cloudinary.js` | Config Cloudinary (cloudName, uploadPreset, URL de l'API) |
| `js/services/cloudinaryService.js` | Fonction `uploadProductImage()` — validation + envoi vers Cloudinary |
| `js/services/produitService.js` | CRUD produits (GET, POST, PUT, DELETE vers json-server) |
| `js/pages/produitsPage.js` | Page Produits complète : tableau, formulaire, gestion des erreurs, intégration image |

### Fichiers modifiés (phase 1 — fonctionnalités de base)

| Fichier | Ce qui a changé |
|---------|-----------------|
| `js/router.js` | Ajout de `getPageFromURL()`, `updateURL()`, `history.pushState`, listener `popstate` |
| `js/app.js` | Appel de `initRouter()` au démarrage pour lire `?page=` et afficher la bonne page |
| `js/components/sidebar.js` | Ajout du lien "Produits" dans `NAV_LINKS` |
| `js/config/api.js` | Ajout de la base URL pour les appels vers json-server |
| `db.json` | Ajout de la collection `produits` dans la base de données locale |

---

### Nouveaux fichiers créés (phase 2 — authentification et rôles)

| Fichier | Rôle |
|---------|------|
| `js/services/authService.js` | `login()`, `logout()`, `getCurrentUser()`, `isAdmin()`, `isFournisseur()` — gestion de la session via `localStorage` |
| `js/services/userService.js` | `createUser()` — enregistre un nouvel utilisateur dans la table `users` du backend |
| `js/pages/loginPage.js` | Page de connexion (fond blanc, card, formulaire email + mot de passe, validation) |

### Fichiers modifiés (phase 2 — authentification et rôles)

| Fichier | Ce qui a changé |
|---------|-----------------|
| `js/config/api.js` | Ajout de l'endpoint `users: API_BASE_URL + "/users"` |
| `js/app.js` | Vérifie `isAuthenticated()` avant de monter l'app — affiche `loginPage` si non connecté |
| `js/router.js` | Garde de rôle : `isPageAllowed()`, `getDefaultPage()` selon le rôle |
| `js/components/sidebar.js` | Menu filtré selon le rôle + badge rôle + info utilisateur connecté |
| `js/components/navbar.js` | Ajout de `initNavbarEvents()` + bouton Déconnexion |
| `js/pages/produitsPage.js` | Lecture seule pour le rôle fournisseur (pas de bouton ajout ni actions) |
| `js/pages/fournisseursPage.js` | Réécriture complète : IDs uniques, bugs corrigés, champ mot de passe, enregistrement dans 2 tables |

---

## 1. Routage — Persistance de la page après actualisation

### Problème

Dans une SPA classique, l'URL ne change pas quand on navigue entre les pages. Si l'utilisateur est sur la page Produits et actualise (F5), le navigateur charge l'URL de base et le router revient sur la page par défaut (Catégories).

### Solution : `?page=` dans l'URL

Le router utilise un **paramètre `?page=`** dans l'URL pour mémoriser la page active. Ainsi `/?page=produits` est différent de `/?page=categories`, et le navigateur recharge exactement la bonne page.

**Fichier : `js/router.js`**

```
Étape 1 — Lire la page depuis l'URL au démarrage
┌─────────────────────────────────────────────────────────┐
│  function getPageFromURL()                              │
│    → lit window.location.search                         │
│    → extrait le paramètre "page"                        │
│    → retourne "categories" par défaut si absent         │
└─────────────────────────────────────────────────────────┘

Étape 2 — Écrire la page dans l'URL à chaque navigation
┌─────────────────────────────────────────────────────────┐
│  function updateURL(page)                               │
│    → construit une nouvelle URL avec ?page=produits     │
│    → appelle history.pushState() pour changer l'URL     │
│      SANS recharger la page                             │
└─────────────────────────────────────────────────────────┘

Étape 3 — Initialisation au démarrage
┌─────────────────────────────────────────────────────────┐
│  function initRouter()                                  │
│    → lit getPageFromURL()                               │
│    → appelle navigate() avec la page trouvée            │
│    → si ?page=produits → affiche directement Produits   │
└─────────────────────────────────────────────────────────┘

Étape 4 — Bouton Précédent/Suivant du navigateur
┌─────────────────────────────────────────────────────────┐
│  window.addEventListener('popstate', ...)               │
│    → déclenché quand l'utilisateur clique ← ou →        │
│    → relit event.state.page ou l'URL courante           │
│    → ré-appelle navigate() avec la bonne page           │
└─────────────────────────────────────────────────────────┘
```

### Flux complet

```
Utilisateur ouvre /?page=produits
        ↓
initRouter() lit "produits" depuis l'URL
        ↓
navigate("produits") est appelé
        ↓
renderProduitsPage() affiche la liste des produits
        ↓
L'utilisateur actualise F5
        ↓
Le navigateur recharge /?page=produits
        ↓
initRouter() relit "produits" → même page ✓
```

---

## 2. Upload d'image avec Cloudinary

### Architecture

Cloudinary est un service cloud qui héberge les images. On lui envoie le fichier directement depuis le navigateur (sans passer par notre serveur JSON). Il retourne une URL publique permanente que l'on sauvegarde dans `db.json`.

```
Navigateur                   Cloudinary                   db.json
    │                             │                           │
    │── FormData (fichier) ──────►│                           │
    │                             │── traite l'image          │
    │◄── { secure_url, ... } ────│                           │
    │                             │                           │
    │── POST produit { imageUrl } ─────────────────────────► │
```

### Configuration

**Fichier : `js/config/cloudinary.js`**

| Clé | Valeur | Rôle |
|-----|--------|------|
| `cloudName` | `dduq39adm` | Identifiant du compte Cloudinary |
| `uploadPreset` | `gestion_appro` | Preset configuré côté Cloudinary pour autoriser les uploads non signés depuis le front |
| `CLOUDINARY_UPLOAD_URL` | `https://api.cloudinary.com/v1_1/dduq39adm/upload` | Endpoint de l'API |

### Service d'upload

**Fichier : `js/services/cloudinaryService.js`**

```
function uploadProductImage(file)
        │
        ├─ Validation 1 : file.type.startsWith("image/")
        │    → rejette si ce n'est pas une image
        │
        ├─ Validation 2 : file.size > 2 Mo
        │    → rejette si trop lourd
        │
        ├─ Construit un FormData :
        │    { file: <le fichier>, upload_preset: "gestion_appro" }
        │
        ├─ fetch(CLOUDINARY_UPLOAD_URL, { method: "POST", body: formData })
        │
        ├─ Si response.ok = false → throw Error avec le message Cloudinary
        │
        └─ Retourne { imageUrl: data.secure_url, imagePublicId: data.public_id }
```

### Intégration dans le formulaire produit

**Fichier : `js/pages/produitsPage.js`**

```javascript
const imageFile = modalElement.querySelector("#produitImage").files[0];

if (imageFile) {
  const result = await uploadProductImage(imageFile);
  currentProduit = {
    ...currentProduit,
    imageUrl: result.imageUrl,         // URL permanente hébergée sur Cloudinary
    imagePublicId: result.imagePublicId // ID pour suppression future possible
  };
}
// Puis on sauvegarde produitData avec imageUrl dans db.json
```

---

## 3. Affichage des erreurs sous les inputs

### Principe

Les erreurs ne sont **pas des alertes** (`alert()`) ni des toasts. Elles apparaissent directement sous chaque input concerné, en rouge, au moment de la soumission du formulaire.

### Objet `errors`

Un objet `errors` est utilisé comme dictionnaire `{ champ: "message d'erreur" }` :

```javascript
errors = {
  libelle:     "Le libellé est requis",
  prix:        "Le prix doit être supérieur à 0",
  quantite:    "La quantité ne peut pas être négative",
  categorieId: "Veuillez sélectionner une catégorie",
  image:       "L'image ne doit pas dépasser 2 Mo"
}
```

### Rendu conditionnel dans le HTML

**Fichier : `js/pages/produitsPage.js` — fonction `produitFormBody()`**

Chaque champ du formulaire est rendu avec deux comportements selon si une erreur existe :

```
Input normal (pas d'erreur) :
┌─────────────────────────────────────────────┐
│  border: border-slate-200 (gris)            │
│  [    Libellé ici...                    ]   │
└─────────────────────────────────────────────┘

Input en erreur :
┌─────────────────────────────────────────────┐
│  border: border-rose-500 (rouge)            │
│  [    Libellé ici...                    ]   │
│  ⚠ Le libellé est requis                   │  ← <p> rouge affiché
└─────────────────────────────────────────────┘
```

Code pattern utilisé pour chaque champ :

```html
<!-- Bordure dynamique selon l'erreur -->
border ${errors.libelle ? 'border-rose-500' : 'border-slate-200'}

<!-- Message d'erreur conditionnel -->
${errors.libelle
  ? `<p class="mt-1 text-xs font-semibold text-rose-500">${errors.libelle}</p>`
  : ''
}
```

### Ré-injection des erreurs sans fermer la modal

Quand il y a des erreurs, la modal **ne se ferme pas**. Le contenu du formulaire est rechargé avec les erreurs injectées :

```
onConfirm() retourne false
    ↓
Le modal reste ouvert
    ↓
bodyContainer.innerHTML = produitFormBody(currentProduit, categories, errors)
    ↓
Le formulaire se re-render avec :
  - les valeurs déjà saisies conservées
  - les bordures rouges sur les champs en erreur
  - les messages d'erreur sous chaque input
```

Retourner `false` depuis `onConfirm` est le signal convenu avec `modal.js` pour ne pas fermer la modal.

---

## 4. `hasErrors` — le drapeau de validation

`hasErrors` est un **booléen** qui sert à savoir si au moins un champ du formulaire est invalide avant de soumettre.

```javascript
let hasErrors = false;  // on part du principe que tout est valide

if (!libelle.trim()) {
  errors.libelle = "Le libellé est requis";
  hasErrors = true;   // on lève le drapeau
}

if (!prix || parseFloat(prix) <= 0) {
  errors.prix = "Le prix doit être supérieur à 0";
  hasErrors = true;   // on lève le drapeau
}

// ... idem pour quantite, categorieId, image

if (hasErrors) {
  // re-render le formulaire avec les messages d'erreur
  bodyContainer.innerHTML = produitFormBody(currentProduit, categories, errors);
  return false;  // la modal reste ouverte, on n'envoie rien
}

// si on arrive ici, hasErrors est resté false → tout est valide
await createProduit(produitData);
```

L'idée clé : on **valide tout d'abord**, puis on décide une seule fois si on bloque ou non. Cela permet d'afficher **toutes les erreurs en même temps** plutôt que de s'arrêter à la première.

---

## 5. `parseFloat` et `parseInt` — pourquoi convertir ?

Les valeurs récupérées depuis les inputs HTML sont **toujours des chaînes de caractères** (`string`), même si l'input est de type `number`.

```javascript
const prix = modalElement.querySelector("#produitPrix").value;
// L'utilisateur a tapé 99.99 mais prix vaut "99.99" (string)
```

### `parseFloat` pour le prix

```javascript
prix: parseFloat(prix)
```

Le prix peut avoir des décimales (`99.99`, `1.50`...). `parseFloat` convertit la string en nombre décimal.

| Appel | Résultat |
|-------|----------|
| `parseFloat("99.99")` | `99.99` ✓ |
| `parseInt("99.99")` | `99` ✗ — coupe les décimales |

### `parseInt` pour la quantité

```javascript
quantite: parseInt(quantite)
```

Une quantité de produits ne peut pas être `10.5` pièces — c'est forcément un **entier**.

| Appel | Résultat |
|-------|----------|
| `parseInt("10")` | `10` ✓ |
| `parseInt("10.7")` | `10` ✓ — arrondi vers le bas, logique pour un stock |

### Sans conversion, le problème

```javascript
// Sans parseFloat/parseInt → strings dans db.json
{ prix: "99.99", quantite: "10" }

// Avec → vrais nombres dans db.json
{ prix: 99.99, quantite: 10 }
```

Avec des strings, des calculs comme `prix * 2` donneraient `"99.9999.99"` (concaténation) au lieu de `199.98`.

---

## 6. Authentification — Connexion et session utilisateur

### Principe général

L'application utilise le `localStorage` du navigateur pour mémoriser l'utilisateur connecté. Il n'y a pas de token JWT ni de cookie — c'est une authentification simple adaptée à une SPA éducative avec JSON Server.

```
Utilisateur saisit email + mot de passe
        ↓
login() cherche dans GET /users?email=...
        ↓
Compare motDePasse dans le tableau retourné
        ↓
Si trouvé → stocke le user (sans mot de passe) dans localStorage
        ↓
window.location.reload() → app.js relit le localStorage → monte l'app
```

### Fichier : `js/services/authService.js`

| Fonction | Rôle |
|----------|------|
| `login(email, motDePasse)` | Cherche le user dans `/users`, vérifie le mot de passe, stocke en localStorage |
| `logout()` | Supprime le user du localStorage et recharge la page |
| `getCurrentUser()` | Lit et retourne l'objet user depuis le localStorage |
| `isAuthenticated()` | Retourne `true` si un user est stocké |
| `isAdmin()` | Retourne `true` si `role === "admin"` |
| `isFournisseur()` | Retourne `true` si `role === "fournisseur"` |

```javascript
// Ce qui est stocké dans localStorage (mot de passe exclu)
{
  "id": "admin-001",
  "email": "admin@gestion.com",
  "role": "admin",
  "nom": "Administrateur",
  "fournisseurId": null
}
```

### Fichier : `js/app.js` — garde d'entrée

```
startApp() est appelé au chargement de la page
        ↓
isAuthenticated() lit le localStorage
        ↓
  Non connecté → renderLoginPage()  (affiche le formulaire)
  Connecté     → mountLayout()      (affiche sidebar + navbar + router)
```

---

## 7. Gestion des rôles — Admin et Fournisseur

### Les deux rôles

| Rôle | Accès |
|------|-------|
| `admin` | Toutes les pages : Catégories, Produits, Fournisseurs — CRUD complet |
| `fournisseur` | Page Produits uniquement — lecture seule (pas de création, modification ni suppression) |

### Fichier : `js/router.js` — garde de navigation

```javascript
function isPageAllowed(page) {
  if (isAdmin())       return true;              // admin → tout
  if (isFournisseur()) return page === "produits"; // fournisseur → produits seulement
  return false;
}

// Si la page demandée est interdite → redirection automatique
if (!isPageAllowed(page)) {
  page = getDefaultPage(); // "produits" pour le fournisseur
}
```

```
Fournisseur tente d'aller sur /?page=categories
        ↓
isPageAllowed("categories") → false
        ↓
page = "produits"
        ↓
navigate("produits") → affiche les produits en lecture seule
```

### Fichier : `js/components/sidebar.js` — menu selon le rôle

```javascript
const ADMIN_LINKS       = [Catégories, Produits, Fournisseurs]
const FOURNISSEUR_LINKS = [Produits]

const links = isAdmin() ? ADMIN_LINKS : FOURNISSEUR_LINKS;
```

Le sidebar affiche aussi un **badge de rôle** et le **nom de l'utilisateur connecté** en bas.

### Fichier : `js/pages/produitsPage.js` — lecture seule pour le fournisseur

```javascript
const admin = isAdmin();

// Bouton "Nouveau produit" : visible seulement si admin
actionLabel: admin ? "Nouveau produit" : null,

// Colonne Actions dans le tableau
render: (prod) => admin
  ? `<button Modifier> <button Supprimer>`  // admin → CRUD
  : `<span>Lecture seule</span>`            // fournisseur → aucune action
```

### Tableau récapitulatif des permissions

| Fonctionnalité | Admin | Fournisseur |
|---|---|---|
| Voir Catégories | ✅ | ❌ |
| Créer / Modifier / Supprimer Catégories | ✅ | ❌ |
| Voir Produits | ✅ | ✅ |
| Créer / Modifier / Supprimer Produits | ✅ | ❌ |
| Voir Fournisseurs | ✅ | ❌ |
| Créer / Modifier / Supprimer Fournisseurs | ✅ | ❌ |

---

## 8. Création d'un fournisseur — enregistrement sur 2 tables

### Pourquoi 2 tables ?

Un fournisseur a deux identités dans le système :
- **Son profil métier** → table `fournisseurs` (nom, téléphone, adresse, type...)
- **Son compte de connexion** → table `users` (email, mot de passe, rôle)

### Flux d'enregistrement

```
Admin remplit le formulaire (nom, email, mot de passe, téléphone, adresse, type, date)
        ↓
Étape 1 : POST /fournisseurs
  → { id, nom, email, telephone, adresse, type, dateInscription }
  → Retourne le fournisseur créé avec son id
        ↓
Étape 2 : POST /users
  → { email, motDePasse, role: "fournisseur", nom, fournisseurId: id_étape_1 }
        ↓
Le fournisseur peut maintenant se connecter avec son email + mot de passe
```

### Fichier : `js/pages/fournisseursPage.js` — fonction `openfournisseurForm()`

```javascript
// Étape 1 — créer dans la table fournisseurs
const newFournisseur = await createfournisseurs(fournisseurData);

// Étape 2 — créer le compte dans la table users
await createUser({
  email: email.trim(),
  motDePasse: motDePasse.trim(),
  role: "fournisseur",
  nom: nom.trim(),
  fournisseurId: newFournisseur.id,  // lien entre les 2 tables
});
```

### Fichier : `js/services/userService.js`

```javascript
export async function createUser(data) {
  const user = {
    id: createId("usr"),         // génère un id unique préfixé "usr-"
    email: data.email,
    motDePasse: data.motDePasse,
    role: data.role,             // "fournisseur"
    nom: data.nom,
    fournisseurId: data.fournisseurId,
  };
  return apiRequest(ENDPOINTS.users, { method: "POST", body: JSON.stringify(user) });
}
```

### Structure de `db.json` (backend JSON Server)

```json
{
  "users": [
    {
      "id": "admin-001",
      "email": "admin@gestion.com",
      "motDePasse": "admin123",
      "role": "admin",
      "nom": "Administrateur",
      "fournisseurId": null
    }
  ],
  "fournisseurs": [],
  "categories": [],
  "produits": []
}
```

Le champ `fournisseurId` dans `users` est `null` pour l'admin et contient l'`id` du fournisseur correspondant pour un utilisateur de rôle `fournisseur`.

---

## 9. Page de connexion — `js/pages/loginPage.js`

### Comportement

La page de connexion remplace entièrement le contenu de l'app (sidebar et navbar sont vidés). Elle s'affiche quand `isAuthenticated()` retourne `false` au démarrage.

```
app.js → isAuthenticated() → false
        ↓
renderLoginPage()
  → vide sidebarRoot et navbarRoot
  → injecte le formulaire dans #app
  → écoute la soumission du formulaire
        ↓
Soumission → login(email, motDePasse)
  → succès → window.location.reload() → app normale
  → erreur → affiche le message sous le formulaire
```

### Validation côté front

Avant d'appeler `login()`, deux vérifications basiques sont faites :

| Champ | Règle |
|-------|-------|
| Email | Non vide |
| Mot de passe | Non vide |

Si un champ est vide, un message rouge s'affiche sous l'input concerné sans faire d'appel réseau.
