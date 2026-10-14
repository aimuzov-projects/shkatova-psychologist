import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

// Vite отдаёт .env только в import.meta.env, а src/shared/site.ts читает process.env:
// тот же модуль выполняется и в чистом Node у чата.
// Файла может не быть, тогда окружение уже задано.
try {
	process.loadEnvFile()
} catch {}

// На проде /api отдаёт Caddy сервису чата, локально его роль играет прокси Vite: и в dev, и в preview.
const proxy = { '/api': 'http://localhost:8787' }

export default defineConfig({
	// Абсолютные ссылки в og:image и og:url: мессенджеры относительные не понимают.
	site: 'https://tatiana-shkatova.ru',
	// Рядом с сайтом в src/ лежат сервис чата и общий с ним код.
	srcDir: './src/frontend',
	// CSS всего несколько КБ: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
	// Svelte только у чата: остальной сайт -- статичный HTML с ванильными скриптами.
	integrations: [svelte(), sitemap()],
	// Markdown на сайте нет, а подсветка Shiki несовместима с CSP.
	markdown: { syntaxHighlight: false },
	// Astro кладёт CSP с хешами своих скриптов и стилей в <meta> страницы.
	// Хеш и источники Метрики добавляет сам её компонент из infra-site-kit.
	// frame-ancestors в <meta> не действует, встраивание запрещает X-Frame-Options
	// в Caddy.
	security: {
		csp: {
			scriptDirective: { resources: ["'self'"] },
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				"connect-src 'self'",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
		},
	},
	vite: { server: { proxy }, preview: { proxy } },
})
