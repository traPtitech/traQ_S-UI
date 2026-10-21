FROM --platform=$BUILDPLATFORM docker.io/library/node:26.12.1-alpine@sha256:ae8e1c19d56886270987e99b3cfcef13a919f0655b376ae322bc64ada76f88cd AS build
WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
COPY scripts/patch-dependencies.js ./scripts/
RUN npm ci
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM docker.io/library/caddy:2.11.4-alpine@sha256:5f5c8640aae01df9654968d946d8f1a56c497f1dd5c5cda4cf95ab7c14d58648
EXPOSE 80

COPY build/docker/Caddyfile /etc/caddy/Caddyfile
COPY build/docker/startup.sh /startup.sh
RUN chmod 755 /startup.sh

COPY --from=build /app/dist /usr/share/caddy

ENV APP_NAME=traQ
ENV THEME_COLOR=#0D67EA

# 設定上書き処理用に、.brを消して、元の設定を別のディレクトリに保存しておく
RUN cd /usr/share/caddy && \
  mkdir -p /app/default && \
  mkdir -p /app/default/img && \
  rm index.html.br && \
  cp config.js defaultTheme.js index.html manifest.webmanifest /app/default && \
  cp -r img/icons img/services /app/default/img

RUN mkdir -p /app/override
VOLUME ["/app/override"]

CMD ["/startup.sh"]
