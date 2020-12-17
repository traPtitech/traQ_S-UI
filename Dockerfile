# alpineにするとnode-gypで死ぬ
FROM node:14.15.2 as build
WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
COPY patches/ ./patches/
RUN npm ci --unsafe-perm
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM caddy:2.2.1-alpine
EXPOSE 80
COPY build/docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
