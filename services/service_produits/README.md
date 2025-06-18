# Service Produits

Ce service gère les produits de la plateforme PayeTonKawa. Il permet de créer, lister et gérer les produits et leur stock.

## Fonctionnalités

- API REST pour la gestion des produits et des catégories
- Gestion des stocks et des réservations
- Stockage des données en mémoire ou dans une base PostgreSQL
- Communication événementielle via Kafka
- Alertes de stock bas

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
- Le service produits en mode développement

## Production

### Construction de l'image Docker

```bash
docker build -t service_produits .
```

### Lancement avec Docker Compose (production)

Depuis la racine du projet :

```bash
docker-compose -f docker/docker-compose.yml up service_produits
```

Ou pour lancer tous les services :

```bash
docker-compose -f docker/docker-compose.yml up
```

## Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| PORT | Port d'écoute du serveur | 3002 |
| DATABASE_URL | URL de connexion à la base PostgreSQL | - |
| KAFKA_BROKER | Adresse du broker Kafka | - |

## API

### Produits

#### GET /products

Récupère la liste des produits.

#### GET /products/:id

Récupère un produit par son ID.

#### POST /products

Crée un nouveau produit.

Corps de la requête :
```json
{
  "name": "Nom du produit",
  "categoryId": 1,
  "stock": 10
}
```

#### PATCH /products/:id

Met à jour un produit existant.

### Gestion des stocks

#### POST /stocks/reserve

Réserve une quantité de stock pour un produit.

#### POST /stocks/release

Libère une réservation de stock.

#### POST /stocks/commit

Confirme une réservation et réduit le stock disponible.

### Catégories

#### GET /categories

Récupère la liste des catégories.

#### POST /categories

Crée une nouvelle catégorie.

### GET /health

Vérifie l'état du service.