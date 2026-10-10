import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { limits } from '../../src/data/chat.ts'
import { complete, type Message } from './openrouter.ts'
import { formatSummary, sendSummary } from './telegram.ts'
import type { Summary } from './prompt.ts'

const port = Number(process.env.PORT || 8787)
const production = process.env.NODE_ENV === 'production'

if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY не задан')

// Переписка не хранится нигде: история живёт в браузере и приходит целиком
// в каждом запросе. В лог пишутся только статус, длина диалога и время.

const hour = 60 * 60 * 1000
const rates = { requests: 60, summaries: 3 }
const hits = new Map<string, { requests: number[]; summaries: number[] }>()

// Счётчики в памяти и обнуляются при перезапуске: для защиты ключа хватает.
function allow(ip: string, kind: keyof typeof rates) {
	const now = Date.now()
	const entry = hits.get(ip) ?? { requests: [], summaries: [] }
	entry[kind] = entry[kind].filter((t) => now - t < hour)
	hits.set(ip, entry)
	if (entry[kind].length >= rates[kind]) return false
	entry[kind].push(now)
	return true
}

setInterval(() => {
	const now = Date.now()
	for (const [ip, entry] of hits) {
		if ([...entry.requests, ...entry.summaries].every((t) => now - t >= hour)) hits.delete(ip)
	}
}, hour).unref()

// Сервис стоит за Caddy и наружу не торчит, поэтому заголовку прокси можно верить.
const clientIp = (req: IncomingMessage) =>
	String(req.headers['x-forwarded-for'] ?? '')
		.split(',')[0]
		.trim() ||
	(req.socket.remoteAddress ?? '')

function parseMessages(body: unknown): Message[] | null {
	const messages = (body as { messages?: unknown })?.messages
	if (!Array.isArray(messages) || !messages.length || messages.length > limits.messages) return null
	const valid = messages.every(
		(m, i) =>
			// Роли строго чередуются, первой и последней пишет клиентка.
			m?.role === (i % 2 ? 'assistant' : 'user') &&
			typeof m.content === 'string' &&
			m.content.trim() &&
			m.content.length <= (m.role === 'user' ? limits.userChars : 4 * limits.userChars),
	)
	if (!valid || messages.length % 2 === 0) return null
	return messages.map((m) => ({ role: m.role, content: m.content }))
}

async function readBody(req: IncomingMessage) {
	let size = 0
	const chunks: Buffer[] = []
	for await (const chunk of req) {
		size += chunk.length
		if (size > 512 * 1024) throw new Error('too large')
		chunks.push(chunk)
	}
	return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const json = (res: ServerResponse, status: number, data: object) =>
	res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(data))

async function deliver(summary: Summary) {
	if (!production && !process.env.TELEGRAM_BOT_TOKEN) {
		console.log(`[dev] выжимка вместо Telegram:\n${formatSummary(summary).join('\n\n')}`)
		return
	}
	await sendSummary(summary)
}

async function chat(req: IncomingMessage, res: ServerResponse) {
	const started = Date.now()
	const ip = clientIp(req)
	if (!allow(ip, 'requests')) return json(res, 429, { error: 'Слишком много сообщений, попробуйте через час' })

	let messages: Message[] | null = null
	try {
		messages = parseMessages(await readBody(req))
	} catch {}
	if (!messages) return json(res, 400, { error: 'Некорректный запрос' })

	res.writeHead(200, {
		'Content-Type': 'text/event-stream; charset=utf-8',
		'Cache-Control': 'no-cache, no-transform',
		Connection: 'keep-alive',
	})
	const send = (event: string, data: object) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

	// Закрыли вкладку -- не тратим токены на ответ, который никто не прочитает.
	const abort = new AbortController()
	res.on('close', () => abort.abort())

	let status = 'ok'
	try {
		const summary: Summary | null = await complete(messages, (text) => send('delta', { text }), abort.signal)
		if (summary) {
			let delivered = false
			if (allow(ip, 'summaries')) {
				try {
					await deliver(summary)
					delivered = true
				} catch (error) {
					console.error('summary delivery failed:', (error as Error).message)
				}
			}
			status = delivered ? (summary.urgent ? 'summary-urgent' : 'summary') : 'summary-failed'
			send('done', { delivered })
		}
	} catch (error) {
		if (!abort.signal.aborted) {
			status = 'error'
			console.error('completion failed:', (error as Error).message)
			send('error', { error: 'Не получилось ответить, попробуйте отправить сообщение ещё раз' })
		} else status = 'aborted'
	}
	res.end()
	console.log(`chat ${status} messages=${messages.length} ${Date.now() - started}ms`)
}

createServer((req, res) => {
	const path = req.url?.split('?')[0]
	if (req.method === 'GET' && path === '/api/health') return json(res, 200, { ok: true })
	if (req.method === 'POST' && path === '/api/chat') {
		chat(req, res).catch((error) => {
			console.error(error)
			if (!res.headersSent) json(res, 500, { error: 'Ошибка сервера' })
			else res.end()
		})
		return
	}
	json(res, 404, { error: 'Not found' })
}).listen(port, () => console.log(`chat listening on :${port}`))
