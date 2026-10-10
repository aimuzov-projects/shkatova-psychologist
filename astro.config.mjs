import svelte from '@astrojs/svelte'
import { defineConfig } from 'astro/config'

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
