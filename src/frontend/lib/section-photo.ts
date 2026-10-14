// Фото секций на телефоне (Hero и SectionPhoto): параллакс и вуаль, которая густеет,
// пока секция уезжает вверх. Модуль подключают оба компонента, выполняется он один раз.
import { everyFrame, reduceMotion, type Write } from '#frontend/lib/frame.ts'

// Сдвиг пропорционален расстоянию обёртки до центра экрана.
const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')]

if (!reduceMotion && parallax.length)
	everyFrame((): Write => {
		const mid = innerHeight / 2
		const offsets = parallax.map((el) => {
			const box = (el.parentElement as HTMLElement).getBoundingClientRect()

			return (box.top + box.height / 2 - mid) * Number(el.dataset.parallax)
		})

		return () => parallax.forEach((el, i) => (el.style.transform = `translate3d(0, ${offsets[i].toFixed(1)}px, 0)`))
	})

const veils = [...document.querySelectorAll<HTMLElement>('[data-veil]:not([data-veil="story"])')]

if (veils.length)
	everyFrame((): Write => {
		const vh = innerHeight
		const opacities = veils.map((veil) => {
			const section = veil.closest('section')

			if (!section) return null

			const box = section.getBoundingClientRect()
			const progress = Math.min(1, Math.max(0, -box.top / (box.height - vh * 0.5)))

			return (0.35 + 0.45 * progress).toFixed(3)
		})

		return () => veils.forEach((veil, i) => opacities[i] && (veil.style.opacity = opacities[i]))
	})
