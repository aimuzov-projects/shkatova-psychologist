<p align="center">
	<a href="https://tatiana-shkatova.ru"><img src=".github/assets/banner.jpg" alt="Татьяна Шкатова, перинатальный и детский психолог" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov-projects/shkatova-site/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov-projects/shkatova-site/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://tatiana-shkatova.ru"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftatiana-shkatova.ru&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov-projects%2Fshkatova-site%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-site/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-site/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov-projects/shkatova-site" alt="License"></a>
</p>

<p align="center"><a href="README.md">English</a> · <b>Русский</b></p>

Сайт перинатального психолога Татьяны Шкатовой: [tatiana-shkatova.ru](https://tatiana-shkatova.ru).

Статичный сайт на [Astro](https://astro.build), из интерактива только ИИ-ассистент на Svelte. Он помогает подготовиться к первой встрече и отправляет Татьяне выжимку разговора. Сервис ассистента (`chat/`) написан на Node без зависимостей: модель вызывается через OpenRouter, выжимки уходят в Telegram.

## Запуск

Нужен Node 26.11.1, эта же версия закреплена в `package.json` и в Dockerfile.

```sh
cp .env.example .env   # заполнить: телефон обязателен, ключи нужны только чату
npm ci
npm run dev            # сайт, /api проксируется на localhost:8787
npm run chat           # сервис ассистента
```

Перед коммитом:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test
```

## Content Security Policy

Сборка кладёт в каждую страницу CSP с хешами скриптов и стилей Astro (настройка `security.csp` в `astro.config.mjs`). В `npm run dev` политики нет, поэтому нарушения видны только после `npm run build && npm run preview` и на проде.

- Никаких атрибутов `style=""` и обработчиков вроде `onclick`: стили задаются классами и правилами в `<style>`, обработчики живут в `<script>`.
- Внешний скрипт, картинку или запрос (виджет, карту, шрифт с CDN) сначала нужно разрешить в `security.csp`. Сейчас там только Яндекс Метрика.
- После таких правок стоит открыть консоль браузера в `npm run preview`: всё заблокированное браузер пишет туда.

## Выкладка

Пуш в `main` запускает GitHub Actions: сначала проверки, затем вход по SSH на сервер. Там ключ привязан к [`deploy/remote.sh`](deploy/remote.sh), который подтягивает `main` и пересобирает контейнеры из [`deploy/docker-compose.yml`](deploy/docker-compose.yml). Домен обслуживает общий Caddy сервера, `.env` лежит на сервере рядом с репозиторием.

## Лицензия

Код распространяется по лицензии [MIT](LICENSE). Тексты, фотографии, имя и контакты Татьяны Шкатовой под неё не подпадают: все права защищены, использовать их без разрешения нельзя.
