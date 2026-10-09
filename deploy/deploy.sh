#!/usr/bin/env bash
# Выкладка на сервер projects: пушим main, сервер подтягивает его и пересобирает образ.
# Сайт живёт в контейнере nginx (deploy/docker-compose.yml), домен отдаёт общий Caddy
# из aimuzov-projects/server-infra.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${SHKATOVA_HOST:-projects}"
SITE_URL="${SHKATOVA_URL:-https://tatiana-shkatova.ru}"

# Сервер собирает то, что лежит в origin/main, поэтому незакоммиченное туда не попадёт.
if [[ -n "$(git status --porcelain)" ]]; then
	echo "Есть незакоммиченные изменения, сначала закоммитьте их" >&2
	exit 1
fi
if [[ "$(git branch --show-current)" != main ]]; then
	echo "Выкладывается только main" >&2
	exit 1
fi

git push --quiet origin main
ssh "$HOST" 'set -e
cd /srv/shkatova-site
git pull --ff-only --quiet
git log -1 --oneline
docker compose -f deploy/docker-compose.yml up -d --build --quiet-pull
docker image prune -f >/dev/null'

sleep 3
curl -fsS -o /dev/null -w "$SITE_URL → %{http_code}\n" "$SITE_URL/"
