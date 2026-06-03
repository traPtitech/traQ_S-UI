FROM --platform=$BUILDPLATFORM node:25.7.0-alpine@sha256:18e02657e2a2cc3a87210ee421e9769ff28a1ac824865d64f74d6d2d59f74b6b AS build
WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
COPY patches/ ./patches/
RUN npm ci --unsafe-perm
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM caddy:2.10.0-alpine@sha256:ae4458638da8e1a91aafffb231c5f8778e964bca650c8a8cb23a7e8ac557aa3c
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
