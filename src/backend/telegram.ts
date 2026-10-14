import type { Summary } from './prompt.ts'

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fields: [keyof Summary, string][] = [
	['contact', 'Связь'],
	['who', 'Кто'],
	['context', 'Контекст'],
	['request', 'Запрос'],
	['since', 'Давность'],
	['impact', 'Влияние на жизнь'],
	['tried', 'Что пробовала'],
	['support', 'Опоры'],
	['expectations', 'Ожидания'],
	['format', 'Формат и время'],
	['notes', 'Заметки ассистента'],
]

export function formatSummary(summary: Summary) {
	const head = `${summary.urgent ? '<b>СРОЧНО</b> · ' : ''}<b>Заявка из чата на сайте: ${escape(summary.name || 'без имени')}</b>`
	const body = fields
		.filter(([key]) => typeof summary[key] === 'string' && (summary[key] as string).trim())
		.map(([key, label]) => `<b>${label}:</b> ${escape((summary[key] as string).slice(0, 3000))}`)
	// У Telegram предел 4096 символов на сообщение. Режем по границам полей,
	// чтобы не разорвать HTML-тег посередине.
	const messages = [head]

	for (const part of body) {
		if (messages.at(-1)!.length + part.length + 2 > 4000) messages.push(part)
		else messages[messages.length - 1] += `\n\n${part}`
	}

	return messages
}

export async function sendSummary(summary: Summary) {
	const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatIds = '' } = process.env
	const recipients = chatIds
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean)

	if (!token || !recipients.length) throw new Error('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы')

	const messages = formatSummary(summary)

	const sendTo = async (chatId: string) => {
		for (const text of messages) {
			const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
			})

			if (!res.ok) throw new Error(`Telegram ${res.status}: ${(await res.text()).slice(0, 300)}`)
		}
	}

	// Выжимка считается доставленной, если дошла хотя бы одному получателю:
	// посетителю незачем видеть ошибку, когда психолог её уже получил.
	const results = await Promise.allSettled(recipients.map(sendTo))
	const failures = results.flatMap((result, i) =>
		result.status === 'rejected' ? [`${recipients[i]}: ${(result.reason as Error).message}`] : [],
	)

	if (failures.length === recipients.length) throw new Error(failures.join('; '))

	for (const failure of failures) console.error('summary delivery failed for', failure)
}
