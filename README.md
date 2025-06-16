# Payetonkawa Platform

This repository contains a minimal skeleton implementing the architecture described for a three microservice application using Docker and Kafka.

## Structure

```
services/
  service_clients/    # Node.js (Express)
  service_produits/   # Python (FastAPI)
  service_commande/   # Node.js (Express)
libs/
  kafka/js-client/    # Kafka wrapper for Node.js
  kafka/py-client/    # Kafka wrapper for Python
```

Each service exposes a simple `/health` endpoint and can be run via Docker. The `docker/docker-compose.yml` file orchestrates Kafka, Zookeeper, and the services.
