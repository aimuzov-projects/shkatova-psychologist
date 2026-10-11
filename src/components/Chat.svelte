<script lang="ts">
	import { tick } from 'svelte'

	import Icon from '#/components/Icon.svelte'
	import { greeting, limits } from '#/data/chat.ts'
	import { decodePhone, phoneHref } from '#/lib/phone.ts'
	import { typograph } from '#/lib/typograph.ts'

	type Props = {
		/** Ссылка на Telegram для запасного пути, если разговор не передался. */
		telegram: string
		/** Номер WhatsApp из encodePhone: открытым в разметку он не попадает. */
		whatsapp: string
	}

	type Message = { role: 'user' | 'assistant'; content: string }
	type State = { consent: boolean; messages: Message[]; done: boolean; delivered: boolean }

	const { telegram, whatsapp }: Props = $props()

	const farewell = 'Спасибо, что рассказали. Татьяна прочитает и напишет вам в течение дня.'

	// Переписка живёт только во вкладке: рефреш её не теряет, закрытие стирает.
	const key = 'chat'
	const load = (): State => {
		try {
			const saved = JSON.parse(sessionStorage.getItem(key) ?? 'null')
			if (saved && Array.isArray(saved.messages)) return saved
		} catch {}
		return { consent: false, messages: [], done: false, delivered: false }
	}
	const chat = $state(load())
	const save = () => {
		try {
			sessionStorage.setItem(key, JSON.stringify(chat))
		} catch {}
	}

	let agreed = $state(false)
	let text = $state('')
	let busy = $state(false)
	// Ответ, который ещё приходит по кусочкам; null -- ничего не приходит.
	let reply = $state<string | null>(null)
	let error = $state('')
	let form = $state<HTMLFormElement>()
	let input = $state<HTMLTextAreaElement>()

	// Приветствие не хранится в переписке и не уходит модели, но показывается первым.
	const log = $derived<Message[]>([{ role: 'assistant', content: greeting }, ...chat.messages])

	const scrollDown = () => scrollTo({ top: document.body.scrollHeight })

	// Поле растёт вместе с текстом.
	$effect(() => {
		void text
		if (!input) return
		input.style.height = 'auto'
		input.style.height = `${input.scrollHeight}px`
	})

	async function start() {
		chat.consent = true
		save()
		await tick()
		input?.focus()
	}

	async function ask(message: string) {
		error = ''
		chat.messages.push({ role: 'user', content: message })
		busy = true
		reply = ''
		await tick()
		scrollDown()

		let done: { delivered: boolean } | null = null
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: chat.messages }),
			})
			if (!res.ok || !res.body) {
				const body = await res.json().catch(() => null)
				throw new Error(body?.error ?? 'Не получилось отправить сообщение, попробуйте ещё раз')
			}
			let buffer = ''
			const decoder = new TextDecoder()
			const reader = res.body.getReader()
			for (;;) {
				const { value, done: end } = await reader.read()
				if (end) break
				buffer += decoder.decode(value, { stream: true })
				const events = buffer.split('\n\n')
				buffer = events.pop() ?? ''
				for (const raw of events) {
					const event = raw.match(/^event: (.+)$/m)?.[1]
					const data = JSON.parse(raw.match(/^data: (.+)$/m)?.[1] ?? '{}')
					if (event === 'delta') {
						reply += data.text
						await tick()
						scrollDown()
					} else if (event === 'done') done = data
					else if (event === 'error') throw new Error(data.error)
				}
			}
			if (!reply.trim() && !done) throw new Error('Ассистент не ответил, попробуйте отправить сообщение ещё раз')
		} catch (e) {
			// Неудачное сообщение возвращается в поле ввода, чтобы история не сломалась.
			chat.messages.pop()
			reply = null
			text = message
			error = (e as Error).message
			busy = false
			return
		}

		chat.messages.push({ role: 'assistant', content: reply.trim() || farewell })
		reply = null
		if (done) {
			chat.done = true
			chat.delivered = done.delivered
		}
		save()
		busy = false
		await tick()
		if (!done) input?.focus()
		scrollDown()
	}

	function submit(e: SubmitEvent) {
		e.preventDefault()
		const message = text.trim()
		if (!message || busy) return
		const chars = chat.messages.reduce((sum, m) => sum + m.content.length, message.length)
		if (chat.messages.length + 2 > limits.messages || chars + limits.assistantChars > limits.historyChars) {
			error = 'Разговор получился длинным. Напишите, пожалуйста, Татьяне напрямую — она обязательно ответит.'
			return
		}
		text = ''
		ask(message)
	}

	// На компьютере Enter отправляет, Shift+Enter переносит строку.
	// На телефоне Enter -- перенос.
	const touch = matchMedia('(pointer: coarse)').matches
	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !touch && !e.isComposing) {
			e.preventDefault()
			form?.requestSubmit()
		}
	}

	async function restart() {
		if (chat.messages.length && !chat.done && !confirm('Начать разговор заново? Написанное сотрётся.')) return
		Object.assign(chat, { messages: [], done: false, delivered: false })
		save()
		error = ''
		await tick()
		input?.focus()
	}
</script>

{#if !chat.consent}
	<section class="consent">
		<p class="lead">
			Не всегда легко написать психологу первой. Здесь можно спокойно рассказать, что вас беспокоит, а ассистент
			задаст несколько вопросов и соберёт главное для Татьяны. Она прочитает и сама напишет вам в течение дня.
		</p>
		<ul class="consent__notes muted">
			<li class="consent__note">
				<Icon name="spark" size={20} class="consent__icon" />
				<span>
					Это ИИ-ассистент, а не психолог: он не даёт советов и не ставит диагнозов, а помогает подготовиться
					к встрече.
				</span>
			</li>
			<li class="consent__note">
				<Icon name="lock" size={20} class="consent__icon" />
				<span>
					Разговор обрабатывает ИИ-сервис за пределами России, на сайте переписка не сохраняется. Татьяна
					получит только итоговую выжимку и только после вашего подтверждения.
				</span>
			</li>
			<li class="consent__note">
				<Icon name="heart" size={20} class="consent__icon" />
				<span>
					Если вам сейчас очень плохо или есть мысли навредить себе, звоните
					<a class="icon-link" href="tel:112">
						<Icon name="phone" size={16} class="icon-link__icon" />
						112
					</a>
					или на бесплатный телефон доверия
					<a class="icon-link" href="tel:88002000122">
						<Icon name="phone" size={16} class="icon-link__icon" />
						8-800-2000-122
					</a>.
				</span>
			</li>
		</ul>
		<label class="consent__check">
			<input type="checkbox" class="consent__checkbox" bind:checked={agreed} />
			<span>
				Даю согласие на обработку моих персональных данных, в том числе сведений о здоровье, на условиях
				<a class="icon-link icon-link--after" href="/privacy" target="_blank">
					политики конфиденциальности
					<Icon name="arrow-out" size={16} class="icon-link__icon" />
				</a>
			</span>
		</label>
		<button class="btn" type="button" disabled={!agreed} onclick={start}>
			<Icon name="chat" size={18} />
			Начать разговор
		</button>
	</section>
{:else}
	<section class="dialog">
		<ol class="dialog__log" aria-live="polite">
			{#each log as message}
				<!-- Текст клиентки остаётся как написан. -->
				<li class="msg msg--{message.role}">
					{message.role === 'assistant' ? typograph(message.content) : message.content}
				</li>
			{/each}
			{#if reply !== null}
				<li class="msg msg--assistant" class:msg--typing={!reply.trim()}>
					{typograph(reply.trimStart())}
				</li>
			{/if}
		</ol>

		{#if chat.done}
			<div class="dialog__finish">
				{#if chat.delivered}
					<p>Разговор передан Татьяне. Если захотите что-то добавить, можно написать ей напрямую.</p>
				{:else}
					<p class="muted">
						Не получилось передать разговор автоматически. Пожалуйста, напишите Татьяне напрямую:
						<a class="icon-link" href={telegram} target="_blank" rel="noopener noreferrer">
							<Icon name="plane" size={16} class="icon-link__icon" />
							Telegram
						</a>
						или
						<a
							class="icon-link"
							href={phoneHref.whatsapp(decodePhone(whatsapp))}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="chat" size={16} class="icon-link__icon" />
							WhatsApp
						</a>.
					</p>
				{/if}
			</div>
		{/if}

		{#if error}
			<p class="dialog__error" role="alert">{typograph(error)}</p>
		{/if}

		{#if !chat.done}
			<form class="composer" bind:this={form} onsubmit={submit}>
				<textarea
					class="composer__input"
					rows="1"
					maxlength={limits.userChars}
					placeholder="Напишите, как получится…"
					aria-label="Ваше сообщение"
					disabled={busy}
					bind:this={input}
					bind:value={text}
					onkeydown={keydown}></textarea>
				<button class="composer__send" type="submit" aria-label="Отправить" disabled={busy}>
					<Icon name="arrow-up" size={20} />
				</button>
			</form>
		{/if}
		<!-- Пока приходит ответ, сброс недоступен: ответ дописался бы в пустую переписку. -->
		<button class="dialog__restart muted" type="button" disabled={busy} onclick={restart}>
			<Icon name="restart" size={14} />
			Начать заново
		</button>
	</section>
{/if}

<style>
	.consent {
		&__notes {
			display: grid;
			gap: 16px;
			margin: 32px 0;
			padding: 0;
			font-size: 0.95rem;
			list-style: none;
		}

		&__note {
			display: grid;
			grid-template-columns: 20px 1fr;
			gap: 14px;
			align-items: start;
		}

		& :global(.consent__icon) {
			margin-top: 3px;
			color: var(--accent);
		}

		&__check {
			cursor: pointer;
			display: grid;
			grid-template-columns: 20px 1fr;
			gap: 14px;
			margin-bottom: 28px;
			font-size: 0.95rem;
		}

		&__checkbox {
			width: 20px;
			height: 20px;
			margin: 3px 0 0;
			accent-color: var(--accent);
		}
	}

	/* Иконка у ссылки не отрывается от текста при переносе строки. */
	.icon-link {
		white-space: nowrap;

		& :global(.icon-link__icon) {
			display: inline-block;
			margin-inline-end: 0.25em;
			vertical-align: -0.15em;
		}

		&--after :global(.icon-link__icon) {
			margin-inline: 0.25em 0;
		}
	}

	.btn {
		cursor: pointer;
		border: 0;
		font-family: inherit;

		&:disabled {
			cursor: not-allowed;
			transform: none;
			opacity: 0.45;
		}
	}

	.dialog {
		&__log {
			display: flex;
			flex-direction: column;
			gap: 14px;
			margin: 24px 0 0;
			padding: 0;
			list-style: none;
		}

		&__error {
			margin: 20px 0 0;
			color: var(--accent);
		}

		&__finish {
			margin-top: 28px;
			padding-top: 20px;
			border-top: 1px solid var(--line);
		}

		&__restart {
			cursor: pointer;
			display: flex;
			gap: 6px;
			align-items: center;
			width: fit-content;
			margin: 16px auto 0;
			padding: 6px 10px;
			border: 0;
			font: inherit;
			font-size: 0.85rem;
			text-decoration: underline;
			text-underline-offset: 3px;
			background: none;
		}

		&__restart:disabled {
			cursor: default;
			opacity: 0.45;
		}
	}

	.msg {
		-webkit-user-select: text;
		user-select: text;
		max-width: 88%;
		overflow-wrap: anywhere;
		white-space: pre-wrap;

		&--assistant {
			align-self: flex-start;
		}

		&--user {
			align-self: flex-end;
			padding: 12px 18px;
			border-radius: 20px 20px 6px 20px;
			background: color-mix(in srgb, var(--fg) 10%, transparent);
			box-shadow: inset 0 0 0 1px var(--line);
		}

		/* Три мерцающие точки, пока ассистент думает. */
		&--typing::after {
			content: '• • •';
			color: var(--muted);
			letter-spacing: 0.1em;
			animation: typing 1.4s ease-in-out infinite;
		}
	}

	.composer {
		position: sticky;
		bottom: 16px;
		display: flex;
		gap: 10px;
		align-items: flex-end;
		margin-top: 28px;
		padding: 8px 8px 8px 20px;
		border-radius: 28px;
		background: color-mix(in srgb, var(--bg) 82%, var(--fg));
		box-shadow:
			inset 0 0 0 1px var(--line),
			0 12px 40px rgb(0 0 0 / 0.25);

		&__input {
			resize: none;
			flex: 1;
			min-height: 40px;
			max-height: 40vh;
			padding: 8px 0;
			border: 0;
			font: inherit;
			line-height: 1.5;
			color: var(--fg);
			background: none;
			outline: none;
		}

		&__input::placeholder {
			color: var(--muted);
		}

		&__send {
			cursor: pointer;
			display: grid;
			flex: none;
			place-items: center;
			width: 44px;
			height: 44px;
			border: 0;
			border-radius: 50%;
			color: var(--btn-fg);
			background: var(--btn-bg);
			transition: background-color 0.4s var(--ease);
		}

		&__send:hover {
			background: var(--btn-hover);
		}

		&__send:disabled {
			cursor: default;
			opacity: 0.45;
		}
	}

	@keyframes typing {
		50% {
			opacity: 0.3;
		}
	}
</style>
