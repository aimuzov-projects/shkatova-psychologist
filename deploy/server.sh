#!/usr/bin/env bash
# Выкладка на самом сервере: собрать свежий main и подменить dist.
# deploy.sh зовёт его уже после git pull, так что скрипт всегда актуальной версии.
set -euo pipefail

ROOT=/opt/shkatova
REPO="$ROOT/repo"

git -C "$REPO" log -1 --oneline

# Node на хосте нет, собираем в одноразовом контейнере.
docker run --rm -v "$REPO:/app" -w /app node:24-alpine \
	sh -c 'npm ci --no-audit --no-fund --loglevel=error && npm run build'

# Подменяем папку целиком, чтобы посетитель не застал половину старой выкладки и половину новой.
cd "$ROOT"
rm -rf dist.new dist.old
cp -r "$REPO/dist" dist.new
[ -d dist ] && mv dist dist.old
mv dist.new dist

cp "$REPO/deploy/docker-compose.yml" "$REPO/deploy/nginx.conf" "$ROOT/"
# Контейнер держит старую папку по inode, поэтому после подмены его надо перезапустить.
docker compose up -d
docker compose restart site

cp "$REPO/deploy/shkatova.caddy" /opt/caddy/sites/shkatova.caddy
docker exec skator-caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null
