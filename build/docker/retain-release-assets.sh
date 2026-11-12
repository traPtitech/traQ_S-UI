#!/usr/bin/env bash
set -euo pipefail

image=$1
current_tag=$2
destination=$3

tags=$(gh release list --exclude-drafts --exclude-pre-releases --limit 20 --json tagName |
  jq -r --arg current "$current_tag" \
    '[.[].tagName | select(test("^v[0-9]+\\.[0-9]+\\.[0-9]+$") and . != $current)] | .[:7] | reverse[]')

mkdir -p "$destination/assets" "$destination/fonts"
container=

cleanup() {
  if [[ -n $container ]]; then
    docker rm "$container" >/dev/null
  fi
}

trap cleanup EXIT

for tag in $tags; do
  release_image="$image:${tag#v}"
  docker pull "$release_image"
  container=$(docker create "$release_image")
  docker cp "$container:/usr/share/caddy/assets/." "$destination/assets"
  docker cp "$container:/usr/share/caddy/fonts/." - |
    tar -xf - -C "$destination/fonts" --wildcards --no-wildcards-match-slash './*.woff2'
  cleanup
  container=
done
