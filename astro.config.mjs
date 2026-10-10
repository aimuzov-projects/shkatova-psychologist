import { defineConfig } from 'astro/config'

export default defineConfig({
	// CSS всего несколько КБ: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
	// На проде /api отдаёт Caddy сервису чата, в разработке его роль играет прокси Vite.
	vite: { server: { proxy: { '/api': 'http://localhost:8787' } } },
})
