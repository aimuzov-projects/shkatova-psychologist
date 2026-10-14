#!/usr/bin/env bash
# Выкладка на самом сервере: подтянуть main и пересобрать контейнеры.
# Её вызывают GitHub Actions на каждый пуш в main и при ручном запуске workflow.
# Для ключа из Actions это единственная разрешённая команда (command= в authorized_keys).
set -euo pipefail

# Тело в блоке: bash дочитает его целиком до того, как git pull подменит этот файл.
{
	cd /srv/shkatova-psychologist

	# One deploy at a time for all the sites: parallel builds choke the small server,
	# so a deploy of any site waits here for the previous one.
	exec 9>/tmp/sites-deploy.lock
	flock 9

	git pull --ff-only --quiet
	git log -1 --oneline
	docker compose -f deploy/docker-compose.yml up -d --build --quiet-pull
	docker image prune -f >/dev/null
	exit
}
