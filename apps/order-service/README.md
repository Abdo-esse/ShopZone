# Order Service

## 📖 Vue d'ensemble
Le **Order Service** est le chef d'orchestre des processus de commande e-commerce de **ShopZone**. Il gère le cycle de vie complet d'une commande, de sa création à sa livraison, en coordonnant les actions avec les services d'Inventaire, de Paiement (à venir) et de Logistique (à venir).

Il implémente un pattern **Saga** (chorégraphié) pour garantir la cohérence des données distribuées, notamment la réservation de stock.

---

## 🏗 Architecture & Rôle
*   **Orchestration** : Coordonne les processus distribués (ex: Commande créée -> Réserver Stock).
*   **Machine à États** : Gère strictement les transitions de statut (PENDING -> CONFIRMED -> SHIPPED...).
*   **Intégrité** : Garantit que seules les commandes avec du stock validé sont confirmées.

### Flux Saga (Simplifié)
1.  **Order Service** crée la commande (`PENDING`).
2.  Émet l'événement `order.created`.
3.  **Inventory Service** réserve le stock.
    *   *Succès* : Émet `inventory.stock.reserved` -> **Order Service** passe en `CONFIRMED`.
    *   *Échec* : Émet `inventory.stock.failed` -> **Order Service** passe en `CANCELLED`.

---

## 📦 Entités Métier

### 1. Order
L'entité centrale.
*   `id` : UUID.
*   `userId` : ID du client.
*   `status` : État actuel (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
*   `totalAmount` : Montant total calculé (somme des items).
*   `shippingAddress` : Adresse de livraison.
*   `notes` : Remarques ou raison d'annulation.

### 2. OrderItem
Détail des produits commandés.
*   `productId` : ID du produit.
*   `quantity` : Quantité commandée.
*   `price` : Prix unitaire au moment de la commande (Snapshot).

---

## 📨 Événements Kafka

### Consommés (Réponses & Commandes)

| Pattern / Sujet | Source | Action |
| :--- | :--- | :--- |
| `order.create` | API Gateway | Crée une commande `PENDING`. |
| `order.cancel` | API Gateway | Annule une commande. |
| `inventory.stock.reserved` | **Inventory** | Confirme la commande (`PENDING` -> `CONFIRMED`). |
| `inventory.stock.failed` | **Inventory** | Annule la commande (`PENDING` -> `CANCELLED`). |

### Émis (Événements)

| Sujet | Déclencheur | Destinataire Principal | Description |
| :--- | :--- | :--- | :--- |
| `order.created` | Création initiale | **Inventory** | Demande de réservation de stock. |
| `order.confirmed` | Stock réservé | **Payment** (Futur) | Déclenche le processus de paiement. |
| `order.cancelled` | Annulation | **Inventory** | Libère le stock précédemment réservé. |
| `order.shipped` | Expédition | Notification | La commande a été expédiée. |
| `order.delivered` | Livraison | Notification | La commande a été livrée. |

---

## ⚙️ Règles de Gestion & Cycle de Vie

### Statuts et Transitions
| Statut | Transition Possible Vers | Condition |
| :--- | :--- | :--- |
| **PENDING** | `CONFIRMED`, `CANCELLED` | Attente réponse stock. |
| **CONFIRMED** | `PROCESSING`, `CANCELLED` | Stock validé. |
| **PROCESSING** | `SHIPPED` | En préparation. |
| **SHIPPED** | `DELIVERED` | Expédié. |
| **DELIVERED** | *Final* | Reçu par le client. |
| **CANCELLED** | *Final* | Stock invalide ou annulation client. |

### Calculs
*   `TotalAmount` = Somme(Item.Quantity * Item.Price). Calculé côté serveur pour éviter les fraudes.

---

## ⚠️ Gestion des Erreurs
*   **Idempotence** : Le traitement de `inventory.stock.reserved` vérifie si la commande est toujours `PENDING` avant de confirmer, évitant les doubles confirmations.
*   **Timeout / Panne** : Si l'Inventory Service ne répond pas, la commande reste `PENDING`. Un mécanisme de "timeout" (batch job) pourrait être ajouté pour annuler les commandes bloquées trop longtemps.

---

## 📂 Structure du Projet
```
apps/order-service/
├── prisma/                 # Schéma (Order, OrderItem)
├── src/
│   ├── orders/             # Module Orders
│   │   ├── orders.controller.ts  # Handlers Kafka/RPC
│   │   ├── orders.service.ts     # Machine à états & Logique
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
nx serve order-service
```
