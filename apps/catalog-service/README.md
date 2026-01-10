# Catalog Service

## 📖 Vue d'ensemble
Le **Catalog Service** est le microservice central de **ShopZone** dédié à la gestion du catalogue de produits et des catégories. Il agit comme la source de vérité pour toutes les informations descriptives des produits (nom, prix, SKU, description) et leur organisation.

Il communique avec les autres services via **Kafka** pour notifier la création de produits (initialisation des stocks) et vérifie la disponibilité des stocks avant la suppression.

---

## 🏗 Architecture & Rôle
*   **Gestionnaire de Données** : Crée, lit, met à jour et supprime les produits et catégories.
*   **Point de Diffusion** : Notifie les autres services (Inventory, Search, etc.) des changements importants dans le catalogue.
*   **Intégrité** : Garantit l'unicité des SKU et la cohérence des données produits.

---

## 📦 Entités Métier

### 1. Product
Représente un article vendable.
*   `id` : UUID unique.
*   `name` : Nom du produit.
*   `description` : Détails complets.
*   `price` : Prix unitaire (`Decimal`).
*   `sku` : **Stock Keeping Unit** (Unique). Identifiant technique pour la gestion des stocks.
*   `categoryId` : Lien vers la catégorie.
*   `status` : État du cycle de vie (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `PENDING_DELETE`).
*   `isDeleted` : Indicateur de suppression logique (Soft Delete).
*   `isActive` : (Dérivé du status) Seuls les produits `PUBLISHED` sont visibles publiquement.

### 2. Category
Organisation logique des produits.
*   `id` : UUID.
*   `name` : Nom unique (ex: "Electronics").
*   `description` : Description courte.

---

## 📨 Événements Kafka

### Consommés (Commandes)

| Pattern | Action | Description |
| :--- | :--- | :--- |
| `catalog.product.create` | **Création** | Crée un produit et émet `product.created`. |
| `catalog.product.update` | **Mise à Jour** | Modifie les détails d'un produit. |
| `catalog.product.remove` | **Suppression** | Tente de supprimer (soft delete) un produit après vérification du stock. |
| `catalog.product.findAll` | **Lecture** | Récupère tous les produits actifs. |
| `catalog.product.findOne` | **Lecture** | Récupère un produit par ID. |

### Émis (Événements)

| Sujet | Déclencheur | Destinataire Principal | Description |
| :--- | :--- | :--- | :--- |
| `product.created` | Création réussie | **Inventory Service** | Demande la création du stock initial (0). |

---

## ⚙️ Règles de Gestion & Cycle de Vie

### 1. Unicité du SKU
Deux produits ne peuvent jamais avoir le même SKU. Une tentative de création avec un SKU existant lève une `ConflictException`.

### 2. Suppression Sécurisée (Soft Delete)
La suppression d'un produit n'est pas immédiate :
1.  **Vérification Stock** : Appelle `inventory.stock.check` (RPC).
2.  **Si Stock > 0** : Suppression rejetée (`ConflictException`).
3.  **Si Stock == 0** : Produit marqué `isDeleted = true`.
4.  **Si Inventory HS** : Produit marqué `status = PENDING_DELETE` pour être traité ultérieurement.

### 3. Statut
Seuls les produits avec le statut `PUBLISHED` (ou `isActive = true`) devraient être affichés sur la vitrine (Front-end).

---

## ⚠️ Gestion des Erreurs
*   **SKU Dupliqué** : `ConflictException` à la création.
*   **Dépendance Inventory** : Si le service Inventory ne répond pas lors d'une suppression, le système passe en mode dégradé (`PENDING_DELETE`) plutôt que d'échouer complètement.

---

## 📂 Structure du Projet
```
apps/catalog-service/
├── prisma/                 # Schéma (Product, Category)
├── src/
│   ├── product/            # Module Produit (Controller, Service)
│   ├── category/           # Module Catégorie
│   ├── catalog-service.module.ts
│   └── main.ts
└── .env                    # Config DB
```

---

## 🚀 Configuration & Test

### Pré-requis
Base de données PostgreSQL accessible.

### Démarrage
```bash
# Appliquer les migrations
npx prisma migrate dev

# Lancer le service
nx serve catalog-service
```
