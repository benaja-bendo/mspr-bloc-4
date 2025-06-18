# Service Webshop

Ce service fournit l'interface utilisateur web pour la plateforme PayeTonKawa. Il permet aux utilisateurs d'interagir avec les services backend (clients, commandes, produits).

## Fonctionnalités

- Interface utilisateur React
- Communication avec les API des services backend
- Gestion des clients et des commandes
- Visualisation des produits

## Prérequis

- Node.js 18 ou supérieur
- pnpm (gestionnaire de paquets)
- Docker et Docker Compose (pour le développement avec conteneurs)
- Services backend (clients, commandes, produits) accessibles

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

# Prévisualisation du build
pnpm preview
```

### Avec Docker (développement)

Le service peut être lancé en mode développement avec Docker Compose :

```bash
# Dans le répertoire du service
docker-compose -f docker-compose.dev.yml up
```

Cette commande lance l'application web sur le port 5173.

## Production

### Construction de l'image Docker

```bash
docker build -t service_webshop .
```

### Lancement avec Docker

```bash
docker run -p 4173:4173 -e VITE_API_URL=http://api-gateway:3000 service_webshop
```

## Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| VITE_API_URL | URL de l'API backend | http://localhost:3000 |

## Accès à l'application

- En développement : http://localhost:5173
- En production : http://localhost:4173