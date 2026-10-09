#!/usr/bin/env bash
# Сборка и выкладка на skator.ru: deploy/deploy.sh [--skip-build]
# Сайт живёт в контейнере nginx (deploy/docker-compose.yml), домен отдаёт Caddy проекта skator.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${SHKATOVA_HOST:-root@skator.ru}"
REMOTE_DIR="${SHKATOVA_REMOTE_DIR:-/opt/shkatova}"
SITE_URL="${SHKATOVA_URL:-https://tanya.aimuzov.online}"

if [[ "${1:-}" != "--skip-build" ]]; then
	npm run build
fi

ssh "$HOST" "mkdir -p $REMOTE_DIR /opt/caddy/sites"
scp deploy/docker-compose.yml deploy/nginx.conf "$HOST:$REMOTE_DIR/"

# rsync на сервере нет. Распаковываем рядом и подменяем папку целиком,
# чтобы посетитель не застал половину старой выкладки и половину новой.
tar -czf - -C dist . | ssh "$HOST" "cd $REMOTE_DIR && rm -rf dist.new && mkdir dist.new && tar -xzf - -C dist.new \
	&& rm -rf dist.old && { [ -d dist ] && mv dist dist.old || true; } && mv dist.new dist"

# Контейнер держит старую папку по inode, поэтому после подмены его надо перезапустить.
ssh "$HOST" "cd $REMOTE_DIR && docker compose up -d && docker compose restart site"

scp deploy/shkatova.caddy "$HOST:/opt/caddy/sites/shkatova.caddy"
ssh "$HOST" "docker exec skator-caddy caddy reload --config /etc/caddy/Caddyfile"

sleep 3
curl -fsS -o /dev/null -w "$SITE_URL → %{http_code}\n" "$SITE_URL/"
