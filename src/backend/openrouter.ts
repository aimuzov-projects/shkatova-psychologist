import { summaryTool, systemPrompt } from './prompt.ts'

export type Message = { role: 'user' | 'assistant'; content: string }

type ToolCall = { name: string; arguments: string }

/** Расход на ответ: токены промпта, из них из кеша, токены ответа и цена в долларах. */
export type Usage = { prompt: number; cached: number; completion: number; cost: number }

const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-5.5'

// Ответ модели по кусочкам: текст отдаётся сразу через onText, вызов инструмента
// приходит частями и склеивается к концу потока.
export async function complete(messages: Message[], onText: (chunk: string) => void, signal: AbortSignal) {
	const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		// Таймаут на весь поток: иначе повисший VPN-выход держал бы соединение.
		signal: AbortSignal.any([signal, AbortSignal.timeout(90_000)]),
		headers: {
			Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://tatiana-shkatova.ru',
			'X-Title': 'tatiana-shkatova.ru chat',
		},
		body: JSON.stringify({
			model,
			stream: true,
			max_tokens: 1000,
			messages: [
				// Системный промпт одинаков для всех разговоров: из кеша он в десять раз дешевле.
				{
					role: 'system',
					content: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
				},
				...messages,
			],
			tools: [summaryTool],
			usage: { include: true },
		}),
	})

	if (!res.ok || !res.body) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`)

	const calls: ToolCall[] = []
	let usage: Usage | null = null
	let buffer = ''
	const decoder = new TextDecoder()

	for await (const bytes of res.body) {
		buffer += decoder.decode(bytes, { stream: true })
		const lines = buffer.split('\n')

		buffer = lines.pop() ?? ''

		for (const line of lines) {
			// Строки-комментарии вида ": OPENROUTER PROCESSING" держат соединение, их пропускаем.
			if (!line.startsWith('data: ')) continue

			const data = line.slice(6).trim()

			if (data === '[DONE]') continue

			const chunk = JSON.parse(data)

			if (chunk.error) throw new Error(`OpenRouter: ${chunk.error.message ?? JSON.stringify(chunk.error)}`)

			if (chunk.usage)
				usage = {
					prompt: chunk.usage.prompt_tokens ?? 0,
					cached: chunk.usage.prompt_tokens_details?.cached_tokens ?? 0,
					completion: chunk.usage.completion_tokens ?? 0,
					cost: chunk.usage.cost ?? 0,
				}

			const delta = chunk.choices?.[0]?.delta

			if (delta?.content) onText(delta.content)

			for (const call of delta?.tool_calls ?? []) {
				const slot = (calls[call.index ?? 0] ??= { name: '', arguments: '' })

				if (call.function?.name) slot.name += call.function.name

				if (call.function?.arguments) slot.arguments += call.function.arguments
			}
		}
	}

	const summary = calls.find((call) => call.name === summaryTool.function.name)

	return { summary: summary ? JSON.parse(summary.arguments || '{}') : null, usage }
}
