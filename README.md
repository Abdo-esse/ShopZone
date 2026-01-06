# ShopZone 🛒

A scalable **e-commerce microservices platform** built with **NestJS** and designed for high performance and modularity.

## 📋 Overview

ShopZone is a full-stack e-commerce solution implemented as a **microservices monorepo**. It uses event-driven architecture with **Apache Kafka** for inter-service communication, **PostgreSQL** databases for data persistence, **Redis** for caching, and **MinIO** for object storage.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                       (Port 3000)                           │
└───────────────────┬─────────────────────────────────────────┘
                    │ Kafka
    ┌───────────────┼───────────────────────────────┐
    │               │               │               │
┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
│ Auth  │      │Catalog│      │ Order │      │Invent.│
│Service│      │Service│      │Service│      │Service│
└───┬───┘      └───┬───┘      └───┬───┘      └───┬───┘
    │              │              │              │
┌───▼───┐      ┌───▼───┐      ┌───▼───┐      ┌───▼───┐
│auth-db│      │catelog│      │order- │      │invent.│
│       │      │  -db  │      │  db   │      │  -db  │
└───────┘      └───────┘      └───────┘      └───────┘
```

## 📁 Project Structure

```
ShopZone/
├── apps/                       # Microservices
│   ├── api-gateway/           # Entry point for all client requests
│   ├── auth-service/          # Authentication & authorization
│   ├── catalog-service/       # Product catalog management
│   ├── inventory-service/     # Stock & inventory tracking
│   ├── order-service/         # Order processing
│   └── store-service/         # Store management
│
├── libs/                       # Shared libraries
│   └── shared/                # Common utilities, DTOs, Prisma service
│       └── src/
│           ├── dto/           # Data Transfer Objects
│           ├── enums/         # Shared enumerations
│           ├── events/        # Kafka event definitions
│           ├── interfaces/    # TypeScript interfaces
│           └── prisma/        # Prisma service
│
├── scripts/                    # Utility scripts
└── docker-compose.yml         # Container orchestration
```

## 🛠️ Technology Stack

| Component          | Technology                          |
|--------------------|-------------------------------------|
| **Framework**      | NestJS 11.x                        |
| **Language**       | TypeScript 5.x                     |
| **Package Manager**| pnpm                               |
| **Message Broker** | Apache Kafka (Confluent 7.6)       |
| **Databases**      | PostgreSQL 16                      |
| **ORM**            | Prisma 7.x                         |
| **Caching**        | Redis 7                            |
| **Object Storage** | MinIO                              |
| **Authentication** | Passport.js + JWT                  |
| **Validation**     | class-validator, class-transformer |

## 🔧 Services Overview

### API Gateway
- Single entry point for all client requests
- Request routing and load balancing
- Health checks at `/health`

### Auth Service
- User registration and login
- JWT-based authentication
- Role-based access control (USER, ADMIN)
- Email/phone verification support

### Catalog Service
- Product management (CRUD operations)
- Category organization
- Product search and filtering

### Inventory Service
- Real-time stock tracking
- Inventory alerts and notifications
- Stock reservation for orders

### Order Service
- Order creation and management
- Order status tracking
- Payment integration hooks

### Store Service
- Multi-store support
- Store configuration management
- Store-specific settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ShopZone.git
cd ShopZone

# Install dependencies
pnpm install
```

### Running with Docker

```bash
# Start all services (databases, Kafka, microservices)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Running for Development

```bash
# Start infrastructure only
docker-compose up -d zookeeper kafka redis minio auth-db catalog-db order-db inventory-db store-db

# Run specific service
pnpm run start:dev auth-service
```

## 📊 Infrastructure Services

| Service    | Port  | Description                          |
|------------|-------|--------------------------------------|
| API Gateway| 3000  | Main API endpoint                    |
| Kafka      | 9092  | Message broker                       |
| Kafka UI   | 8080  | Kafka management dashboard           |
| Redis      | 6379  | Caching layer                        |
| MinIO      | 9000  | Object storage API                   |
| MinIO UI   | 9001  | MinIO management console             |
| Auth DB    | 5433  | Authentication database              |

## 📝 API Endpoints

### Health Checks
```
GET /health          # API Gateway health
```

### Authentication
```
POST /auth/register  # User registration
POST /auth/login     # User login
GET  /auth/me        # Get current user
```

## 🗄️ Database Schema

### Auth Service - User Model

| Field           | Type     | Description                  |
|-----------------|----------|------------------------------|
| id              | UUID     | Primary key                  |
| email           | String   | Unique email address         |
| phone           | String?  | Optional phone number        |
| password        | String   | Hashed password              |
| role            | Enum     | USER or ADMIN                |
| isEmailVerified | Boolean  | Email verification status    |
| isPhoneVerified | Boolean  | Phone verification status    |
| isActive        | Boolean  | Account active status        |
| isBlocked       | Boolean  | Account blocked status       |
| createdAt       | DateTime | Account creation timestamp   |
| updatedAt       | DateTime | Last update timestamp        |

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run tests with coverage
pnpm run test:cov
```

## 📚 Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `pnpm run start`  | Start the main application         |
| `pnpm run start:dev` | Start in development (watch mode) |
| `pnpm run start:prod` | Start in production              |
| `pnpm run build`  | Build the project                  |
| `pnpm run lint`   | Run ESLint                         |
| `pnpm run format` | Format code with Prettier          |
| `pnpm run test`   | Run unit tests                     |

## 📄 License

This project is UNLICENSED.

---

Built with ❤️ using [NestJS](https://nestjs.com/)
