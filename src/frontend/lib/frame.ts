// Общий кадр для всего, что следит за прокруткой. Каждый measure только читает геометрию
// и возвращает запись в DOM: кадр сначала меряет всё, потом всё пишет. Чтение после
// записи заставляло бы браузер раскладывать страницу заново на каждый замер, поэтому
// компоненты не слушают scroll сами, а регистрируются здесь.

export type Write = () => void
export type Measure = () => Write | null

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const onScroll: Measure[] = []
const onLayout: Measure[] = []

/** Замер на каждом кадре прокрутки, а также после раскладки и ресайза. */
export const everyFrame = (measure: Measure) => onScroll.push(measure)

/** Замер только после раскладки и ресайза: для того, что от прокрутки не зависит. */
export const onResize = (measure: Measure) => onLayout.push(measure)

const run = (measures: Measure[]) => measures.map((measure) => measure()).forEach((write) => write?.())

let ticking = false

addEventListener(
	'scroll',
	() => {
		if (ticking) return

		ticking = true

		requestAnimationFrame(() => {
			run(onScroll)
			ticking = false
		})
	},
	{ passive: true },
)

// Первый кадр и пересчёт после ресайза делает ResizeObserver: он срабатывает уже после
// раскладки, так что замеры не заставляют браузер раскладывать страницу заранее. К этому
// моменту скрипты всех компонентов уже выполнились и зарегистрировали свои замеры.
new ResizeObserver(() => run([...onLayout, ...onScroll])).observe(document.body)
