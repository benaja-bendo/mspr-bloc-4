# Service Clients

Ce service gère les clients de la plateforme PayeTonKawa. Il permet de créer, lister et gérer les clients.

## Fonctionnalités

- API REST pour la gestion des clients
- Stockage des données en mémoire ou dans une base PostgreSQL
- Communication événementielle via Kafka

## Prérequis

- Node.js 18 ou supérieur
- pnpm (gestionnaire de paquets)
- Docker et Docker Compose (pour le développement avec conteneurs)
- PostgreSQL (optionnel, pour la persistance des données)
- Kafka (optionnel, pour la communication événementielle)

## Installation

```bash
# Installation des dépendances
pnpm install
```

## Développement

### Sans Docker

```bash
# Lancement en mode développement
pnpm dev

# Exécution des tests
pnpm test

# Construction du projet
pnpm build

# Lancement en mode production
pnpm start
```

### Avec Docker (développement)

Le service peut être lancé en mode développement avec Docker Compose :

```bash
# Dans le répertoire du service
docker-compose -f docker-compose.dev.yml up
```

Cette commande lance :
- Une base de données PostgreSQL
- Un broker Kafka avec Zookeeper
- Le service clients en mode développement

## Production

### Construction de l'image Docker

```bash
docker build -t service_clients .
```

### Lancement avec Docker Compose (production)

Depuis la racine du projet :

```bash
docker-compose -f docker/docker-compose.yml up service_clients
```

Ou pour lancer tous les services :

```bash
docker-compose -f docker/docker-compose.yml up
```

## Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| PORT | Port d'écoute du serveur | 3000 |
| DATABASE_URL | URL de connexion à la base PostgreSQL | - |
| KAFKA_BROKER | Adresse du broker Kafka | - |

## API

### GET /clients

Récupère la liste des clients.

### POST /clients

Crée un nouveau client.

Corps de la requête :
```json
{
  "name": "Nom du client"
}
```

### GET /health

Vérifie l'état du service.