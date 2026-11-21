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

  const UNITS = ['kus', 'kusy', 'kusů'] as const

  const MARKS = [
    '-top-(--mk-s) -left-(--mk-s) border-r border-b',
    '-top-(--mk-s) -right-(--mk-s) border-b border-l',
    '-bottom-(--mk-s) -left-(--mk-s) border-t border-r',
    '-right-(--mk-s) -bottom-(--mk-s) border-t border-l',
  ] as const

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
  class={[
    'group font-alt bg-brand-first-700 hover:bg-brand-first-800 focus-visible:outline-brand-first-500 relative z-10 inline-flex cursor-pointer items-center justify-center gap-[0.3em] px-5 py-3 text-sm leading-none font-semibold tracking-[0.03em] whitespace-nowrap text-white transition-colors duration-200 [--mk-g:0.35rem] [--mk-l:0.7rem] [--mk-s:calc(var(--mk-g)+var(--mk-l))] focus-visible:outline-2 focus-visible:outline-offset-3',
    className,
  ]}
  aria-label={count > 0
    ? `${countLabel} v košíku, přidat další: ${title}`
    : `Přidat do košíku: ${title}`}
  onclick={() => {
    addToCart(slug)
  }}
>
  {#each MARKS as mark (mark)}
    <span
      aria-hidden="true"
      class={[
        'border-brand-first-300/60 pointer-events-none absolute size-(--mk-l) transition-opacity duration-300 motion-reduce:transition-none',
        count > 0
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-50 group-focus-visible:opacity-50',
        mark,
      ]}
    ></span>
  {/each}
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
    <iconify-icon icon="ph:shopping-cart" class="text-base" noobserver aria-hidden="true"
    ></iconify-icon>
    Přidat do košíku
  {/if}
</button>
<span role="status" aria-live="polite" class="sr-only">
  {count > 0 ? `${countLabel} v košíku` : ''}
</span>
