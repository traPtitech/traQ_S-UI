# alpineにするとnode-gypで死ぬ
FROM node:14.16.1 as build
WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

COPY package*.json ./
COPY patches/ ./patches/
RUN npm ci --unsafe-perm
COPY . .
RUN NODE_ENV=production npm run build:with-font


FROM caddy:2.4.2-alpine
EXPOSE 80

COPY build/docker/Caddyfile /etc/caddy/Caddyfile
COPY build/docker/startup.sh /startup.sh
RUN chmod 755 /startup.sh

COPY --from=build /app/dist /usr/share/caddy

ENV APP_NAME traQ
ENV THEME_COLOR #0D67EA

# 設定上書き処理用に、.brを消して、元の設定を別のディレクトリに保存しておく
RUN cd /usr/share/caddy && \
  mkdir -p /app/default && \
  mkdir -p /app/default/img && \
  rm config.js.br defaultTheme.js.br index.html.br img/services/*.br && \
  cp config.js defaultTheme.js index.html site.webmanifest /app/default && \
  cp -r img/icons img/services /app/default/img

RUN mkdir -p /app/override
VOLUME ["/app/override"]

CMD ["/startup.sh"]
