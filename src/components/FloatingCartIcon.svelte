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
      'group/cart fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 transition-opacity duration-200 motion-reduce:transition-none',
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
      class="bg-brand-first-700 group relative h-14 w-14 overflow-hidden shadow-[0_0.3rem_1rem_rgba(0,0,0,0.35)] transition-[width,height,box-shadow] duration-300 ease-out [--w:min(22rem,calc(100vw-2rem))] hover:h-[min(26rem,calc(100svh-6rem))] hover:w-(--w) hover:shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)] hover:delay-150 hover:duration-[600ms] focus-within:h-[min(26rem,calc(100svh-6rem))] focus-within:w-(--w) focus-within:shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)] focus-within:delay-0 focus-within:duration-[600ms] motion-reduce:transition-none"
    >
      <div
        class="bg-paper border-brand-first-300/60 invisible absolute inset-x-0 top-0 bottom-14 border transition-[visibility] duration-300 group-hover:visible group-hover:delay-150 group-hover:duration-[600ms] group-focus-within:visible group-focus-within:delay-0 group-focus-within:duration-[600ms] motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          class="border-brand-first-300/60 pointer-events-none absolute top-2 left-2 size-3 border-t border-l opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
        ></span>
        <span
          aria-hidden="true"
          class="border-brand-first-300/60 pointer-events-none absolute top-2 right-2 size-3 border-t border-r opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
        ></span>

        <div
          class="absolute inset-0 overflow-y-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
        >
        <div class="w-(--w) px-4 pt-6 pb-2">
          <div class="mb-1 flex items-center justify-between gap-3 pr-[3rem]">
            <p
              class="font-alt text-brand-first-700 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
            >
              {tp('Košík')}
            </p>
            <button
              type="button"
              onclick={emptyCart}
              class="font-alt text-brand-first-700 focus-visible:outline-brand-first-500 -mr-2 inline-flex min-h-[2.2rem] cursor-pointer items-center px-2 text-[0.7rem] leading-none tracking-[0.1em] uppercase underline underline-offset-2 transition-colors hover:text-red-700 focus-visible:text-red-700 focus-visible:outline-2 motion-reduce:transition-none"
              aria-label="Vyprázdnit košík"
            >
              {tp('Vyprázdnit košík')}
            </button>
          </div>
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
        </div>
        </div>
      </div>

      <div
        class="absolute right-0 bottom-0 flex h-14 w-(--w) items-center justify-between gap-2 pr-0 pl-4"
      >
        <div class="min-w-0 shrink whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none">
          <p
            class="font-alt text-[0.62rem] leading-none tracking-[0.1em] uppercase"
          >
            {tp(`Celkem · ${String(totalCount)} ks`)}
          </p>
          <p
            class="font-head mt-1.5 text-[1.2rem] leading-none font-extrabold [font-variant-numeric:lining-nums]"
          >
            {formatPrice(totalPrice)}
          </p>
        </div>
        <a
          href={routes.cart()}
          class="group/btn font-alt bg-brand-first-700 hover:bg-brand-first-800 focus-visible:bg-brand-first-800 relative mr-[9px] flex h-10 shrink-0 items-center pl-3 text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 border border-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:delay-[550ms] group-hover:duration-[350ms] group-focus-within:opacity-100 group-focus-within:delay-[400ms] group-focus-within:duration-[350ms] motion-reduce:transition-none"
          ></span>
          <span
            class="text-[0.75rem] leading-none font-semibold tracking-[0.03em] whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
            >{tp('Dokončit nákup')}</span
          >
          <span class="flex w-10 shrink-0 items-center justify-center">
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
      class="bg-brand-second-500 ring-paper pointer-events-none absolute top-[-9px] right-[-9px] grid h-6 min-w-6 place-items-center overflow-hidden px-1 text-xs font-bold text-white ring-2 transition-[top,right] duration-300 ease-out group-hover/cart:top-2 group-hover/cart:right-[1.8rem] group-hover/cart:delay-150 group-hover/cart:duration-[600ms] group-focus-within/cart:top-2 group-focus-within/cart:right-[1.8rem] group-focus-within/cart:delay-0 group-focus-within/cart:duration-[600ms] motion-reduce:transition-none [font-variant-numeric:lining-nums]"
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
