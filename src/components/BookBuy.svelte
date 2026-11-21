<script lang="ts">
  import { onMount } from 'svelte'

  import AddToCart from '@/components/AddToCart.svelte'
  import { routes } from '@/routes'
  import { formatPrice } from '@/utils/formatPrice'
  import type { KosmasStatus } from '@/utils/kosmas'

  type Props = {
    slug: string
    title: string
    kosmasUrl?: string
    price?: number
    isUpcoming?: boolean
    releaseNote?: string
  }

  const { slug, title, kosmasUrl, price, isUpcoming = false, releaseNote }: Props = $props()

  const KOSMAS_STATUSES = ['available', 'outOfStock', 'soldOut'] as const

  const isKosmasStatus = (value: unknown): value is KosmasStatus =>
    KOSMAS_STATUSES.some((status) => status === value)

  let kosmasStatus = $state<KosmasStatus | undefined>()
  let kosmasPrice = $state<number | undefined>()

  const isOurs = $derived(!isUpcoming && price !== undefined)
  const kosmasHasIt = $derived(kosmasStatus === undefined || kosmasStatus === 'available')
  const saving = $derived(
    isOurs && price !== undefined && kosmasPrice !== undefined ? kosmasPrice - price : 0,
  )

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
      {formatPrice(price)}
    </p>
    {#if saving > 0 && kosmasPrice !== undefined}
      <p class="text-brand-first-700 text-[0.75rem] leading-snug">
        Od {formatPrice(saving)} levněji než v distribuci
      </p>
    {/if}
    <AddToCart {slug} {title} />
  {:else if kosmasUrl && kosmasHasIt}
    <p class="text-[0.75rem] leading-snug text-gray-700">U nás není v prodeji.</p>
    {#if kosmasPrice !== undefined}
      <p class="font-head text-[2.1rem] leading-none font-extrabold text-black">
        {formatPrice(kosmasPrice)}
        <span class="font-alt text-[0.7rem] font-normal text-gray-500">na Kosmasu</span>
      </p>
    {/if}
    <a
      href={kosmasUrl}
      target="_blank"
      rel="noopener"
      data-arrow-link
      class="group font-head text-brand-first-700 relative inline-block pr-9 text-[1.2rem] leading-none font-extrabold whitespace-nowrap"
    >
      Kup na Kosmasu
      <span
        aria-hidden="true"
        data-arrow="right"
        class="border-current absolute top-1/2 right-[2px] block size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2"
      ></span>
      <span
        aria-hidden="true"
        data-arrow="right"
        class="bg-current absolute top-1/2 right-0 block h-[2px] w-5 -translate-y-1/2 transition-all duration-500 group-hover:w-full group-focus-visible:w-full"
      ></span>
      <span class="sr-only">(otevře se v novém okně)</span>
    </a>
  {:else}
    <p class="text-[0.75rem] leading-snug text-gray-700">
      {kosmasUrl ? 'Kniha není v prodeji u nás ani na Kosmasu.' : 'Kniha není v prodeji.'}
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
