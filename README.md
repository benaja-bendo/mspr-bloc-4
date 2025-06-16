# Payetonkawa Platform

This repository contains a demonstration platform composed of three microservices communicating through Kafka. Each service exposes a small REST API and can be run locally using Docker Compose.

## Services

| Service              | Tech stack      | Port |
|----------------------|-----------------|------|
| `service_clients`    | Node.js/Express | 3000 |
| `service_produits`   | Python/FastAPI  | 3002 |
| `service_commande`   | Node.js/Express | 3001 |

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and Python 3.11+ if you want to run services without Docker

## Getting Started

1. **Install dependencies for local development**:
   ```bash
   cd services/service_clients && npm install
   cd ../service_commande && npm install
   cd ../service_produits && pip install -r requirements.txt
   ```

2. **Run all services with Docker Compose**:
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```
   Each service will be available on the ports indicated above.

3. **Run tests**:
   ```bash
   # Node services
   cd services/service_clients && npm test
   cd ../service_commande && npm test

   # Python service
   cd ../service_produits && pytest
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

A GitHub Actions workflow installs dependencies and runs the test suites for all services on every push or pull request.

---
This project is a simplified starting point designed for educational purposes.
