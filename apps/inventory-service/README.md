# Inventory Service

## 📖 Vue d'ensemble
Le **Inventory Service** est un microservice critique responsable de la gestion des stocks en temps réel pour l'écosystème **ShopZone**. Il assure l'intégrité des données de stock, gère les réservations pour les commandes en cours, et trace tous les mouvements de produits.

Il interagit principalement avec le **Catalog Service** (pour l'initialisation des stocks) et le **Order Service** (pour la réservation et la confirmation).

---

## 🏗 Architecture & Rôle
*   **Source de Vérité** : Seul service habilité à modifier les quantités de stock.
*   **Architecture Événementielle** : Réagit aux événements Kafka pour effectuer des mises à jour asynchrones.
*   **Intégrité Transactionnelle** : Utilise des transactions atomiques pour garantir que le stock n'est jamais corrompu (ex: pas de stock négatif).

---

## 📦 Entités Métier

### 1. Inventory
Représente l'état actuel du stock d'un produit.
*   `productId` : Identifiant unique du produit (lié au Catalog Service).
*   `quantity` : Quantité physique totale en entrepôt.
*   `reserved` : Quantité temporairement bloquée pour des commandes en cours (non vendable).
*   `minStock` : Seuil d'alerte pour réapprovisionnement.
*   `maxStock` : Capacité maximale.
*   `location` : Emplacement physique (ex: "Allée 4, Étagère B").

### 2. StockMovement
Journal d'audit immuable de chaque modification de stock.
*   `type` :
    *   `IN` : Entrée de stock (réassort).
    *   `OUT` : Sortie définitive (vente).
    *   `RESERVE` : Réservation pour commande.
    *   `RELEASE` : Annulation de réservation.
    *   `ADJUSTMENT` : Correction manuelle ou inventaire.
*   `quantity` : Delta de la modification.
*   `reason` : Justification (ex: "Order confirmed").

---

## 📨 Événements Kafka

### Consommés (Entrants)

| Pattern / Sujet | Action | Description |
| :--- | :--- | :--- |
| `product.created` | **Initialisation** | Crée une entrée d'inventaire vide pour un nouveau produit. |
| `inventory.stock.adjust` | **Ajustement** | Augmente ou diminue le stock physique (ex: réassort). |
| `inventory.stock.reserve` | **Réservation** | Bloque du stock pour une commande (`reserved += qty`). Échoue si stock insuffisant. |
| `inventory.stock.confirm` | **Confirmation** | Valide une vente (`quantity -= qty`, `reserved -= qty`). |
| `inventory.stock.release` | **Libération** | Annule une réservation (`reserved -= qty`). |
| `inventory.stock.get` | **Lecture** | Renvoie le stock disponible (`quantity - reserved`). |
| `inventory.update` | **Mise à Jour** | Met à jour les détails (emplacement, seuils, etc.). |

---

## ⚙️ Règles de Gestion & Cycle de Vie

### Stock Disponible
$$ \text{Disponible} = \text{Quantité Totale} - \text{Quantité Réservée} $$

### Cycle de Vie d'une Commande
1.  **Réservation** (`reserve`): Le client passe commande. Le stock est mis de côté.
    *   *Si succès* : La commande passe en attente de paiement/confirmation.
    *   *Si échec* : La commande est refusée immédiatement.
2.  **Confirmation** (`confirm`): Le paiement est validé. Le stock quitte définitivement l'inventaire.
3.  **Annulation** (`release`): La commande est annulée ou le paiement échoue. Le stock réservé est remis en circulation.

### Contraintes
*   **Pas de stock négatif** : Toute opération entraînant `quantity < 0` est rejetée.
*   **Réservation stricte** : Impossible de réserver plus que le disponible.
*   **Libération sécurisée** : Impossible de libérer plus que ce qui a été réservé.

---

## ⚠️ Gestion des Erreurs
*   **Stock Insuffisant (`BadRequestException`)** : Renvoyé si une tentative de réservation dépasse le disponible.
*   **Produit Introuvable (`NotFoundException`)** : Renvoyé si l'ID produit n'existe pas dans l'inventaire.
*   **Conflit (`ConflictException`)** : En cas de concurrence d'accès critique (géré via transactions DB).

---

## 📂 Structure du Projet
```
apps/inventory-service/
├── prisma/                 # Schéma (Inventory, StockMovement)
├── src/
│   ├── inventory.consumer.ts   # Contrôleur Kafka (Handlers)
│   ├── stock.service.ts        # Logique métier & Transactions
│   ├── inventory-service.module.ts
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
nx serve inventory-service
```
