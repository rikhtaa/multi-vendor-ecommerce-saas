#  EShop  Multi-Vendor E-Commerce SaaS

A production-ready **multi-vendor e-commerce platform** built with a **Microservice Architecture** inside an **Nx monorepo**. Sellers get their own storefront, buyers get a seamless shopping experience, and admins get full control  all powered by real-time communication, AI-driven recommendations, and ImageKit-based media management.

---

##  Project Structure

```
.
 apps/
�    admin-service/          # Admin REST API (NestJS/Express)
�    admin-ui/               # Admin dashboard (Next.js)
�    api-gateway/            # Unified API gateway with rate limiting & proxying
�    auth-service/           # Authentication & authorization (JWT + cookies)
�    chatting-service/       # Real-time chat via WebSocket (port 6006)
�    kafka-service/          # Kafka event consumer/producer bridge
�    logger-service/         # Centralized logging service
�    order-service/          # Order lifecycle management
�    product-service/        # Product catalog, inventory, and search
�    recommendation-service/ # AI-powered product recommendations (TensorFlow.js)
�    seller-service/         # Seller onboarding, dashboard, and management
�    seller-ui/              # Seller-facing frontend (Next.js)
�    user-ui/                # Buyer-facing storefront (Next.js)
 packages/                   # Shared libraries
 prisma/                     # Prisma schema & migrations (MongoDB)
 generated/                  # Auto-generated Prisma client
 nx.json
 package.json
 tsconfig.base.json
```

---

##  Architecture Overview

EShop follows a **microservice architecture** where each service is independently deployable and communicates via:

- **REST** (through the API Gateway for external clients)
- **Kafka** (async event streaming between services)
- **WebSocket** (real-time chat between buyers and sellers)

```
User / Seller / Admin
        �
   [API Gateway :8080]
        �
   �
   �                                   �
[auth-service]   [product-service]   [order-service]
[seller-service] [admin-service]     [recommendation-service]
        �
   [kafka-service] � [logger-service]
        �
   [chatting-service :6006 / :6008]
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Monorepo tooling | Nx 22, pnpm workspaces |
| Backend framework | Express.js |
| Frontend framework | Next.js 16 (React 19) |
| Database | MongoDB (via Prisma 5) |
| Caching | Redis (Upstash) |
| Message broker | Kafka (KafkaJS) |
| AI / Recommendations | TensorFlow.js |
| Media management | ImageKit |
| Authentication | JWT (access + refresh tokens), bcryptjs |
| Payments | Stripe |
| Email | Nodemailer (Gmail SMTP) |
| Real-time chat | WebSocket |
| API documentation | Swagger (swagger-autogen + swagger-ui-express) |
| Forms | React Hook Form + Zod |
| State management | Zustand, Jotai |
| Styling | Tailwind CSS v3, styled-components |
| Charts | Recharts, ApexCharts |
| Node requirement | >= 20 |
| Package manager | pnpm 9 |

---

##  Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- A MongoDB Atlas cluster
- An Upstash Redis database
- A Kafka cluster (e.g. Confluent Cloud)
- A Stripe account
- An ImageKit account
- A Gmail account (for SMTP)

### Installation

```bash
git clone <repository-url>
cd eshop
pnpm install
```

---

##  Environment Variables

### Root `.env`

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/development"

# Redis (Upstash)
REDIS_DATABASE_URL="https://<your-upstash-url>"
REDIS_PASSWORD="<your-upstash-password>"

# SMTP (Gmail)
SMTP_USER="your@gmail.com"
SMTP_PASS="<app-password>"
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com

# JWT
JWT_SECRET="<secret>"
ACCESS_TOKEN_SECRET="<access-secret>"
REFRESH_TOKEN_SECRET="<refresh-secret>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ImageKit
IMAGE_PUBLIC_KEY="public_..."
IMAGE_SECRET_KEY="private_..."

# Kafka
KAFKA_API_KEY="<kafka-user>"
KAFKA_API_SECRET="<kafka-secret>"
```

### `apps/user-ui/.env.local`

```env
NEXT_PUBLIC_SERVER_URI="http://localhost:8080"
NEXT_PUBLIC_SELLER_SERVER_URI="http://localhost:3001"
NEXT_PUBLIC_CHATTING_WEBSOCKET_URI="ws://localhost:6006"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
```

### `apps/seller-ui/.env.local`

```env
NEXT_PUBLIC_SERVER_URI="http://localhost:8080"
NEXT_PUBLIC_USER_UI_LINK="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URI="ws://localhost:6008"
```

### `apps/admin-ui/.env.local`

```env
NEXT_PUBLIC_SERVER_URI="http://localhost:8080"
NEXT_PUBLIC_USER_UI_LINK="http://localhost:3000"
NEXT_PUBLIC_CHATTING_WEBSOCKET_URI="ws://localhost:6006"
```

---

##  Development

### Run Everything at Once

```bash
pnpm dev:all
```

### Run Individual Apps

```bash
# Auth service (default dev target)
pnpm dev

# User storefront
pnpm user-ui

# Seller dashboard
pnpm seller-ui

# Admin dashboard
pnpm admin-ui

# Chatting service
pnpm chatting-service
```

### API Documentation

```bash
# Generate and serve auth-service Swagger docs
pnpm auth-docs

# Generate and serve product-service Swagger docs
pnpm product-docs
```

---

##  Service Ports

| Service | Port |
|---|---|
| API Gateway | 8080 |
| User UI | 3000 |
| Seller UI / Seller Service | 3001 |
| Chatting Service (buyer�seller) | 6006 |
| Chatting Service (admin) | 6008 |

---

##  Key Features

**User Storefront**
- Browse products by category, filter by price range
- AI-powered product recommendations (TensorFlow.js)
- Real-time chat with sellers
- Stripe-powered checkout with webhook support
- Order tracking and history

**Seller Dashboard**
- Seller onboarding and profile management
- Product listing with ImageKit media uploads
- Order management and fulfillment
- Real-time buyer chat
- Revenue analytics (Recharts / ApexCharts)

**Admin Dashboard**
- Platform-wide oversight of users, sellers, and orders
- Vendor approval and moderation
- Analytics and reporting

**Infrastructure**
- API Gateway with rate limiting (`express-rate-limit`) and proxying (`express-http-proxy`)
- Kafka event bus for decoupled async communication
- Centralized logging service
- JWT-based auth with access/refresh token rotation
- Redis caching for sessions and hot data
- Prisma ORM with MongoDB Atlas

---

##  Build

```bash
# Build all apps and packages
pnpm build

# Build a specific app
npx nx build auth-service
npx nx build user-ui
```

---

##  Linting & Type Checking

```bash
# Lint all
npx nx run-many --target=lint --all

# Type check all
npx nx run-many --target=typecheck --all
```

---

##  API Docs

Swagger UI is available after running the relevant service:

- Auth Service: `http://localhost:<auth-port>/api-docs`
- Product Service: `http://localhost:<product-port>/api-docs`

Generate doc files with:

```bash
pnpm auth-docs
pnpm product-docs
```

---

##  Media Management

All product and seller images are managed via **ImageKit**. Configure your ImageKit public and private keys in the root `.env`. The `imagekit` Node.js SDK is used server-side for signed uploads, and the ImageKit CDN handles delivery and transformations.

---

##  License

MIT  see [LICENSE](./LICENSE) for details.
