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
  const isCartPage = $derived(pathname.startsWith(routes.cart()))
  const isHidden = $derived(totalCount === 0 || isCartPage)
  const duration = (value: number) => (reducedMotion.current ? 0 : value)

  const readFooterProgress = () => {
    const progress = Number.parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue('--footer-progress'),
    )
    isFooterRevealed = progress > FOOTER_REVEAL_THRESHOLD
  }

  const scheduleFooterRead = () => {
    window.requestAnimationFrame(readFooterProgress)
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
    }
  })

  $effect(() => {
    if (!isMounted) {
      return
    }
    const current = items.map(({ slug }) => slug)
    const previous = knownSlugs
    knownSlugs = current
    if (previous === undefined || reducedMotion.current) {
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
      'fixed right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 transition-opacity duration-200',
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
            class="animate-cart-fall absolute top-0 left-1/2 h-10 w-8 rounded object-cover shadow-md"
            onanimationend={() => {
              removeSprite(sprite.id)
            }}
          />
        {/each}
      </div>
    {/if}
    <div
      class="bg-brand-first-500 hover:border-brand-first-300 focus-within:border-brand-first-300 group relative h-14 w-14 overflow-hidden rounded-[1.75rem] border border-transparent shadow-lg transition-all duration-200 hover:h-100 hover:w-80 hover:bg-white focus-within:h-100 focus-within:w-80 focus-within:bg-white motion-reduce:transition-none"
    >
      <div
        class="h-6 w-full group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-transparent group-focus-within:bg-gradient-to-b group-focus-within:from-white group-focus-within:to-transparent"
      ></div>

      <div
        class="absolute inset-0 overflow-y-auto pb-9 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
      >
        <ul class="flex w-80 max-w-full flex-col gap-2 p-4 pb-12">
          {#each items as { slug, count } (slug)}
            {@const book = books[slug]}
            <li
              class="relative flex items-center gap-3 rounded border border-gray-100 p-2 hover:bg-gray-50"
            >
              <div class="h-14 w-10 shrink-0">
                {#if book}
                  <img
                    src={book.cover}
                    alt=""
                    class="h-full w-full rounded object-cover shadow-sm"
                  />
                {:else}
                  <div class="h-full w-full rounded bg-gray-200" aria-hidden="true"></div>
                {/if}
              </div>

              <div class="min-w-0 flex-1">
                <h4 class="line-clamp-2 text-xs leading-tight font-medium text-gray-900">
                  {book ? tp(book.title) : tp('Kniha není v nabídce')}
                </h4>
                {#if book}
                  <p class="truncate text-[10px] text-gray-500">{tp(book.author)}</p>
                  <p class="text-xs font-semibold text-gray-700">
                    {formatPrice(book.price)}
                  </p>
                {:else}
                  <p class="text-[10px] text-gray-500">{tp('Nepočítá se do ceny')}</p>
                {/if}
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onclick={() => {
                    updateQuantity(slug, count - 1)
                  }}
                  class="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-gray-300 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
                  disabled={count <= 1}
                  aria-label="Snížit počet"
                >
                  <iconify-icon icon="ph:minus" class="size-2.5" noobserver
                  ></iconify-icon>
                </button>
                <span class="w-4 text-center text-xs font-medium">{count}</span>
                <button
                  type="button"
                  onclick={() => {
                    updateQuantity(slug, count + 1)
                  }}
                  class="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-gray-300"
                  aria-label="Zvýšit počet"
                >
                  <iconify-icon icon="ph:plus" class="size-2.5" noobserver></iconify-icon>
                </button>
                <button
                  type="button"
                  onclick={() => {
                    removeFromCart(slug)
                  }}
                  class="ml-1 flex size-5 cursor-pointer items-center justify-center text-red-500"
                  aria-label="Odebrat z košíku"
                >
                  <iconify-icon icon="ph:trash" class="size-3" noobserver></iconify-icon>
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <div
        class="absolute right-0 bottom-0 flex h-14 w-80 items-center justify-between p-1.5 group-hover:bg-linear-to-t group-hover:from-white group-hover:from-80% group-hover:to-transparent group-focus-within:bg-linear-to-t group-focus-within:from-white group-focus-within:from-80% group-focus-within:to-transparent"
      >
        <div class="pl-2 text-sm leading-tight font-semibold text-gray-800">
          <p>{tp(`Celkem: ${formatPrice(totalPrice)}`)}</p>
          <p class="text-[10px] font-normal text-gray-500">
            {pluralize(totalCount, PIECE_UNITS)}
          </p>
        </div>
        <a
          href={routes.cart()}
          class="font-alt bg-brand-first-500 hover:bg-brand-first-700 flex items-center gap-4 rounded-[1.75rem] border border-transparent p-1 pr-2 pl-3 text-sm text-white transition-colors group-hover:border-gray-700 group-hover:bg-white group-hover:text-black group-focus-within:border-gray-700 group-focus-within:bg-white group-focus-within:text-black"
        >
          {tp('Dokončit nákup')}
          <iconify-icon icon="ph:shopping-cart" class="text-2xl" noobserver
          ></iconify-icon>
        </a>
      </div>
    </div>

    <span
      class="bg-brand-second-500 absolute -top-2 -right-2 flex size-6 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
      role="status"
      aria-label={pluralize(totalCount, PIECE_UNITS) + ' v košíku'}
    >
      {#key badge}
        <span
          class="absolute inset-0 flex items-center justify-center"
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
