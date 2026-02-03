# Investor: DeFi Investment Platform

A sophisticated, multi-chain Decentralized Finance (DeFi) investment platform built with a focus on clean architecture, security, and institutional-grade scalability.

---

## 🚀 Overview

**Investor** is a cross-platform ecosystem designed to bridge the gap between traditional finance and DeFi. By leveraging a high-performance backend and a unified codebase, it provides users with seamless access to investment strategies across multiple blockchain networks.

The project is structured as a **Monorepo** using **Turborepo**, ensuring consistency across the following interfaces:
* **Backend**: NestJS (Fastify-based) powering the core engine.
* **Web**: Next.js for a responsive, SEO-optimized dashboard.
* **Mobile**: React Native for iOS and Android investment tracking.
* **Documentation**: Nextra for high-quality developer and user guides.

---

## 🏗️ Architecture & Core Principles

The project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles to ensure the business logic remains agnostic of external frameworks and tools.



### Event-Driven Strategy
The system utilizes a dual-layered event strategy:
* **Internal Events**: Handled by **EventEmitter2** for decoupled, in-memory communication between application services.
* **External/Distributed Events**: Managed via **Apache Kafka** for high-throughput, resilient communication and eventual consistency across the distributed infrastructure.

### Extensible Integration Ports
To maintain high testability and flexibility, the system communicates through **Ports & Adapters**. This allows us to swap providers without touching core logic:

| Port           | Description                                                    |
| :------------- | :------------------------------------------------------------- |
| **Blockchain** | Interaction with Ethereum, Polygon, and other EVM networks.    |
| **Broker**     | High-performance event messaging (Kafka).                      |
| **Cache**      | Low-latency data retrieval (Dragonfly/Redis).                  |
| **Cipher**     | Advanced data encryption and hashing (AES-256/Bcrypt).         |
| **Coinbase**   | Integration with Coinbase for institutional liquidity.         |
| **Database**   | Persistent storage using PostgreSQL with Liquibase migrations. |
| **Logger**     | Unified logging with context-aware tracking.                   |
| **Mailer**     | Automated communication (SMTP/SendGrid).                       |
| **OIDC**       | Single Sign-On (SSO) authentication.                           |
| **Storage**    | Object storage for documents and assets (Minio/S3).            |
| **Token**      | Security token generation and management (JWT/PASETO).         |

---

## 🛠️ Tech Stack

### Backend
* **Framework**: [NestJS](https://nestjs.com/) with Fastify.
* **Architecture**: CQRS & Event-Driven (Kafka).
* **Validation**: [Zod](https://zod.dev/) for strict schema safety.
* **Observability**: [Loki](https://grafana.com/loki) for full-stack error tracking and performance profiling.

### Infrastructure & DevOps (IaC)
The entire environment is automated through **Infrastructure as Code (IaC)**:
* **Orchestration**: Managed via **Kubernetes** for high availability and horizontal scaling.
* **Provisioning**: Cloud resources (AWS/GCP/Azure) and cluster configurations are fully managed using **Terraform**.
* **Development**: Local orchestration via `docker-compose.yml` for rapid prototyping.



---

## 🗺️ Roadmap & Implementation Status

We are building a comprehensive suite of financial services. Current status:

* **IAM (Identity)**: OIDC integration and 2FA implementation.
* **Catalog**: Asset listing and investment yield simulation.
* **Portfolio**: Smart Contract interaction for investment intents.
* **Treasury**: Blockchain execution for payouts and withdrawals.
* **Support**: Healthcheck and inbox notification system.

---

## 🛠️ Getting Started

### Prerequisites
* Node.js (LTS)
* pnpm
* Docker & Docker Compose

### Local Development
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/leandroluk/investor.git
    cd investor
    ```
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Spin up infrastructure**:
    ```bash
    docker compose up -d
    ```
4.  **Run the apps**:
    ```bash
    pnpm dev
    ```

---

## 🔒 Security & Performance
* **SSO Auth**: Centralized identity management.
* **Audit Logs**: Complete traceability for every financial operation.
* **Rate Limiting**: Protection against brute-force and DDoS.
* **Non-Custodial**: Users maintain control of their assets via wallet integration (MetaMask/Ethers.js).

---

**Investor** is more than an app; it's a demonstration of modern software engineering applied to the most demanding sector: **Finance**.