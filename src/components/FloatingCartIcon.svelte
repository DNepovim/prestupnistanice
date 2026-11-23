<script lang="ts">
  import 'iconify-icon'

  import { onMount, untrack } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'
  import { fly } from 'svelte/transition'

  import { routes } from '@/routes'
  import { cart, cartCount, emptyCart, removeFromCart, updateQuantity } from '@/stores/cart'
  import type { CartIndex } from '@/utils/cart/types'
  import { formatPrice } from '@/utils/formatPrice'
  import { pluralize } from '@/utils/pluralize'
  import { tp } from '@/utils/tp'

  type Props = {
    books: CartIndex
    pathname: string
  }

  type Sprite = { id: number; cover: string }

  const { books, pathname }: Props = $props()

  const PIECE_UNITS = ['kus', 'kusy', 'kusů'] as const
  const MAX_BADGE = 99
  const FOOTER_REVEAL_THRESHOLD = 0.05

  let isMounted = $state(false)
  let contentHeight = $state(0)
  let isFooterRevealed = $state(false)
  let sprites = $state<Sprite[]>([])
  let knownSlugs: string[] | undefined
  let lastSpriteId = 0
  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce')

  const items = $derived(isMounted ? $cart : [])
  const totalCount = $derived(isMounted ? $cartCount : 0)
  const totalPrice = $derived(
    items.reduce((total, { slug, count }) => total + (books[slug]?.price ?? 0) * count, 0),
  )
  const badge = $derived(totalCount > MAX_BADGE ? `${String(MAX_BADGE)}+` : String(totalCount))
  const isCartPage = $derived(pathname.replace(/\/$/, '') === routes.cart())
  const isHidden = $derived(totalCount === 0 || isCartPage)
  const duration = (value: number) => (reducedMotion.current ? 0 : value)

  let footerFrame = 0
  const readFooterProgress = () => {
    const progress = Number.parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue('--footer-progress'),
    )
    isFooterRevealed = progress > FOOTER_REVEAL_THRESHOLD
  }

  const scheduleFooterRead = () => {
    window.cancelAnimationFrame(footerFrame)
    footerFrame = window.requestAnimationFrame(readFooterProgress)
  }

  const removeSprite = (id: number) => {
    sprites = sprites.filter((sprite) => sprite.id !== id)
  }

  onMount(() => {
    isMounted = true
    readFooterProgress()
    window.addEventListener('scroll', scheduleFooterRead, { passive: true })
    window.addEventListener('resize', scheduleFooterRead)
    return () => {
      window.removeEventListener('scroll', scheduleFooterRead)
      window.removeEventListener('resize', scheduleFooterRead)
      window.cancelAnimationFrame(footerFrame)
    }
  })

  $effect(() => {
    if (!isMounted) {
      return
    }
    const current = items.map(({ slug }) => slug)
    const previous = knownSlugs
    knownSlugs = current
    if (previous === undefined || reducedMotion.current || isCartPage) {
      return
    }
    const fresh = current
      .filter((slug) => !previous.includes(slug))
      .map((slug) => books[slug]?.cover)
      .filter((cover) => cover !== undefined)
      .map((cover) => ({ id: ++lastSpriteId, cover }))
    untrack(() => {
      sprites = [...sprites, ...fresh]
    })
  })
</script>

{#if !isHidden}
  <div
    class={[
      'fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 transition-opacity duration-200 motion-reduce:transition-none',
      isFooterRevealed && 'pointer-events-none opacity-0',
    ]}
    inert={isFooterRevealed}
  >
    {#if sprites.length > 0}
      <div
        class="pointer-events-none absolute bottom-full left-1/2 z-10 h-24 w-14 -translate-x-1/2"
        aria-hidden="true"
      >
        {#each sprites as sprite (sprite.id)}
          <img
            src={sprite.cover}
            alt=""
            class="animate-cart-fall absolute top-0 left-1/2 h-10 w-8 object-cover shadow-[0_0.2rem_0.5rem_rgba(0,0,0,0.18)]"
            onanimationend={() => {
              removeSprite(sprite.id)
            }}
          />
        {/each}
      </div>
    {/if}
    <div
      style:--panel-h="{contentHeight}px"
      class="bg-brand-first-700 group relative h-14 w-14 overflow-hidden shadow-[0_0.3rem_1rem_rgba(0,0,0,0.35)] transition-[width,height,box-shadow] duration-300 ease-out [--w:min(22rem,calc(100vw-2rem))] hover:h-[min(calc(var(--panel-h)+3.5rem+2px),26rem,calc(100svh-6rem))] hover:w-(--w) hover:shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)] hover:delay-150 hover:duration-[600ms] focus-within:h-[min(calc(var(--panel-h)+3.5rem+2px),26rem,calc(100svh-6rem))] focus-within:w-(--w) focus-within:shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)] focus-within:delay-0 focus-within:duration-[600ms] motion-reduce:transition-none"
    >
      <div
        class="bg-paper border-brand-first-300/60 invisible absolute inset-x-0 top-0 bottom-14 border transition-[visibility] duration-300 group-hover:visible group-hover:delay-150 group-hover:duration-[600ms] group-focus-within:visible group-focus-within:delay-0 group-focus-within:duration-[600ms] motion-reduce:transition-none"
      >
        <div
          class="absolute inset-0 overflow-y-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
        >
        <div class="w-(--w) px-4 pt-6 pb-3" bind:clientHeight={contentHeight}>
          <p
            class="font-alt text-brand-first-700 mb-1 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
          >
            {tp('Košík')}
          </p>
          <ul class="flex flex-col">
            {#each items as { slug, count } (slug)}
              {@const book = books[slug]}
              <li
                class="group/row border-brand-first-300/60 relative grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-t border-dashed px-1 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--color-brand-first-500)_9%,transparent)] motion-reduce:transition-none"
              >
                {#if book}
                  <img
                    src={book.cover}
                    alt=""
                    class="row-span-2 h-14 w-10 object-cover shadow-[0_0.2rem_0.5rem_rgba(0,0,0,0.18)]"
                  />
                {:else}
                  <div
                    class="bg-brand-first-100 row-span-2 h-14 w-10"
                    aria-hidden="true"
                  ></div>
                {/if}

                <div class="min-w-0">
                  {#if book}
                    <a
                      href={routes.books.detail(slug)}
                      class="font-head group-hover/row:text-brand-first-700 line-clamp-2 text-[1.05rem] leading-[1.1] font-extrabold text-gray-900 transition-colors after:absolute after:inset-0 focus-visible:after:-outline-offset-2 focus-visible:after:outline-2 focus-visible:after:outline-brand-first-500 motion-reduce:transition-none"
                    >
                      {tp(book.title)}
                    </a>
                  {:else}
                    <p
                      class="font-head line-clamp-2 text-[1.05rem] leading-[1.1] font-extrabold text-gray-900"
                    >
                      {tp('Kniha není v nabídce')}
                    </p>
                  {/if}
                  {#if book}
                    <p class="font-alt mt-1 truncate text-[0.7rem] text-gray-800 italic">
                      {tp(book.author)}
                    </p>
                  {/if}
                </div>

                <button
                  type="button"
                  onclick={() => {
                    removeFromCart(slug)
                  }}
                  class="text-brand-first-700 focus-visible:outline-brand-first-500 relative z-10 -mt-2 flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:bg-red-700 hover:text-white focus-visible:bg-red-700 focus-visible:text-white focus-visible:outline-2 motion-reduce:transition-none"
                  aria-label={`Odebrat z košíku: ${book?.title ?? slug}`}
                >
                  <iconify-icon
                    icon="ph:trash"
                    class="text-base"
                    noobserver
                    aria-hidden="true"
                  ></iconify-icon>
                </button>

                <div class="col-span-2 flex items-center justify-between gap-3">
                  {#if book}
                    <p
                      class="font-head text-base leading-none font-extrabold text-black [font-variant-numeric:lining-nums_tabular-nums]"
                    >
                      {formatPrice(book.price)}
                    </p>
                  {:else}
                    <p
                      class="font-alt text-brand-first-700 text-[0.62rem] leading-[1.2] tracking-[0.1em] uppercase"
                    >
                      {tp('Nepočítá se do ceny')}
                    </p>
                  {/if}
                  <div class="pointer-events-none relative z-10 flex shrink-0 items-center">
                    <button
                      type="button"
                      onclick={() => {
                        updateQuantity(slug, count - 1)
                      }}
                      class="text-brand-first-700 hover:bg-brand-first-700 focus-visible:outline-brand-first-500 pointer-events-auto flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:text-white focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-first-700 motion-reduce:transition-none"
                      disabled={count <= 1}
                      aria-label={`Snížit počet: ${book?.title ?? slug}`}
                    >
                      <iconify-icon
                        icon="ph:minus"
                        class="text-base"
                        noobserver
                        aria-hidden="true"
                      ></iconify-icon>
                    </button>
                    <span
                      class="font-alt w-6 text-center text-sm font-semibold text-gray-900 [font-variant-numeric:lining-nums_tabular-nums]"
                      >{count}</span
                    >
                    <button
                      type="button"
                      onclick={() => {
                        updateQuantity(slug, count + 1)
                      }}
                      class="text-brand-first-700 hover:bg-brand-first-700 focus-visible:outline-brand-first-500 pointer-events-auto flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:text-white focus-visible:outline-2 motion-reduce:transition-none"
                      aria-label={`Zvýšit počet: ${book?.title ?? slug}`}
                    >
                      <iconify-icon
                        icon="ph:plus"
                        class="text-base"
                        noobserver
                        aria-hidden="true"
                      ></iconify-icon>
                    </button>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
          <div
            class="border-brand-first-300/60 flex justify-center border-t border-dashed pt-1"
          >
            <button
              type="button"
              onclick={emptyCart}
              class="font-alt focus-visible:outline-red-700 inline-flex min-h-[2.2rem] cursor-pointer items-center gap-2 px-2 text-[0.7rem] leading-none tracking-[0.1em] whitespace-nowrap text-red-700 uppercase transition-colors hover:bg-red-700 hover:text-white focus-visible:bg-red-700 focus-visible:text-white focus-visible:outline-2 motion-reduce:transition-none"
              aria-label="Vyprázdnit košík"
            >
              <iconify-icon
                icon="ph:trash"
                class="text-base"
                noobserver
                aria-hidden="true"
              ></iconify-icon>
              {tp('Vyprázdnit košík')}
            </button>
          </div>
        </div>
        </div>
      </div>

      <div
        class="absolute right-0 bottom-0 flex h-14 w-(--w) items-center justify-between gap-3 pr-0 pl-4"
      >
        <div class="min-w-0 shrink whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none">
          <p
            class="font-alt text-[0.62rem] leading-none tracking-[0.1em] uppercase"
          >
            {tp(`Celkem · ${String(totalCount)} ks`)}
          </p>
          <p
            class="font-head mt-1.5 text-[1.2rem] max-xs:text-[1.05rem] leading-none font-extrabold [font-variant-numeric:lining-nums]"
          >
            {formatPrice(totalPrice)}
          </p>
        </div>
        <a
          href={routes.cart()}
          class="group/btn font-alt bg-brand-first-700 relative mr-[9px] flex h-10 shrink-0 items-center pl-3 text-white focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-white max-xs:pl-2"
        >
          <span
            aria-hidden="true"
            class="bg-brand-second-500 group-hover/btn:bg-brand-second-700 group-focus-visible/btn:bg-brand-second-700 pointer-events-none absolute inset-0 opacity-0 transition-[opacity,background-color] duration-250 group-hover:opacity-100 group-hover:[transition-delay:1000ms,0ms] group-focus-within:opacity-100 group-focus-within:[transition-delay:850ms,0ms] motion-reduce:transition-none"
          ></span>
          <svg
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 size-full"
          >
            <rect
              x="0.5"
              y="0.5"
              pathLength="1"
              class="fill-none stroke-white [stroke-dasharray:1] [stroke-dashoffset:1] [x:0.5px] [y:0.5px] [width:calc(100%_-_1px)] [height:calc(100%_-_1px)] [stroke-width:1] transition-[stroke-dashoffset] duration-150 group-hover:[stroke-dashoffset:0] group-hover:delay-[550ms] group-hover:duration-[450ms] group-focus-within:[stroke-dashoffset:0] group-focus-within:delay-[400ms] group-focus-within:duration-[450ms] group-focus-visible/btn:[x:1px] group-focus-visible/btn:[y:1px] group-focus-visible/btn:[width:calc(100%_-_2px)] group-focus-visible/btn:[height:calc(100%_-_2px)] group-focus-visible/btn:[stroke-width:2] motion-reduce:transition-none"
            />
          </svg>
          <span
            class="relative text-[0.75rem] leading-none font-semibold tracking-[0.03em] whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
            >{tp('Dokončit nákup')}</span
          >
          <span class="relative flex w-10 shrink-0 items-center justify-center">
            <iconify-icon
              icon="ph:shopping-cart"
              class="text-2xl leading-none"
              noobserver
              aria-hidden="true"
            ></iconify-icon>
          </span>
        </a>
      </div>
    </div>

    <span
      class="bg-brand-second-500 ring-paper pointer-events-none absolute top-[-9px] right-[-9px] grid h-6 min-w-6 place-items-center overflow-hidden px-1 text-xs font-bold text-white ring-2 [font-variant-numeric:lining-nums]"
      role="status"
      aria-label={pluralize(totalCount, PIECE_UNITS) + ' v košíku'}
    >
      {#key badge}
        <span
          class="col-start-1 row-start-1"
          aria-hidden="true"
          in:fly={{ y: 6, duration: duration(160) }}
          out:fly={{ y: -6, duration: duration(160) }}
        >
          {badge}
        </span>
      {/key}
    </span>
  </div>
{/if}
