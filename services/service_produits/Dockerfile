FROM node:18-alpine
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/

# Compiler TypeScript
RUN npm run build

# Nettoyer les dépendances de développement
RUN npm prune --production

CMD ["node", "dist/index.js"]
