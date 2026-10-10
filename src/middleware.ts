import { defineMiddleware } from 'astro:middleware'
import { typograph } from './lib/typograph'

// Сайт статический: middleware отрабатывает на сборке
// и прогоняет каждую страницу через типограф.
export const onRequest = defineMiddleware(async (_, next) => {
	const response = await next()
	if (!response.headers.get('content-type')?.includes('text/html')) return response

	return new Response(typograph(await response.text()), {
		status: response.status,
		headers: response.headers,
	})
})
