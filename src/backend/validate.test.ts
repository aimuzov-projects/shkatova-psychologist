import assert from 'node:assert/strict'
import { test } from 'node:test'

import { limits } from '#shared/chat.ts'

import { normalizeSummary, parseMessages } from './validate.ts'

const user = (content = 'привет') => ({ role: 'user', content })
const assistant = (content = 'здравствуйте') => ({ role: 'assistant', content })

test('принимает чередование, которое начинает и заканчивает клиентка', () => {
	assert.deepEqual(parseMessages({ messages: [user(), assistant(), user()] }), [user(), assistant(), user()])
})

test('отбрасывает лишние поля сообщений', () => {
	assert.deepEqual(parseMessages({ messages: [{ ...user(), extra: 1 }] }), [user()])
})

test('отклоняет неверный порядок ролей и пустой ввод', () => {
	assert.equal(parseMessages({ messages: [assistant()] }), null)
	assert.equal(parseMessages({ messages: [user(), assistant()] }), null)
	assert.equal(parseMessages({ messages: [user(), user(), user()] }), null)
	assert.equal(parseMessages({ messages: [user('   ')] }), null)
	assert.equal(parseMessages({ messages: [] }), null)
	assert.equal(parseMessages(null), null)
})

test('отклоняет слишком длинные реплики и историю', () => {
	assert.equal(parseMessages({ messages: [user('а'.repeat(limits.userChars + 1))] }), null)
	assert.equal(parseMessages({ messages: [user(), assistant('б'.repeat(limits.assistantChars + 1)), user()] }), null)

	const turns = Math.ceil(limits.historyChars / (limits.userChars + limits.assistantChars))
	const long = Array.from({ length: turns }, () => [
		user('а'.repeat(limits.userChars)),
		assistant('б'.repeat(limits.assistantChars)),
	])
	assert.equal(parseMessages({ messages: [...long.flat(), user()] }), null)
})

test('выжимка приводится к строкам, urgent -- к булеву', () => {
	const summary = normalizeSummary({ name: 'Анна', contact: 42, request: null, urgent: 'true' })
	assert.equal(summary?.name, 'Анна')
	assert.equal(summary?.contact, '42')
	assert.equal(summary?.request, '')
	assert.equal(summary?.who, '')
	assert.equal(summary?.urgent, true)
	assert.equal(normalizeSummary({ urgent: 1 })?.urgent, false)
	assert.equal(normalizeSummary(null), null)
	assert.equal(normalizeSummary('строка'), null)
})
