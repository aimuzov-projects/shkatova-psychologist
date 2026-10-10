import { defineConfig } from 'astro/config'

export default defineConfig({
	// Абсолютные ссылки в og:image и og:url: мессенджеры относительные не понимают.
	site: 'https://tatiana-shkatova.ru',
	// CSS всего несколько КБ: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
	// На проде /api отдаёт Caddy сервису чата, в разработке его роль играет прокси Vite.
	vite: { server: { proxy: { '/api': 'http://localhost:8787' } } },
})
