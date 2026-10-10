# shkatova-site

**English** · [Русский](README.ru.md)

Website of Tatiana Shkatova, a perinatal psychologist: [tatiana-shkatova.ru](https://tatiana-shkatova.ru). The site itself is in Russian.

A static site built with [Astro](https://astro.build). The only interactive part is an AI assistant in Svelte: it helps visitors prepare for the first session and sends Tatiana a summary of the conversation. The assistant service (`chat/`) is plain Node with no dependencies: it talks to the model through OpenRouter and delivers summaries via Telegram.

## Getting started

Requires Node 24.

```sh
cp .env.example .env   # fill in: the phone is required, the keys are only needed by the chat
npm ci
npm run dev            # the site, /api is proxied to localhost:8787
npm run chat           # the assistant service
```

Before committing:

```sh
npm run format:check && npm run lint:js && npm run lint:css && npm run check
```

## Deployment

A push to `main` triggers GitHub Actions: checks first, then an SSH login to the server. There the key is bound to [`deploy/remote.sh`](deploy/remote.sh), which pulls `main` and rebuilds the containers from [`deploy/docker-compose.yml`](deploy/docker-compose.yml). The domain is served by the server's shared Caddy, and `.env` lives on the server next to the repository.

## License

The code is licensed under [MIT](LICENSE). Texts, photos, name and contacts of Tatiana Shkatova are not covered by it: all rights reserved, no use without permission.
