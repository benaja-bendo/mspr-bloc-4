# Payetonkawa Platform

This repository contains a demonstration platform composed of three microservices communicating through Kafka.  The project is organised as a **pnpm monorepo**.  Each service exposes a small REST API and can be run locally using Docker Compose or directly with Node.js.

## Services

| Service              | Tech stack      | Port |
|----------------------|-----------------|------|
| `service_clients`    | Node.js/Express | 3000 |
| `service_produits`   | Node.js/Express | 3002 |
| `service_commande`   | Node.js/Express | 3001 |

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ if you want to run services without Docker
- [pnpm](https://pnpm.io/) (install with `corepack enable` or `npm install -g pnpm`)

## Getting Started

1. **Install dependencies for local development** (requires Internet access):
   ```bash
   pnpm install
   ```

2. **Run all services with Docker Compose**:
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```
   Each service will be available on the ports indicated above.

3. **Run tests**:
   ```bash
   pnpm -r test
   ```

## Basic API Usage

- `service_clients`
  - `GET /clients` – list clients
  - `POST /clients` – create a client
- `service_produits`
  - `GET /products` – list products
  - `POST /products` – create a product
- `service_commande`
  - `GET /orders` – list orders
  - `POST /orders` – create an order

A `/health` endpoint is also exposed on each service.

## CI/CD

The project uses GitHub Actions for continuous integration.
Each service has its own workflow that runs its test suite when changes to that
service are pushed. When a pull request is opened, a dedicated workflow executes
the tests for all services to validate the full stack.

## Workflow for contributors

1. Créez une branche depuis `main` pour vos évolutions :
   ```bash
   git checkout -b ma-fonctionnalite
   ```
2. Exécutez `pnpm install` pour installer les dépendances si nécessaire.
3. Développez puis vérifiez votre code avec `pnpm -r test`.
4. Commitez et poussez votre branche avant d'ouvrir une Pull Request.

---
This project is a simplified starting point designed for educational purposes.
