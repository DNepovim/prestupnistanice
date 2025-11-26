<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onDestroy } from 'svelte'
  import { fly } from 'svelte/transition'

  import { addToCart, orderStore } from '@/stores/order'

  export let slug: string
  export let count = 1

  function onClick() {
    addToCart(slug, count)
  }

  $: inCartCount = $orderStore.cart.find((i) => i.slug === slug)?.count ?? 0
  $: isInCart = inCartCount > 0
  $: label = inCartCount === 1 ? 'kus' : inCartCount < 5 ? 'kusy' : 'kusů'

  let _chipVisible = isInCart
  let chipTimer: ReturnType<typeof setTimeout> | null = null
  let prevInCart = isInCart
  $: if (isInCart !== prevInCart) {
    if (chipTimer) clearTimeout(chipTimer)
    if (isInCart) {
      chipTimer = setTimeout(() => {
        _chipVisible = true
        chipTimer = null
      }, 180)
    } else {
      _chipVisible = false
    }
    prevInCart = isInCart
  }
  onDestroy(() => {
    if (chipTimer) clearTimeout(chipTimer)
  })
</script>

<button
  type="button"
  class="font-alt items-center justify-center gap-2 transition-colors text-xl text-brand-first-500 relative flex overflow-hidden whitespace-nowrap cursor-pointer"
  on:click={onClick}
>
  <span class="relative inline-grid overflow-hidden w-[2em]">
    {#key inCartCount}
      <span
        class="col-start-1 row-start-1"
        out:fly={{ y: -8, duration: 160 }}
        in:fly={{ y: 8, duration: 160 }}
        >{#if inCartCount > 0}{inCartCount}{:else}
          <Icon icon="ph:shopping-cart" class="size-5" />
        {/if}</span
      >
    {/key}
  </span>
  <span class="relative inline-block overflow-hidden align-middle">
    <span class="invisible">Koupit v košíku</span>
    {#key isInCart ? `in-${label}` : 'buy'}
      <span
        class="absolute inset-0"
        out:fly={{ y: -8, duration: 180 }}
        in:fly={{ y: 8, duration: 180 }}
      >
        {#if isInCart}
          {label}&ThinSpace;v košíku
        {:else}
          Koupit
        {/if}
      </span>
    {/key}
  </span>
</button>
