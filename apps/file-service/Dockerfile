FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install

COPY . .

RUN npx nx build file-service --verbose

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist/apps/file-service ./dist/apps/file-service

EXPOSE 3001
CMD ["node", "dist/apps/file-service/main.js"]
