import { limits } from '#/data/chat.ts'

import type { Message } from './openrouter.ts'
import type { Summary } from './prompt.ts'

// Историю присылает браузер, поэтому ответы ассистента в ней тоже чужой ввод.
// Без потолка на всю историю ключ модели работал бы как бесплатный прокси.
export function parseMessages(body: unknown): Message[] | null {
	const messages = (body as { messages?: unknown })?.messages
	if (!Array.isArray(messages) || !messages.length || messages.length > limits.messages) return null
	const valid = messages.every(
		(m, i) =>
			// Роли строго чередуются, первой и последней пишет клиентка.
			m?.role === (i % 2 ? 'assistant' : 'user') &&
			typeof m.content === 'string' &&
			m.content.trim() &&
			m.content.length <= (m.role === 'user' ? limits.userChars : limits.assistantChars),
	)
	if (!valid || messages.length % 2 === 0) return null
	const total = messages.reduce((sum, m) => sum + m.content.length, 0)
	if (total > limits.historyChars) return null
	return messages.map((m) => ({ role: m.role, content: m.content }))
}

const str = (value: unknown) => (typeof value === 'string' ? value : value == null ? '' : String(value))

// Аргументы инструмента пишет модель: схема для неё лишь пожелание, поля бывают
// пустыми, числами или вовсе отсутствуют.
export function normalizeSummary(raw: unknown): Summary | null {
	if (!raw || typeof raw !== 'object') return null
	const s = raw as Record<string, unknown>
	return {
		name: str(s.name),
		contact: str(s.contact),
		who: str(s.who),
		context: str(s.context),
		request: str(s.request),
		since: str(s.since),
		impact: str(s.impact),
		tried: str(s.tried),
		support: str(s.support),
		expectations: str(s.expectations),
		format: str(s.format),
		urgent: s.urgent === true || s.urgent === 'true',
		notes: str(s.notes),
	}
}
