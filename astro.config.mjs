import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

// Vite отдаёт .env только в import.meta.env, а src/data/site.ts читает process.env:
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
	// CSS всего несколько КБ: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
	// Svelte только у чата: остальной сайт -- статичный HTML с ванильными скриптами.
	integrations: [svelte()],
	vite: { server: { proxy }, preview: { proxy } },
})
