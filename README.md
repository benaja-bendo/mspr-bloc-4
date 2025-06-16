This repository contains a simple platform composed of three microservices that communicate via Kafka.  The codebase is organised as a **pnpm monorepo** so all services share their dependencies and tooling.  Each service exposes a small REST API and can be run locally using Docker Compose or directly with Node.js.

- [pnpm](https://pnpm.io/) (install with `corepack enable` or `npm install -g pnpm` if it isn't already available)

   You can also run a single service locally with pnpm:
   ```bash
   pnpm --filter <service_name> dev
   ```

3. Développez puis vérifiez votre code avec `pnpm -r test` pour vous assurer que l'ensemble des services passent les tests.

| Service              | Stack technique  | Port | Description |
|----------------------|------------------|------|-------------|
| `service_clients`    | Node.js/Express  | 3000 | Gestion des clients |
| `service_produits`   | Node.js/Express  | 3002 | Gestion des produits |
| `service_commande`   | Node.js/Express  | 3001 | Gestion des commandes |

## Prérequis

- Docker et Docker Compose installés
- Node.js 18+ si vous souhaitez exécuter les services sans Docker
- [pnpm](https://pnpm.io/) (voir section installation ci-dessous)

## Installation de pnpm

Si vous n'avez pas encore pnpm installé, vous pouvez l'installer de l'une des manières suivantes :

1. **Avec corepack** (recommandé, inclus avec Node.js 16+) :
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```

2. **Avec npm** :
   ```bash
   npm install -g pnpm
   ```

3. **Avec le script d'installation** (pour Linux/macOS) :
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

4. **Avec Homebrew** (macOS) :
   ```bash
   brew install pnpm
   ```

Vérifiez l'installation avec :
```bash
pnpm --version
```

## Démarrage rapide

1. **Installer les dépendances pour le développement local** (nécessite un accès Internet) :
   ```bash
   pnpm install
   ```

2. **Exécuter tous les services avec Docker Compose** :
   ```bash
   docker compose -f docker/docker-compose.yml up --build
   ```
   Chaque service sera disponible sur les ports indiqués ci-dessus.

3. **Ou exécuter tous les services sans Docker depuis la racine** :
   ```bash
   # Construire tous les services
   pnpm build
   
   # Lancer tous les services en mode développement
   pnpm start:all
   ```
   Cette méthode est idéale pour le développement local sans Docker.

## Exécution des services individuellement

### Depuis la racine du projet

Vous pouvez lancer les services directement depuis la racine du projet sans Docker :

#### Construire tous les services
```bash
pnpm build
```

#### Lancer un service spécifique en mode production
```bash
# Service clients
pnpm start:clients

# Service produits
pnpm start:produits

# Service commande
pnpm start:commande
```

#### Lancer un service spécifique en mode développement
```bash
# Service clients
pnpm dev:clients

# Service produits
pnpm dev:produits

# Service commande
pnpm dev:commande
```

#### Lancer tous les services simultanément en mode développement
```bash
pnpm start:all
```

### Avec Node.js (dans le répertoire du service)

Pour exécuter un service spécifique en mode développement en se plaçant dans son répertoire :

```bash
# Service clients
pnpm --filter service_clients dev

# Service produits
pnpm --filter service_produits dev

# Service commande
pnpm --filter service_commande dev
```

### Avec Docker (individuellement)

Vous pouvez également construire et exécuter chaque service individuellement avec Docker :

```bash
# Service clients
docker build -t service_clients ./services/service_clients
docker run -p 3000:3000 -e KAFKA_BROKER=localhost:9092 service_clients

# Service produits
docker build -t service_produits ./services/service_produits
docker run -p 3002:3002 -e KAFKA_BROKER=localhost:9092 service_produits

# Service commande
docker build -t service_commande ./services/service_commande
docker run -p 3001:3001 -e KAFKA_BROKER=localhost:9092 service_commande
```

## Exécution des tests

### Tous les tests

```bash
pnpm -r test
```

### Tests par service

```bash
# Service clients
pnpm --filter service_clients test

# Service produits
pnpm --filter service_produits test

# Service commande
pnpm --filter service_commande test
```

## Utilisation de base de l'API

- `service_clients`
  - `GET /clients` – liste des clients
  - `POST /clients` – créer un client
- `service_produits`
  - `GET /products` – liste des produits
  - `POST /products` – créer un produit
- `service_commande`
  - `GET /orders` – liste des commandes
  - `POST /orders` – créer une commande

Un endpoint `/health` est également exposé sur chaque service pour vérifier leur état.

## CI/CD

Le projet utilise GitHub Actions pour l'intégration continue et le déploiement continu.

### Workflows CI/CD

1. **Workflows par service** : Chaque service dispose de son propre workflow qui exécute sa suite de tests lorsque des modifications sont apportées à ce service spécifique.
   - Ces workflows sont déclenchés uniquement lorsque des fichiers dans le répertoire du service concerné sont modifiés
   - Ils permettent une validation rapide des changements isolés à un seul service

2. **Workflow global** : Lorsqu'une pull request est ouverte, un workflow dédié exécute les tests pour tous les services afin de valider la pile complète.
   - Ce workflow garantit que les modifications n'ont pas d'impact négatif sur l'ensemble de l'application
   - Il sert de dernière validation avant la fusion dans la branche principale

### Processus de contribution pour les équipes

1. **Créez une branche depuis `main` pour vos évolutions** :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

2. **Installez les dépendances** si nécessaire :
   ```bash
   pnpm install
   ```

3. **Développez votre fonctionnalité** en suivant ces bonnes pratiques :
   - Respectez les conventions de code existantes
   - Ajoutez des tests unitaires pour les nouvelles fonctionnalités
   - Documentez les changements importants

4. **Testez localement** avant de soumettre :
   ```bash
   # Tester uniquement le service modifié
   pnpm --filter <nom-du-service> test
   
   # Ou tester tous les services
   pnpm -r test
   ```

5. **Commitez vos changements** avec des messages clairs et descriptifs :
   ```bash
   git add .
   git commit -m "feat(service_clients): ajoute la validation des emails"
   ```

6. **Poussez votre branche** et ouvrez une Pull Request :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

7. **Attendez la validation CI** : Assurez-vous que tous les tests passent dans le workflow CI

8. **Demandez une revue de code** à vos collègues

9. **Fusionnez** une fois que la PR est approuvée et que tous les tests passent
