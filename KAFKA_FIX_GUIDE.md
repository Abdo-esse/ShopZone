# 🔧 Résolution des Erreurs Kafka & NestJS

## 📋 Problèmes Identifiés

### 1. ❌ Erreur Kafka (auth-service)
```
KafkaJSProtocolError: This server does not host this topic-partition
```
**Cause**: Les topics Kafka n'ont pas été créés avant le démarrage des microservices.

### 2. ❌ Erreur NestJS (api-gateway)
```
Nest can't resolve dependencies of the HealthService (?)
Please make sure that the argument "KAFKA_CLIENT" at index [0] is available in the HealthModule context.
```
**Cause**: Le `HealthModule` n'importait pas le `KafkaModule` qui fournit `KAFKA_CLIENT`.

---

## ✅ Solutions Appliquées

### 1. Correction de l'Injection de Dépendance
**Fichier modifié**: `apps/api-gateway/src/health/health.module.ts`

Ajout de l'import `KafkaModule` pour rendre `KAFKA_CLIENT` disponible:
```typescript
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],  // ← Ajouté
  controllers: [HealthController],
  providers: [HealthService],
})
```

### 2. Création du Script d'Initialisation Kafka
**Nouveau fichier**: `scripts/init-kafka-topics.sh`

Ce script crée automatiquement tous les topics Kafka requis:
- Topics par service: `auth.events`, `catalog.events`, `inventory.events`, `order.events`, `store.events`
- Topic de santé: `health.check`
- Topics utilisateur: `user.registered`, `user.verified`, `user.updated`
- Topics commandes: `order.created`, `order.confirmed`, `order.cancelled`, `order.delivered`
- Topics inventaire: `inventory.reserved`, `inventory.released`, `inventory.updated`

### 3. Service d'Initialisation Kafka dans Docker Compose
**Fichier modifié**: `docker-compose.yml`

Ajout d'un service `kafka-init` qui:
- S'exécute après que Kafka soit en bonne santé
- Crée tous les topics nécessaires
- S'arrête après l'exécution (restart: "no")

```yaml
kafka-init:
  image: confluentinc/cp-kafka:7.6.0
  depends_on:
    kafka:
      condition: service_healthy
  volumes:
    - ./scripts/init-kafka-topics.sh:/scripts/init-kafka-topics.sh
  entrypoint: ["/bin/bash", "/scripts/init-kafka-topics.sh"]
  restart: "no"
```

### 4. Mise à Jour des Dépendances des Services
**Fichier modifié**: `docker-compose.yml`

Tous les microservices attendent maintenant que:
1. Kafka soit en bonne santé
2. Les topics soient créés (kafka-init)

```yaml
depends_on:
  kafka:
    condition: service_healthy
  kafka-init:
    condition: service_completed_successfully
  auth-db:
    condition: service_started
```

---

## 🚀 Comment Redémarrer les Services

### Option 1: Redémarrage Complet (Recommandé)
```bash
docker-compose down -v
docker-compose up --build
```

### Option 2: Seulement les Services Affectés
```bash
docker-compose restart api-gateway auth-service
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier que tous les topics ont été créés
```bash
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

### 2. Vérifier les logs du service kafka-init
```bash
docker logs kafka-init
```

### 3. Vérifier que l'API Gateway démarre correctement
```bash
docker logs api-gateway
```

### 4. Vérifier que auth-service démarre correctement
```bash
docker logs auth-service
```

### 5. Tester le endpoint de santé
```bash
curl http://localhost:3000/health
```

---

## 📊 Architecture Mise à Jour

```
┌─────────────┐
│  Zookeeper  │
└──────┬──────┘
       │
┌──────▼──────┐
│    Kafka    │◄────── healthcheck
└──────┬──────┘
       │
┌──────▼──────┐
│ kafka-init  │ (Crée les topics puis s'arrête)
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
│ api-gateway │ │auth-svc  │ │catalog-svc  │ │order-svc │ ...
└─────────────┘ └──────────┘ └─────────────┘ └──────────┘
```

---

## 🔍 Topics Kafka Créés

| Topic               | Partitions | Description                    |
|---------------------|------------|--------------------------------|
| `auth.events`       | 3          | Événements d'authentification  |
| `catalog.events`    | 3          | Événements du catalogue        |
| `inventory.events`  | 3          | Événements d'inventaire        |
| `order.events`      | 3          | Événements de commandes        |
| `store.events`      | 3          | Événements des magasins        |
| `health.check`      | 1          | Vérifications de santé         |
| `user.registered`   | 3          | Utilisateurs enregistrés       |
| `user.verified`     | 3          | Utilisateurs vérifiés          |
| `user.updated`      | 3          | Utilisateurs mis à jour        |
| `order.created`     | 3          | Commandes créées               |
| `order.confirmed`   | 3          | Commandes confirmées           |
| `order.cancelled`   | 3          | Commandes annulées             |
| `order.delivered`   | 3          | Commandes livrées              |
| `inventory.reserved`| 3          | Inventaire réservé             |
| `inventory.released`| 3          | Inventaire libéré              |
| `inventory.updated` | 3          | Inventaire mis à jour          |

---

## 🎯 Prochaines Étapes

1. **Démarrer les services** avec `docker-compose up --build`
2. **Vérifier les logs** de chaque service
3. **Tester les endpoints** de l'API Gateway
4. **Monitorer Kafka** via Kafka UI sur http://localhost:8080

---

## 📚 Ressources Utiles

- [Documentation KafkaJS](https://kafka.js.org/)
- [Documentation NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Kafka Topics Management](https://kafka.apache.org/documentation/#topicconfigs)
