#!/bin/bash

echo "Waiting for Kafka to be ready..."
sleep 10

echo "Creating Kafka topics..."

# Create topics for each service with partitions and replication factor
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic auth.events --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic catalog.events --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic inventory.events --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic order.events --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic store.events --partitions 3 --replication-factor 1

# Create dedicated health check topics
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health.auth --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health.catalog --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health.inventory --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health.order --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health.store --partitions 1 --replication-factor 1

# Create dedicated health check topics
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health-db.auth --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health-db.catalog --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health-db.inventory --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health-db.order --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic health-db.store --partitions 1 --replication-factor 1

# Create user-related topics
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.registered --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.login --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.verified --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.updated --partitions 3 --replication-factor 1

# Reply topics for request-reply pattern (REQUIRED for ClientKafka.send())
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.registered.reply --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.login.reply --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.refresh.reply --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.logout.reply --partitions 3 --replication-factor 1

# Original topics for request-reply
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.refresh --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic user.logout --partitions 3 --replication-factor 1


# Create order-related topics
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic order.created --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic order.confirmed --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic order.cancelled --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic order.delivered --partitions 3 --replication-factor 1

# Create inventory-related topics
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic inventory.reserved --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic inventory.released --partitions 3 --replication-factor 1
kafka-topics --create --if-not-exists --bootstrap-server kafka:9092 --topic inventory.updated --partitions 3 --replication-factor 1

echo "Listing all topics:"
kafka-topics --list --bootstrap-server kafka:9092

echo "✅ Kafka topics initialized successfully!"
