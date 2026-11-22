<script lang="ts">
  import 'iconify-icon'

  import { onMount, untrack } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'
  import { fly } from 'svelte/transition'

  import { routes } from '@/routes'
  import { cart, cartCount, removeFromCart, updateQuantity } from '@/stores/cart'
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
      class="bg-brand-first-700 border-brand-first-700 hover:border-brand-first-300/60 focus-within:border-brand-first-300/60 hover:bg-paper focus-within:bg-paper group relative h-14 w-14 overflow-hidden border shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)] transition-[width,height,background-color,border-color] duration-300 ease-out [--w:min(20rem,calc(100vw-2rem))] hover:h-[min(26rem,calc(100svh-6rem))] hover:w-(--w) hover:delay-150 hover:duration-[600ms] focus-within:h-[min(26rem,calc(100svh-6rem))] focus-within:w-(--w) focus-within:delay-0 focus-within:duration-[600ms] motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        class="border-brand-first-300/60 pointer-events-none absolute top-2 left-2 size-3 border-t border-l opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      ></span>
      <span
        aria-hidden="true"
        class="border-brand-first-300/60 pointer-events-none absolute top-2 right-9 size-3 border-t border-r opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      ></span>

      <div
        class="absolute inset-x-0 top-0 bottom-20 overflow-y-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500 group-focus-within:opacity-100 group-focus-within:delay-300 group-focus-within:duration-500 motion-reduce:transition-none"
      >
        <div class="w-(--w) px-4 pt-6 pb-2">
          <p
            class="font-alt text-brand-first-700 mb-2 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
          >
            {tp('Košík')}
          </p>
          <ul class="flex flex-col">
            {#each items as { slug, count } (slug)}
              {@const book = books[slug]}
              <li
                class="border-brand-first-300/60 grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-t border-dashed py-3"
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
                  <p
                    class="font-head text-brand-first-500 line-clamp-2 text-[1.05rem] leading-[1.1] font-extrabold"
                  >
                    {book ? tp(book.title) : tp('Kniha není v nabídce')}
                  </p>
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
                  class="text-brand-first-700 hover:bg-brand-first-700 focus-visible:outline-brand-first-500 -mt-2 flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:text-white focus-visible:outline-2 motion-reduce:transition-none"
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
                  <div class="flex shrink-0 items-center">
                    <button
                      type="button"
                      onclick={() => {
                        updateQuantity(slug, count - 1)
                      }}
                      class="text-brand-first-700 hover:bg-brand-first-700 focus-visible:outline-brand-first-500 flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:text-white focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-first-700 motion-reduce:transition-none"
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
                      class="text-brand-first-700 hover:bg-brand-first-700 focus-visible:outline-brand-first-500 flex size-[2.2rem] cursor-pointer items-center justify-center transition-colors hover:text-white focus-visible:outline-2 motion-reduce:transition-none"
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

      <div
        class="group-hover:border-brand-first-300/60 group-focus-within:border-brand-first-300/60 group-hover:bg-paper group-focus-within:bg-paper absolute right-0 bottom-0 flex h-14 w-(--w) items-end justify-between gap-3 border-t border-transparent pr-2 pb-2 pl-4 transition-[height,padding] duration-300 group-hover:h-20 group-hover:border-dashed group-hover:pr-4 group-hover:pb-4 group-hover:delay-150 group-hover:duration-[600ms] group-focus-within:h-20 group-focus-within:border-dashed group-focus-within:pr-4 group-focus-within:pb-4 motion-reduce:transition-none"
      >
        <div class="shrink-0 self-center whitespace-nowrap">
          <p
            class="font-alt text-brand-first-700 text-[0.62rem] leading-none tracking-[0.1em] uppercase"
          >
            {tp(`Celkem · ${String(totalCount)} ks`)}
          </p>
          <p
            class="font-head mt-1.5 text-[1.4rem] leading-none font-extrabold text-black [font-variant-numeric:lining-nums]"
          >
            {formatPrice(totalPrice)}
          </p>
        </div>
        <a
          href={routes.cart()}
          class="font-alt bg-brand-first-700 hover:bg-brand-first-800 focus-visible:bg-brand-first-800 focus-visible:outline-brand-first-500 flex h-10 items-center gap-3 pr-2 pl-4 text-sm leading-none font-semibold tracking-[0.03em] whitespace-nowrap text-white transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        >
          {tp('Dokončit nákup')}
          <iconify-icon
            icon="ph:shopping-cart"
            class="text-2xl"
            noobserver
            aria-hidden="true"
          ></iconify-icon>
        </a>
      </div>
    </div>

    <span
      class="bg-brand-second-500 absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center overflow-hidden px-1 text-xs font-bold text-white [font-variant-numeric:lining-nums]"
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
