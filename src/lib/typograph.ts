// Типограф по готовому HTML: неразрывные пробелы там, где перенос строки рвёт смысл.
// Правит только текст между тегами, содержимое script, style, pre и code не трогает.

const NBSP = '\u00a0'
const NNBSP = '\u202f'

const PARTICLE = String.raw`(?:ли|же|бы)(?![\p{L}\d])`

// Короткие слова (предлоги, союзы, "Я") цепляются к следующему слову, плюс трёхбуквенные
// предлоги, которые в конце строки висят так же заметно. Частицы держатся только
// за предыдущее слово, поэтому вперёд не клеятся.
const SHORT = String.raw`(?<![\p{L}\d])(?!${PARTICLE})(?:\p{L}{1,2}|без|для|вне|изо|меж|над|обо|ото|под|при|про)`
const shortInside = new RegExp(`(${SHORT})\\s+(?=\\S)`, 'giu')
const shortAtEnd = new RegExp(`(${SHORT})\\s+$`, 'iu')
const particle = new RegExp(String.raw`(?<=[\p{L}\d])\s+(?=${PARTICLE})`, 'giu')
// Сокращение не отрывается от того, что сокращает: "т. е.", "г. Тольятти".
const abbr = /(?<![\p{L}\d])(т|г|гг|ул|пр|д|кв|см|стр|им|св|тел)\.\s+(?=\S)/giu
// Инициалы держатся друг за друга и за фамилию: "А. С. Пушкин".
const initial = /(?<!\p{L})(\p{Lu}\.)\s+(?=\p{Lu})/gu
const numero = /([№§])\s*(?=\d)/g
// Тире не начинает строку, если перед ним слово в том же текстовом узле.
const dash = /(?<=[^\s<>])\s+(?=—)/g
// Число не отрывается от единицы: "20 минут", "2 499 ₽", "5 °C".
const unit = /(?<=\d)\s+(?=[\p{L}₽%°$€])/gu
// Разряды тысяч -- узким неразрывным: "1 920", "2 499". Слитные числа от пяти знаков
// разбиваются: "12000" -> "12 000". Четырёхзначные остаются слитно: это чаще год.
const thousands = /(?<=\d) (?=\d{3}(?!\d))/g
const long = /(?<![\d+.,])\d{5,}(?![\d.,])/g
const minus = /(?<=^|[\s(])-(?=\d)/g
// Телефон -- одно целое: разряды в нём не трогаем, а пробелы делаем неразрывными.
const phone = /(?:\+7|(?<!\d)8)(?:[\s()-]*\d){10}(?!\d)/g

// Если текстовый узел кончается коротким словом, а дальше строчный тег (ссылка,
// выделение), пробел перед тегом тоже должен держать. Так же с тире после такого тега.
const INLINE = 'a|abbr|b|del|em|i|mark|q|s|small|span|strong|sub|sup|time|u'
const inlineOpen = new RegExp(`^<(?:${INLINE})\\b`, 'i')
const inlineClose = new RegExp(`^</(?:${INLINE})>`, 'i')

// Атрибут с ">" внутри порвёт разбор: в разметке сайта таких нет.
const raw = /(<!--[\s\S]*?-->|<(script|style|pre|code|textarea)\b[\s\S]*?<\/\2>|<[^>]*>)/i

export function typograph(html: string): string {
	const parts = html.split(new RegExp(raw.source, 'gi'))
	const out: string[] = []
	let prev: string | undefined

	// split с группами кладёт в массив и имя тега из второй группы: его пропускаем.
	for (let i = 0; i < parts.length; i += 3) {
		const text = parts[i] ?? ''
		const tag = parts[i + 1]
		const before = tag !== undefined && inlineOpen.test(tag)
		const after = prev !== undefined && inlineClose.test(prev)
		out.push(fix(text, before, after))
		if (tag !== undefined) out.push(tag)
		prev = tag
	}

	return out.join('')
}

// Для текста без разметки, который страница выводит сама через textContent.
export function typographText(text: string): string {
	return fix(text, false, false)
}

function fix(text: string, beforeInline: boolean, afterInline: boolean): string {
	if (!/\p{L}/u.test(text)) return text

	const parts = split(text.replace(/\.{3}/g, '…'), phone)
	let s = parts
		.map((part, i) => {
			if (i % 2) return part.replace(/\s+/g, NBSP)
			const fixed = words(part)
			// Перед телефоном короткое слово висит так же, как перед ссылкой.
			return i < parts.length - 1 ? fixed.replace(shortAtEnd, `$1${NBSP}`) : fixed
		})
		.join('')

	if (beforeInline) s = s.replace(shortAtEnd, `$1${NBSP}`)
	if (afterInline) s = s.replace(/^\s+(?=—)/, NBSP)
	return s
}

function words(s: string): string {
	return s
		.replace(long, (n) => n.replace(/\B(?=(\d{3})+$)/g, NNBSP))
		.replace(thousands, NNBSP)
		.replace(minus, '−')
		.replace(numero, `$1${NBSP}`)
		.replace(unit, NBSP)
		.replace(dash, NBSP)
		.replace(particle, NBSP)
		.replace(abbr, `$1.${NBSP}`)
		.replace(initial, `$1${NBSP}`)
		.replace(shortInside, `$1${NBSP}`)
}

// Как split с группой: чётные куски -- текст между совпадениями, нечётные -- сами совпадения.
function split(s: string, re: RegExp): string[] {
	const out: string[] = []
	let last = 0
	for (const m of s.matchAll(re)) {
		out.push(s.slice(last, m.index), m[0])
		last = m.index + m[0].length
	}
	out.push(s.slice(last))
	return out
}
