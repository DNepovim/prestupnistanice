<script lang="ts">
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

  const UNITS = ['kus', 'kusy', 'kusů'] as const

  let isMounted = $state(false)
  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce')

  const count = $derived(
    isMounted ? ($cart.find((item) => item.slug === slug)?.count ?? 0) : 0,
  )
  const amount = $derived(String(count))
  const unit = $derived(pluralize(count, UNITS).slice(`${amount} `.length))
  const countLabel = $derived(pluralize(count, UNITS))
  const duration = (value: number) => (reducedMotion.current ? 0 : value)

  onMount(() => {
    isMounted = true
  })
</script>

<button
  type="button"
  data-arrow-link
  class={[
    'group font-head text-brand-first-700 relative z-10 inline-block cursor-pointer pr-9 text-[1.2rem] leading-none font-extrabold whitespace-nowrap',
    className,
  ]}
  aria-label={count > 0
    ? `${countLabel} v košíku, přidat další: ${title}`
    : `Přidat do košíku: ${title}`}
  onclick={() => {
    addToCart(slug)
  }}
>
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
  <span
    aria-hidden="true"
    data-arrow="right"
    class="absolute top-1/2 right-[2px] block size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-current"
  ></span>
  <span
    aria-hidden="true"
    data-arrow="right"
    class="absolute top-1/2 right-0 block h-[2px] w-5 -translate-y-1/2 bg-current transition-all duration-500 group-hover:w-full group-focus-visible:w-full"
  ></span>
</button>
<span role="status" aria-live="polite" class="sr-only">
  {count > 0 ? `${countLabel} v košíku` : ''}
</span>
