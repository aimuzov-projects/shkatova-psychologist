import { defineConfig } from 'astro/config'

export default defineConfig({
	// CSS всего несколько КБ: внутри HTML он не блокирует первую отрисовку отдельным запросом.
	build: { inlineStylesheets: 'always' },
})
