FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json vite.config.ts ./
RUN npm install
COPY index.html ./
COPY src ./src
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 4173
CMD ["npm", "run", "start"]
