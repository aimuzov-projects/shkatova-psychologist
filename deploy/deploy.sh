#!/usr/bin/env bash
# Ручная выкладка на сервер projects. Обычно main выкладывает GitHub Actions сам
# (.github/workflows/deploy.yml), этот скрипт нужен, если Actions недоступны
# или надо пересобрать без нового коммита.
# Сайт живёт в контейнере nginx (deploy/docker-compose.yml), домен отдаёт общий Caddy
# из aimuzov-projects/server-infra.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${SHKATOVA_HOST:-projects}"
SITE_URL="${SHKATOVA_URL:-https://tatiana-shkatova.ru}"

# Сервер собирает то, что лежит в origin/main. Пушить отсюда не будем: пуш сам
# запустит Actions, и выкладка пойдёт дважды.
git fetch --quiet origin main
if [[ "$(git rev-parse main)" != "$(git rev-parse origin/main)" ]]; then
	echo "main не совпадает с origin/main: запушьте его, выложит Actions" >&2
	exit 1
fi

ssh "$HOST" /srv/shkatova-site/deploy/remote.sh

sleep 3
curl -fsS -o /dev/null -w "$SITE_URL → %{http_code}\n" "$SITE_URL/"
