#!/bin/sh

###
# デフォルトで上書き
###
echo "Startup: copy default files"

cp -r /app/default/* /usr/share/caddy

###
# 上書き用ファイル
###
echo "Startup: check override files"

ls /app/override/* >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Startup: copy override files"
  cp -r /app/override/* /usr/share/caddy
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
