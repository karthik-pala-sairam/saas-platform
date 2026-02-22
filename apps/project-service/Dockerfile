FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install

COPY . .

RUN npx nx build project-service --verbose

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist/apps/project-service ./dist/apps/project-service

EXPOSE 3002

CMD ["node", "dist/apps/project-service/main.js"]
