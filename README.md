# Payetonkawa Platform

This repository contains a demonstration platform composed of three microservices communicating through Kafka. Each service exposes a small REST API and can be run locally using Docker Compose.

## Services

| Service              | Tech stack      | Port |
|----------------------|-----------------|------|
| `service_clients`    | Node.js/Express | 3000 |
| `service_produits`   | Node.js/Express | 3002 |
| `service_commande`   | Node.js/Express | 3001 |

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ if you want to run services without Docker

## Getting Started

1. **Install dependencies for local development** (requires Internet access):
   ```bash
   cd services/service_clients && npm ci
   cd ../service_commande && npm ci
   cd ../service_produits && npm ci
   ```

2. **Run all services with Docker Compose**:
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```
   Each service will be available on the ports indicated above.

3. **Run tests**:
   ```bash
   cd services/service_clients && npm test
   cd ../service_commande && npm test
   cd ../service_produits && npm test
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

---
This project is a simplified starting point designed for educational purposes.
