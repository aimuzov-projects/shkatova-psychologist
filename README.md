<p align="center">
	<a href="https://tatiana-shkatova.ru"><img src=".github/assets/banner.jpg" alt="Tatiana Shkatova, perinatal and child psychologist" width="100%"></a>
</p>

<p align="center">
	<a href="https://github.com/aimuzov-projects/shkatova-psychologist/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/aimuzov-projects/shkatova-psychologist/deploy.yml?branch=main&label=deploy" alt="Deploy"></a>
	<a href="https://tatiana-shkatova.ru"><img src="https://img.shields.io/website?url=https%3A%2F%2Ftatiana-shkatova.ru&label=site" alt="Site status"></a>
	<a href="package.json"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Faimuzov-projects%2Fshkatova-psychologist%2Fmain%2Fpackage.json&query=%24.engines.node&label=node&logo=nodedotjs&logoColor=white&color=5fa04e" alt="Node"></a>
	<a href="https://astro.build"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-psychologist/astro?logo=astro&logoColor=white&color=bc52ee" alt="Astro"></a>
	<a href="https://svelte.dev"><img src="https://img.shields.io/github/package-json/dependency-version/aimuzov-projects/shkatova-psychologist/svelte?logo=svelte&logoColor=white&color=ff3e00" alt="Svelte"></a>
	<a href="LICENSE"><img src="https://img.shields.io/github/license/aimuzov-projects/shkatova-psychologist" alt="License"></a>
</p>

<p align="center"><b>English</b> · <a href="README.ru.md">Русский</a></p>

Website of Tatiana Shkatova, a perinatal psychologist: [tatiana-shkatova.ru](https://tatiana-shkatova.ru). The site itself is in Russian.

A static site built with [Astro](https://astro.build). The only interactive part is an AI assistant in Svelte: it helps visitors prepare for the first session and sends Tatiana a summary of the conversation. The assistant service (`src/backend/`) is plain Node with no dependencies: it talks to the model through OpenRouter and delivers summaries via Telegram.

## Getting started

Requires Node 26.11.1, the same version is pinned in `package.json` and the Dockerfiles.

```sh
cp .env.example .env   # fill in: the phone is required, the keys are only needed by the chat
npm ci
npm run dev            # the site, /api is proxied to localhost:8787
npm run chat           # the assistant service
```

Before committing:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check && npm test
```

## Content Security Policy

The build puts a CSP with hashes of Astro's scripts and styles into every page (the `security.csp` option in `astro.config.mjs`). `npm run dev` has no policy, so violations only show up after `npm run build && npm run preview` and in production.

- No `style=""` attributes or handlers like `onclick`: styles go through classes and rules in `<style>`, handlers live in `<script>`.
- An external script, image or request (a widget, a map, a font from a CDN) has to be allowed in `security.csp` first. Right now only Yandex Metrica is there.
- After such changes, check the browser console in `npm run preview`: the browser reports everything it blocks there.

## Deployment

A push to `main` triggers GitHub Actions: checks first, then an SSH login to the server. There the key is bound to [`deploy/remote.sh`](deploy/remote.sh), which pulls `main` and rebuilds the containers from [`deploy/docker-compose.yml`](deploy/docker-compose.yml). The domain is served by the server's shared Caddy, and `.env` lives on the server next to the repository.

## License

The code is licensed under [MIT](LICENSE). Texts, photos, name and contacts of Tatiana Shkatova are not covered by it: all rights reserved, no use without permission.
