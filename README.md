<p align="center">
	<img src="https://img.shields.io/badge/English-e3b48b?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PGNsaXBQYXRoIGlkPSJ0Ij48cGF0aCBkPSJNMzAsMTVoMzB2MTV6djE1aC0zMHpoLTMwdi0xNXp2LTE1aDMweiIvPjwvY2xpcFBhdGg+PHBhdGggZD0iTTAsMHYzMGg2MHYtMzB6IiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTAsMCA2MCwzME02MCwwIDAsMzAiIGNsaXAtcGF0aD0idXJsKCN0KSIgc3Ryb2tlPSIjQzgxMDJFIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMTAiLz48cGF0aCBkPSJNMzAsMHYzME0wLDE1aDYwIiBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNiIvPjwvc3ZnPg==" alt="English">
	<a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-555?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoOXYzSDB6Ii8+PHBhdGggZmlsbD0iIzAwMzlhNiIgZD0iTTAgMmg5djJIMHoiLz48cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNMCA0aDl2MkgweiIvPjwvc3ZnPg==" alt="Русский"></a>
</p>

<p align="center">
	<a href="https://tatiana-shkatova.ru"><img src=".github/assets/banner.en.jpg" alt="Tatiana Shkatova, perinatal and child psychologist" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov/shkatova-psychologist/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov/shkatova-psychologist/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://tatiana-shkatova.ru"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftatiana-shkatova.ru&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov%2Fshkatova-psychologist%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov/shkatova-psychologist/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov/shkatova-psychologist/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov/shkatova-psychologist" alt="License"></a>
</p>

<h3 align="center">Website of a perinatal psychologist</h3>
<p align="center">A static site with an AI assistant that prepares clients for the first session and sends the summary to Telegram</p>

<table>
	<tr>
		<td width="50%" align="center"><img src=".github/assets/home.jpg" alt="Home page"><br><b>Site</b> for clients</td>
		<td width="50%" align="center"><img src=".github/assets/chat.jpg" alt="Assistant chat"><br><b>Assistant</b> before the first session</td>
	</tr>
</table>

Lives at [tatiana-shkatova.ru](https://tatiana-shkatova.ru). A static [Astro](https://astro.build) site with a single Svelte island, the assistant chat, plus a small dependency-free Node service (`src/backend/`) that talks to the model through OpenRouter and delivers summaries via Telegram.

The site and the assistant are in Russian, so the names below are translated.

## What's inside

- **Home** (`/`): about, topics, services and prices, free materials, FAQ, contacts. Section photos scroll with parallax on phones.
- **Materials** (`/materials/<slug>/`): free guides, each on its own page, described in `src/frontend/data/materials.ts`.
- **Assistant** (`/chat/`): after consent it asks about the situation, then sends Tatiana a summary with the contact and the request. On signs of risk it gives crisis lines and, with consent, sends an urgent summary without waiting for the rest. The conversation lives only in the tab's `sessionStorage` and is not stored on the server. The chat entry points can be turned off with `enabled` in `src/shared/chat.ts`.
- **Phone number**: never in the HTML as is. The markup holds an encoded string, and `phone-reveal.ts` turns it into links in the browser, so scrapers without JavaScript don't see it.
- **API**: `POST /api/chat` (Server-Sent Events) and `GET /api/health`. Limits: 60 messages and 10 summaries per hour from one IP, plus a daily cap for the whole service (`CHAT_DAILY_LIMIT`).

## Running

Stack and layout follow [infra-site-template](https://github.com/aimuzov/infra-site-template): Astro + Svelte 5, Prettier, oxlint, stylelint (BEM), `node --test`. Node comes from `mise.toml`, the same version is pinned in `package.json` and the Dockerfiles.

```sh
cp .env.example .env   # fill in: the phone is required, the keys are only needed by the chat
npm ci
npm run dev            # the site, /api is proxied to localhost:8787
npm run chat           # the assistant service
```

Without `TELEGRAM_BOT_TOKEN` the local service prints summaries to the console instead of sending them.

Before committing, the same checks as in CI:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test
```

The e2e tests in [`e2e`](e2e) build the site and open it in Chromium with the shared checks of [infra-site-kit](https://github.com/aimuzov/infra-site-kit): the sitemap pages answer without console errors and pass axe, Yandex Metrica waits for the first interaction. The build needs `CONTACT_PHONE`, any number will do. The browser is installed once with `npx playwright install chromium`, then `npm run test:e2e`.

## Content Security Policy

The build puts a CSP with hashes of Astro's scripts and styles into every page (the `security.csp` option in `astro.config.mjs`). `npm run dev` has no policy, so violations only show up after `npm run build && npm run preview` and in production.

- No `style=""` attributes or handlers like `onclick`: styles go through classes and rules in `<style>`, handlers live in `<script>`.
- An external script, image or request (a widget, a map, a font from a CDN) has to be allowed in `security.csp` first. Right now only Yandex Metrica is there.
- After such changes, check the browser console in `npm run preview`: the browser reports everything it blocks there.

## Deployment

The projects server from [infra-server](https://github.com/aimuzov/infra-server): merging the release PR that release-please keeps open runs `deploy.yml`, which runs the checks and logs in over SSH. There the key runs the shared [`deploy/site.sh`](https://github.com/aimuzov/infra-server/blob/main/deploy/site.sh) of infra-server, which pulls `main` and rebuilds the containers from [`deploy/docker-compose.yml`](deploy/docker-compose.yml): `shkatova-psychologist` (nginx with the static site) and `shkatova-chat` (the assistant). OpenRouter and Telegram don't answer from Russia, so the chat goes out through the shared VPN exit from infra-server. The domain, TLS and the `/api` route are handled by the shared Caddy. `.env` lives on the server in `/srv/shkatova-psychologist`.

To roll back fast, run Deploy by hand with the previous tag: `gh workflow run deploy.yml -f tag=v1.2.3`. A fix of the bad commit goes out through the release PR like any change.

## License

The code is licensed under [MIT](LICENSE). Texts, photos, name and contacts of Tatiana Shkatova are not covered by it: all rights reserved, no use without permission.
