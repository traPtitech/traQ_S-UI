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
echo "Startup: set app name to $APP_NAME"
sed -i -e "s/<title>traQ<\/title>/<title>$APP_NAME<\/title>/" /usr/share/caddy/index.html
sed -i -e "s/\"name\":\"traQ\",\"short_name\":\"traQ\"/\"name\":\"$APP_NAME\",\"short_name\":\"$APP_NAME\"/" /usr/share/caddy/site.webmanifest

###
# テーマ色設定
###
echo "Startup: set theme color to $THEME_COLOR"
sed -i -e "s/#0D67EA/$THEME_COLOR/g" /usr/share/caddy/index.html

###
# New Relic 設定
###
if [ -n "$NEW_RELIC_LICENSE_KEY" ] && [ -n "$NEW_RELIC_ACCOUNT_ID" ] && [ -n "$NEW_RELIC_TRUST_KEY" ] && [ -n "$NEW_RELIC_AGENT_ID" ] && [ -n "$NEW_RELIC_APPLICATION_ID" ]; then
  echo "Startup: set up New Relic"
  sed -i -e "s/LICENSE_KEY_PLACEHOLDER/$NEW_RELIC_LICENSE_KEY/g" /usr/share/caddy/new-relic.js
  sed -i -e "s/ACCOUNT_ID_PLACEHOLDER/$NEW_RELIC_ACCOUNT_ID/g" /usr/share/caddy/new-relic.js
  sed -i -e "s/TRUST_KEY_PLACEHOLDER/$NEW_RELIC_TRUST_KEY/g" /usr/share/caddy/new-relic.js
  sed -i -e "s/AGENT_ID_PLACEHOLDER/$NEW_RELIC_AGENT_ID/g" /usr/share/caddy/new-relic.js
  sed -i -e "s/APPLICATION_ID_PLACEHOLDER/$NEW_RELIC_APPLICATION_ID/g" /usr/share/caddy/new-relic.js
  CACHE_KEY=$(md5sum /usr/share/caddy/new-relic.js | cut -d ' ' -f 1)
  mv /usr/share/caddy/new-relic.js /usr/share/caddy/new-relic-$CACHE_KEY.js
  sed -i -e "s/<!-- <script src=\"\/new-relic-{hash}.js\"><\/script> -->/<script src=\"\/new-relic-$CACHE_KEY.js\"><\/script>/" /usr/share/caddy/index.html
else
  echo "Startup: New Relic is not configured"
fi

###
# サーバー起動
###
echo "Startup: start server"
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
