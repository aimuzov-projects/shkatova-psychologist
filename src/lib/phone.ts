// Номер телефона не попадает в HTML открытым: сборщики спама ищут его в разметке и в ссылках
// tel:, а JavaScript не выполняют. В разметке лежит закодированная строка, номер из неё
// собирает phone-reveal.ts уже в браузере. Модуль без DOM: его импортируют и при сборке.

/** Как номер выглядит на странице: `79000000000` -> `+7 (900) 000-00-00`, пробелы неразрывные. */
export const formatPhone = (digits: string) => digits.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+$1 ($2) $3-$4-$5')

/** Цифры задом наперёд в base64: в таком виде номер не находят ни шаблоны, ни поиск по цифрам. */
export const encodePhone = (digits: string) => btoa([...digits].reverse().join(''))

export const decodePhone = (encoded: string) => [...atob(encoded)].reverse().join('')

export const phoneHref = {
	tel: (digits: string) => `tel:+${digits}`,
	whatsapp: (digits: string) => `https://wa.me/${digits}`,
}
