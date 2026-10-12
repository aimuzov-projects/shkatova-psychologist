import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Summary } from './prompt.ts'
import { formatSummary } from './telegram.ts'

const base: Summary = { name: 'Анна', contact: '@anna', who: 'беременная', request: 'тревога', urgent: false }

test('заголовок и только заполненные поля', () => {
	const [message, ...rest] = formatSummary({ ...base, since: '  ' })
	assert.equal(rest.length, 0)
	assert.match(message, /^<b>Заявка из чата на сайте: Анна<\/b>/)
	assert.match(message, /<b>Связь:<\/b> @anna/)
	assert.doesNotMatch(message, /Давность/)
})

test('срочная выжимка помечена в заголовке', () => {
	assert.match(formatSummary({ ...base, urgent: true })[0], /^<b>СРОЧНО<\/b> · /)
})

test('HTML из ответа модели экранируется', () => {
	const [message] = formatSummary({ ...base, name: '<i>Анна</i> & co' })
	assert.match(message, /&lt;i&gt;Анна&lt;\/i&gt; &amp; co/)
})

test('длинная выжимка режется по полям в пределах лимита Telegram', () => {
	const long = 'а'.repeat(3000)
	const messages = formatSummary({ ...base, context: long, impact: long, tried: long })
	assert.ok(messages.length > 1)
	for (const message of messages) assert.ok(message.length <= 4000)
	// Каждое поле целиком в одном сообщении: теги не разорваны.
	for (const message of messages) assert.equal(message.split('<b>').length, message.split('</b>').length)
})
