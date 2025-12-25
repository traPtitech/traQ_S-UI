#!/bin/bash -eu

SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/.."

mkdir -p .certs

docker run --rm \
    --mount type=bind,source=./.certs,target=/certs \
    alpine/mkcert@sha256:a8f4f5af61908b4c79c2e9d1e5f23e747f29de174649209ebafcab03d4f6d5fd \
    -key-file ./certs/localhost.key \
    -cert-file ./certs/localhost.crt \
    localhost
