FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install

COPY . .

RUN npx nx build frontend-angular --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/apps/frontend-angular/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
