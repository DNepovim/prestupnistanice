<script lang="ts">
  import 'iconify-icon'

  import { onMount } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'
  import { fly } from 'svelte/transition'

  import { addToCart, cart } from '@/stores/cart'
  import { pluralize } from '@/utils/pluralize'

  type Props = {
    slug: string
    title: string
    class?: string
  }

  const { slug, title, class: className }: Props = $props()

  const UNITS = ['kniha', 'knihy', 'knih'] as const
  const MAX_BOOKS = 3

  let isMounted = $state(false)
  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce')

  const count = $derived(
    isMounted ? ($cart.find((item) => item.slug === slug)?.count ?? 0) : 0,
  )
  const amount = $derived(String(count))
  const unit = $derived(pluralize(count, UNITS).slice(`${amount} `.length))
  const countLabel = $derived(pluralize(count, UNITS))
  const books = $derived(
    Array.from({ length: Math.min(count, MAX_BOOKS) }, (_, index) => index),
  )
  const duration = (value: number) => (reducedMotion.current ? 0 : value)

  onMount(() => {
    isMounted = true
  })
</script>

<button
  type="button"
  class={[
    'font-alt bg-brand-first-700 hover:bg-brand-first-800 focus-visible:outline-brand-first-500 relative z-10 inline-flex min-h-10 cursor-pointer items-center justify-center gap-[0.3em] px-5 py-3 text-sm leading-none font-semibold tracking-[0.03em] whitespace-nowrap text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-3',
    className,
  ]}
  aria-label={count > 0
    ? `${countLabel} v košíku, přidat další: ${title}`
    : `Přidat do košíku: ${title}`}
  onclick={() => {
    addToCart(slug)
  }}
>
  <span class="relative inline-flex size-4 shrink-0" aria-hidden="true">
    <iconify-icon icon="ph:shopping-cart" class="text-base" noobserver></iconify-icon>
    <span class="absolute top-[6px] left-[4px] flex h-[4px] w-[8px] items-end gap-px">
      {#each books as book (book)}
        <span
          class="bg-brand-first-200 block h-full w-[2px]"
          in:fly={{ y: -6, duration: duration(150) }}
        ></span>
      {/each}
    </span>
  </span>
  {#if count > 0}
    <span class="relative inline-grid overflow-hidden align-bottom">
      {#key amount}
        <span
          class="col-start-1 row-start-1"
          in:fly={{ y: 8, duration: duration(160) }}
          out:fly={{ y: -8, duration: duration(160) }}>{amount}</span
        >
      {/key}
    </span>
    <span class="relative inline-grid overflow-hidden align-bottom">
      {#key unit}
        <span
          class="col-start-1 row-start-1"
          in:fly={{ y: 8, duration: duration(180) }}
          out:fly={{ y: -8, duration: duration(180) }}>{unit}</span
        >
      {/key}
    </span>
    v košíku
  {:else}
    Přidat do košíku
  {/if}
</button>
<span role="status" aria-live="polite" class="sr-only">
  {count > 0 ? `${countLabel} v košíku` : ''}
</span>
