# Inventory Service Integration Documentation

This document describes the implementation of the Inventory Service and its integration with the Catalog Service.

## Architecture Overview

The integration uses an event-driven architecture via Kafka for asynchronous tasks and a request-response pattern for synchronous checks.

### 1. Product Creation Flow
1.  **Catalog Service**: When a product is created, it emits a `product.created` event via Kafka.
2.  **Inventory Service**: Listens for `product.created` and automatically creates a new inventory entry for that product with 0 quantity.

### 2. Secure Product Deletion Flow
The `remove` method in `ProductService` (Catalog) now performs a safety check:
1.  **Stock Check**: It requests the current available stock from the Inventory Service.
2.  **Logic**:
    *   **If Inventory Service is DOWN**: The product status is set to `PENDING_DELETE`. This allows for manual or automated retry once the service is back.
    *   **If Stock > 0**: The deletion is blocked, and a `ConflictException` is thrown.
    *   **If Stock == 0**: The product is soft-deleted (`isDeleted: true`).

## Inventory Service Features

The Inventory Service provides a comprehensive set of operations:

### Stock Management Operations
- `createInventory`: Initializes stock for a product.
- `isInStock`: Checks if a specific quantity is available.
- `getAvailableStock`: Returns total minus reserved stock.
- `adjustStock`: Increases or decreases total stock (with reason logging).
- `reserveStock`: Temporarily holds stock (e.g., during checkout).
- `confirmReservedStock`: Finalizes a reservation (decreases both total and reserved).
- `releaseReservedStock`: Cancels a reservation.
- `decreaseStock`: Shortcut for negative adjustment.

### API Endpoints
- `GET /stock/:productId`: Get available stock.
- `GET /stock/:productId/in-stock`: Check if in stock.
- `PATCH /stock/:productId/adjust`: Adjust stock levels.
- `POST /stock/:productId/reserve`: Reserve stock.
- `POST /stock/:productId/confirm`: Confirm reservation.
- `POST /stock/:productId/release`: Release reservation.

### Stock History
Every operation that changes stock levels or reservations creates a record in the `StockMovement` table for auditability.

## Implementation Details

### Catalog Service
- Modified [schema.prisma](apps/catalog-service/prisma/schema.prisma) to add `PENDING_DELETE` status.
- Updated [product.service.ts](apps/catalog-service/src/product/product.service.ts) with Kafka integration and deletion logic.

### Inventory Service
- Created [stock.service.ts](apps/inventory-service/src/stock.service.ts) for business logic.
- Created [inventory.consumer.ts](apps/inventory-service/src/inventory.consumer.ts) for Kafka events/messages.
- Created [stock.controller.ts](apps/inventory-service/src/stock.controller.ts) for REST API.
