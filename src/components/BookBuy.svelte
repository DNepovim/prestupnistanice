<script lang="ts">
  import { onMount } from 'svelte'

  import { routes } from '@/routes'
  import type { KosmasStatus } from '@/utils/kosmas'

  export let slug: string
  export let kosmasUrl: string | undefined = undefined
  export let price: number | undefined = undefined
  export let stock: number | undefined = undefined
  export let isUpcoming = false
  export let releaseNote: string | undefined = undefined

  const KOSMAS_STATUSES = ['available', 'outOfStock', 'soldOut'] as const

  const priceFormat = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  })

  const isKosmasStatus = (value: unknown): value is KosmasStatus =>
    KOSMAS_STATUSES.some((status) => status === value)

  let kosmasStatus: KosmasStatus | undefined
  let kosmasPrice: number | undefined

  $: isOurs = stock !== undefined && stock > 0 && price !== undefined
  $: kosmasHasIt = kosmasStatus === undefined || kosmasStatus === 'available'
  $: saving =
    isOurs && price !== undefined && kosmasPrice !== undefined ? kosmasPrice - price : 0

  const addToCart = () => {
    window.dispatchEvent(new CustomEvent('cart:add', { detail: { slug } }))
  }

  onMount(async () => {
    if (!kosmasUrl) {
      return
    }
    const response = await fetch(routes.api.kosmasStatus(slug)).catch(() => undefined)
    const body: { status?: unknown; price?: unknown } | undefined = response?.ok
      ? await response.json().catch(() => undefined)
      : undefined
    kosmasStatus = isKosmasStatus(body?.status) ? body.status : undefined
    kosmasPrice = typeof body?.price === 'number' ? body.price : undefined
  })
</script>

<div class="font-alt flex flex-col items-start gap-3">
  {#if isUpcoming}
    <p class="font-head text-[1.4rem] leading-none font-extrabold text-black">
      Připravujeme
    </p>
    {#if releaseNote}
      <p class="text-brand-first-700 text-[0.75rem] leading-snug">{releaseNote}</p>
    {/if}
  {:else if isOurs && price !== undefined}
    <p class="font-head text-[2.1rem] leading-none font-extrabold text-black">
      {priceFormat.format(price)}
    </p>
    {#if saving > 0 && kosmasPrice !== undefined}
      <p class="text-brand-first-700 text-[0.75rem] leading-snug">
        O {priceFormat.format(saving)} levněji než na Kosmasu
        <span class="text-gray-500">({priceFormat.format(kosmasPrice)})</span>
      </p>
    {/if}
    <button
      type="button"
      class="group font-head text-brand-first-700 relative inline-block cursor-pointer pr-9 text-[1.2rem] leading-none font-extrabold whitespace-nowrap"
      on:click={addToCart}
    >
      Přidat do košíku
      <span
        aria-hidden="true"
        class="absolute top-1/2 right-[2px] block size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-current"
      ></span>
      <span
        aria-hidden="true"
        class="absolute top-1/2 right-0 block h-[2px] w-5 -translate-y-1/2 bg-current transition-all duration-500 group-hover:w-full group-focus-visible:w-full"
      ></span>
    </button>
    <p class="text-brand-first-700 text-[0.7rem] leading-none tracking-[0.04em]">
      Skladem {stock} ks
    </p>
    {#if kosmasUrl && kosmasHasIt}
      <a
        href={kosmasUrl}
        target="_blank"
        rel="noopener"
        class="text-[0.7rem] leading-none text-gray-600 hover:text-black"
      >
        Koupit na Kosmasu
        <span class="sr-only">(otevře se v novém okně)</span>
      </a>
    {/if}
  {:else if kosmasUrl && kosmasHasIt}
    <p class="text-[0.75rem] leading-snug text-gray-700">
      U nás momentálně skladem nemáme.
    </p>
    {#if kosmasPrice !== undefined}
      <p class="font-head text-[2.1rem] leading-none font-extrabold text-black">
        {priceFormat.format(kosmasPrice)}
        <span class="font-alt text-[0.7rem] font-normal text-gray-500">na Kosmasu</span>
      </p>
    {/if}
    <a
      href={kosmasUrl}
      target="_blank"
      rel="noopener"
      class="group font-head text-brand-first-700 relative inline-block pr-9 text-[1.2rem] leading-none font-extrabold whitespace-nowrap"
    >
      Kup na Kosmasu
      <span
        aria-hidden="true"
        class="border-current absolute top-1/2 right-[2px] block size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2"
      ></span>
      <span
        aria-hidden="true"
        class="bg-current absolute top-1/2 right-0 block h-[2px] w-5 -translate-y-1/2 transition-all duration-500 group-hover:w-full group-focus-visible:w-full"
      ></span>
      <span class="sr-only">(otevře se v novém okně)</span>
    </a>
  {:else}
    <p class="text-[0.75rem] leading-snug text-gray-700">
      {kosmasUrl ? 'Kniha není skladem u nás ani na Kosmasu.' : 'Kniha není skladem.'}
    </p>
    {#if kosmasUrl}
      <a
        href={kosmasUrl}
        target="_blank"
        rel="noopener"
        class="text-brand-first-700 text-[0.7rem] leading-none underline underline-offset-2"
      >
        Zobrazit na Kosmasu
        <span class="sr-only">(otevře se v novém okně)</span>
      </a>
    {/if}
  {/if}
</div>
