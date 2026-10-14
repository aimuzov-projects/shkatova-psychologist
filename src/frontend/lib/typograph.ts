// Типограф для текста, который приходит в чат на лету: ответы ассистента и ошибки сервера.
// Остальной текст сайта набран в исходниках, сюда он не попадает.

const NBSP = ' '

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
// Тире не начинает строку.
const dash = /(?<=\S)[ \t]+(?=—)/g
// Число не отрывается от единицы: "20 минут", "2 499 ₽", "5 °C".
const unit = /(?<=\d)[ \t]+(?=[\p{L}₽%°$€])/gu
// Разряды тысяч: "1 920", "2 499". Слитные числа от пяти знаков разбиваются:
// "12000" -> "12 000". Четырёхзначные остаются слитно: это чаще год.
const thousands = /(?<=\d) (?=\d{3}(?!\d))/g
const long = /(?<![\d+.,])\d{5,}(?![\d.,])/g
// Телефон -- одно целое: разряды в нём не трогаем, а пробелы делаем неразрывными.
const phone = /(?:\+7|(?<!\d)8)(?:[\s()-]*\d){10}(?!\d)/g

export function typograph(text: string): string {
	const parts = split(text.replace(/\.{3}/g, '…'), phone)

	return parts
		.map((part, i) => {
			if (i % 2) return part.replace(/\s+/g, NBSP)

			const fixed = words(part)

			// Перед телефоном короткое слово висит так же, как в конце строки.
			return i < parts.length - 1 ? fixed.replace(shortAtEnd, `$1${NBSP}`) : fixed
		})
		.join('')
}

function words(s: string): string {
	return s
		.replace(long, (n) => n.replace(/\B(?=(\d{3})+$)/g, NBSP))
		.replace(thousands, NBSP)
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
