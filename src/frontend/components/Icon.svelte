<script lang="ts">
	import { icons, type IconName } from '#shared/icons.ts'

	// Двойник Icon.astro для Svelte-компонентов, с той же разметкой.
	type Props = {
		name: IconName
		/** Сторона в пикселях, по умолчанию 28. Больше 64 -- линия тоньше. */
		size?: number
		class?: string
	}

	const { name, size = 28, class: className }: Props = $props()
</script>

<svg
	class={className}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={size > 64 ? 1 : 1.4}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{@html icons[name]}
</svg>
