#!/bin/sh

###
# デフォルトで上書き
###
echo "Startup: copy default files"

cp -r -L /app/default/* /usr/share/caddy

###
# 上書き用ファイル
###
echo "Startup: check override files"

ls /app/override/* >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Startup: copy override files"
  cp -r -L /app/override/* /usr/share/caddy
fi

###
# アプリ名設定
###
if [ -n "${APP_NAME:-}" ]; then
  echo "Startup: set app name to $APP_NAME"

  jq -Rrs --arg name "$APP_NAME" \
    'gsub("<title>traQ</title>"; "<title>" + ($name | @html) + "</title>")' \
    /usr/share/caddy/index.html > /tmp/index.html &&
    mv /tmp/index.html /usr/share/caddy/index.html

  jq --arg name "$APP_NAME" \
    '.name = $name | .short_name = $name' \
    /usr/share/caddy/manifest.webmanifest > /tmp/manifest.webmanifest &&
    mv /tmp/manifest.webmanifest /usr/share/caddy/manifest.webmanifest
fi
###
# テーマ色設定
###
echo "Startup: set theme color to $THEME_COLOR"
sed -i -e "s/#0D67EA/$THEME_COLOR/g" /usr/share/caddy/index.html

###
# サーバー起動
###
echo "Startup: start server"
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
