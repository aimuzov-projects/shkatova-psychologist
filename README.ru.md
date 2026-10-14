<p align="center">
	<a href="README.md"><img src="https://img.shields.io/badge/English-555?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PGNsaXBQYXRoIGlkPSJ0Ij48cGF0aCBkPSJNMzAsMTVoMzB2MTV6djE1aC0zMHpoLTMwdi0xNXp2LTE1aDMweiIvPjwvY2xpcFBhdGg+PHBhdGggZD0iTTAsMHYzMGg2MHYtMzB6IiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==" alt="English"></a>
	<img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-e3b48b?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoOXYzSDB6Ii8+PHBhdGggZmlsbD0iIzAwMzlhNiIgZD0iTTAgMmg5djJIMHoiLz48cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNMCA0aDl2MkgweiIvPjwvc3ZnPg==" alt="Русский">
</p>

<p align="center">
	<a href="https://tatiana-shkatova.ru"><img src=".github/assets/banner.jpg" alt="Татьяна Шкатова, перинатальный и детский психолог" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov-projects/shkatova-psychologist/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov-projects/shkatova-psychologist/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://tatiana-shkatova.ru"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftatiana-shkatova.ru&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov-projects%2Fshkatova-psychologist%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-psychologist/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-psychologist/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov-projects/shkatova-psychologist" alt="License"></a>
</p>

<h3 align="center">Сайт перинатального психолога</h3>
<p align="center">Статичный сайт с ИИ-ассистентом, который готовит к первой встрече и отправляет выжимку в Telegram</p>

<table>
	<tr>
		<td width="50%" align="center"><img src=".github/assets/home.jpg" alt="Главная"><br><b>Сайт</b> для клиенток</td>
		<td width="50%" align="center"><img src=".github/assets/chat.jpg" alt="Чат с ассистентом"><br><b>Ассистент</b> перед первой встречей</td>
	</tr>
</table>

Живёт на [tatiana-shkatova.ru](https://tatiana-shkatova.ru). Статичный сайт на [Astro](https://astro.build) с единственным островом на Svelte, чатом ассистента, и маленький сервис (`src/backend/`) на Node без зависимостей: модель он вызывает через OpenRouter, выжимки отправляет в Telegram.

## Что внутри

- **Главная** (`/`): обо мне, с чем работаю, услуги и цены, бесплатные материалы, вопросы, контакты. Фото секций на телефоне едут с параллаксом.
- **Материалы** (`/materials/<slug>/`): бесплатные памятки, у каждой своя страница, описаны в `src/frontend/data/materials.ts`.
- **Ассистент** (`/chat/`): после согласия расспрашивает о ситуации и отправляет Татьяне выжимку с контактом и запросом. При признаках риска даёт телефоны помощи и с согласия сразу шлёт срочную выжимку, не дожидаясь остального. Переписка живёт только в `sessionStorage` вкладки, на сервере не хранится. Входы в чат выключаются флагом `enabled` в `src/shared/chat.ts`.
- **Телефон**: открытым в HTML не попадает. В разметке лежит закодированная строка, ссылки из неё собирает `phone-reveal.ts` уже в браузере, так что сборщики без JavaScript номер не видят.
- **API**: `POST /api/chat` (Server-Sent Events) и `GET /api/health`. Лимиты: 60 сообщений и 10 выжимок в час с одного IP и суточный потолок на весь сервис (`CHAT_DAILY_LIMIT`).

## Запуск

Стек и раскладка как в [infra-site-template](https://github.com/aimuzov-projects/infra-site-template): Astro + Svelte 5, Prettier, oxlint, stylelint (БЭМ), `node --test`. Node берётся из `mise.toml`, эта же версия закреплена в `package.json` и в Dockerfile.

```sh
cp .env.example .env   # заполнить: телефон обязателен, ключи нужны только чату
npm ci
npm run dev            # сайт, /api проксируется на localhost:8787
npm run chat           # сервис ассистента
```

Без `TELEGRAM_BOT_TOKEN` локальный сервис не отправляет выжимки, а печатает их в консоль.

Перед коммитом те же проверки, что в CI:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test
```

E2E-тесты в [`e2e`](e2e) собирают сайт и открывают его в Chromium с общими проверками из [infra-site-kit](https://github.com/aimuzov-projects/infra-site-kit): страницы из sitemap отвечают без ошибок в консоли и проходят axe, Яндекс Метрика ждёт первого действия посетителя. Сборке нужен `CONTACT_PHONE`, подойдёт любой номер. Браузер ставится один раз через `npx playwright install chromium`, дальше `npm run test:e2e`.

## Content Security Policy

Сборка кладёт в каждую страницу CSP с хешами скриптов и стилей Astro (настройка `security.csp` в `astro.config.mjs`). В `npm run dev` политики нет, поэтому нарушения видны только после `npm run build && npm run preview` и на проде.

- Никаких атрибутов `style=""` и обработчиков вроде `onclick`: стили задаются классами и правилами в `<style>`, обработчики живут в `<script>`.
- Внешний скрипт, картинку или запрос (виджет, карту, шрифт с CDN) сначала нужно разрешить в `security.csp`. Сейчас там только Яндекс Метрика.
- После таких правок стоит открыть консоль браузера в `npm run preview`: всё заблокированное браузер пишет туда.

## Выкладка

Сервер projects из [infra-server](https://github.com/aimuzov-projects/infra-server): мерж релизного PR, который ведёт release-please, запускает `deploy.yml`, тот прогоняет проверки и заходит по SSH. Там ключ запускает общий [`deploy/site.sh`](https://github.com/aimuzov-projects/infra-server/blob/main/deploy/site.sh) из infra-server, который подтягивает `main` и пересобирает контейнеры из [`deploy/docker-compose.yml`](deploy/docker-compose.yml): `shkatova-psychologist` (nginx со статикой) и `shkatova-chat` (ассистент). Из РФ OpenRouter и Telegram не отвечают, поэтому чат ходит наружу через общий VPN-выход из infra-server. Домен, TLS и маршрут `/api` держит общий Caddy. `.env` лежит на сервере в `/srv/shkatova-psychologist`.

Быстро откатиться — запустить Deploy вручную с прошлым тегом: `gh workflow run deploy.yml -f tag=v1.2.3`. Исправление плохого коммита выезжает через релизный PR, как любое изменение.

## Лицензия

Код распространяется по лицензии [MIT](LICENSE). Тексты, фотографии, имя и контакты Татьяны Шкатовой под неё не подпадают: все права защищены, использовать их без разрешения нельзя.
