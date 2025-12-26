FROM node:20-alpine

WORKDIR /app

# Dépendances seulement
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Pas de build
CMD ["pnpm", "start:dev", "inventory-service"]
