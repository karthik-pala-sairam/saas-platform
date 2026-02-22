FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install

COPY . .

RUN npx nx build auth-service --verbose

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist/apps/auth-service ./dist/apps/auth-service

EXPOSE 3000
CMD ["node", "dist/apps/auth-service/main.js"]
