// Собирает номер в ссылках с data-phone и показывает их. Разметка ссылки:
// <a data-phone="..." data-phone-href="tel|whatsapp" hidden>, подпись -- в [data-phone-label] внутри.
// Без JavaScript ссылки так и остаются скрытыми. Модуль подключают несколько страниц, выполняется он один раз.
import { decodePhone, formatPhone, phoneHref } from '#shared/phone.ts'

for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-phone]')) {
	const digits = decodePhone(link.dataset.phone!)

	link.href = phoneHref[link.dataset.phoneHref as keyof typeof phoneHref](digits)
	const label = link.querySelector('[data-phone-label]')

	if (label) label.textContent = formatPhone(digits)

	// Показываем пункт списка целиком, если ссылка в нём, иначе саму ссылку.
	;(link.closest<HTMLElement>('[data-phone-item]') ?? link).hidden = false
}
