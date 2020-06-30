# alpineにするとnode-gypで死ぬ
FROM node:14.4.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM caddy:2.1.0-alpine
EXPOSE 80
COPY build/docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
