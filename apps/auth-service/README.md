# Auth Service

## 📖 Vue d'ensemble
Le **Auth Service** est un microservice central responsable de la gestion de l'authentification et de la sécurité dans l'écosystème **ShopZone**. Il assure la création de comptes, l'authentification des utilisateurs, et la gestion des sessions via des tokens JWT et Refresh Tokens.

Il fonctionne de manière asynchrone en utilisant **Kafka** pour communiquer avec les autres services (notamment l'API Gateway) et **Prisma** pour interagir avec sa base de données PostgreSQL dédiée.

---

## 🏗 Architecture & Rôle
Dans notre architecture microservices :
*   **Responsabilité Unique** : Gestion des identités et des accès.
*   **Communication** : Exclusivement via **Kafka**. Il consomme des patterns de messages (`user.login`, `user.registered`, etc.) émis par l'API Gateway.
*   **Base de Données** : Possède sa propre base de données PostgreSQL (isolée des autres services) pour stocker les utilisateurs (`User`) et les tokens de rafraîchissement (`RefreshToken`).

### Responsabilités Principales
1.  **Inscription (Register)** : Création de nouveaux utilisateurs avec hachage de mot de passe (Bcrypt).
2.  **Connexion (Login)** : Validation des identifiants et génération de paires de tokens (Access Token + Refresh Token).
3.  **Rafraîchissement (Refresh)** : Émission de nouveaux Access Tokens via un Refresh Token valide.
4.  **Déconnexion (Logout)** : Révocation des Refresh Tokens.

---

## 🛠 Fonctionnalités Détaillées

### 1. Inscription (`user.registered`)
*   **Action** : Reçoit un DTO avec email, mot de passe, etc.
*   **Processus** :
    *   Vérifie si l'email existe déjà.
    *   Hache le mot de passe.
    *   Crée l'utilisateur en base avec le rôle par défaut (`USER`).
*   **Retour** : Données de l'utilisateur (sans mot de passe).

### 2. Connexion (`user.login`)
*   **Action** : Reçoit email et mot de passe.
*   **Processus** :
    *   Vérifie l'existence de l'utilisateur.
    *   Valide le mot de passe.
    *   Génère un **Access Token** (courte durée) et un **Refresh Token** (longue durée).
    *   Stocke le hash du Refresh Token en base.
*   **Retour** : `accessToken`, `refreshToken`, info utilisateur.

### 3. Rafraîchissement (`user.refresh`)
*   **Action** : Reçoit un Refresh Token.
*   **Processus** :
    *   Vérifie la validité et l'expiration du token.
    *   Vérifie si le token correspond à celui stocké en base (rotation de tokens).
*   **Retour** : Nouveau `accessToken` et `refreshToken`.

### 4. Déconnexion (`user.logout`)
*   **Action** : Reçoit l'ID utilisateur et le token.
*   **Processus** : Supprime le Refresh Token de la base de données.

---

## 📂 Structure du Projet
```
apps/auth-service/
├── prisma/                 # Schéma de base de données et migrations
│   └── schema.prisma       # Modèles User et RefreshToken
├── src/
│   ├── auth-service.controller.ts  # Point d'entrée des messages Kafka
│   ├── auth-service.service.ts     # Logique métier (hachage, JWT, DB)
│   ├── auth-service.module.ts      # Configuration du module
│   └── main.ts                     # Point d'entrée de l'application (Microservice)
├── .env                    # Variables d'environnement (DB_URL, JWT_SECRET, etc.)
└── Dockerfile              # Configuration pour le déploiement
```

---

## ✅ Bonnes Pratiques Implémentées

### 🔒 Sécurité
*   **Bcrypt** : Les mots de passe sont toujours hachés avant stockage.
*   **JWT (JSON Web Tokens)** : Utilisés pour l'authentification stateless.
*   **Refresh Tokens Rotatifs** : Les refresh tokens sont stockés de manière sécurisée et peuvent être révoqués.
*   **Validation** : Utilisation de DTOs partagés (`libs/shared/src/dto`) avec `class-validator`.

### ⚡ Performance & Scalabilité
*   **Event-Driven** : Utilisation de Kafka pour découpler l'authentification de l'API Gateway.
*   **Prisma ORM** : Accès performant et typé à la base de données.

---

## 🚀 Comment Utiliser et Implémenter

### Pré-requis
*   Kafka doit être en cours d'exécution.
*   PostgreSQL doit être accessible.

### Démarrage
```bash
# Lancer les migrations Prisma
npx prisma migrate dev

# Démarrer le service
nx serve auth-service
```

### Exemple de consommation (Client Kafka)
Depuis l'API Gateway ou un autre service :

```typescript
// Envoyer une demande de connexion
this.client.send('user.login', { email: 'test@example.com', password: 'password123' })
    .subscribe(response => {
        console.log('Access Token:', response.accessToken);
    });
```
