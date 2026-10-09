#!/usr/bin/env bash
# Выкладка на skator.ru: пушим main, дальше сервер собирает сам (deploy/server.sh).
# Сайт живёт в контейнере nginx (deploy/docker-compose.yml), домен отдаёт Caddy проекта skator.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${SHKATOVA_HOST:-root@skator.ru}"
SITE_URL="${SHKATOVA_URL:-https://tanya.aimuzov.online}"

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
ssh "$HOST" /opt/shkatova/repo/deploy/server.sh

sleep 3
curl -fsS -o /dev/null -w "$SITE_URL → %{http_code}\n" "$SITE_URL/"
