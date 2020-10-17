# alpineにするとnode-gypで死ぬ
FROM node:14.11.0 as build
WORKDIR /app
COPY package*.json ./
COPY patches/* ./
RUN npm ci
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM caddy:2.2.1-alpine
EXPOSE 80
COPY build/docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
