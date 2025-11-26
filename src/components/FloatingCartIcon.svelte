<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'

  import { orderStore, removeFromCart, updateQuantity } from '@/stores/order'
  import { cn } from '@/utils/cn'

  type Book = { title: string; author?: string; cover?: string; price?: number }

  let books: Record<string, Book> = {}
  let requested: string[] = []

  let _loading = false
  let _error: string | null = null

  $: totalCount = $orderStore.cart.reduce((n, { count }) => n + count, 0)
  $: totalPrice = $orderStore.cart.reduce(
    (sum, { slug, count }) => sum + (books[slug]?.price ?? 0) * count,
    0,
  )

  let isCartPage = false

  function updatePathFlag() {
    if (typeof window === 'undefined') return
    isCartPage = window.location.pathname.startsWith('/kosik')
  }

  onMount(() => {
    updatePathFlag()
    if (typeof window !== 'undefined') {
      window.addEventListener('astro:page-load', updatePathFlag as EventListener)
      return () => {
        window.removeEventListener('astro:page-load', updatePathFlag as EventListener)
      }
    }
  })
  $: isHidden = totalCount === 0 || isCartPage

  // --- Fall-in animation for newly added books ---
  type Sprite = { id: number; cover: string }
  let spriteId = 0
  let fallSprites: Sprite[] = []
  let prevSlugs: string[] = []
  let initialized = false

  function spawnSprite(cover: string) {
    const id = ++spriteId
    fallSprites = [...fallSprites, { id, cover }]
    setTimeout(() => {
      fallSprites = fallSprites.filter((s) => s.id !== id)
    }, 700)
  }

  onMount(() => {
    prevSlugs = Array.from(new Set($orderStore.cart.map((i) => i.slug)))
    initialized = true
  })

  $: if (initialized) {
    const current = Array.from(new Set($orderStore.cart.map((i) => i.slug)))
    for (const slug of current) {
      if (!prevSlugs.includes(slug)) {
        const cover = books[slug]?.cover
        if (cover) spawnSprite(cover)
      }
    }
    prevSlugs = current
  }

  async function fetchBooks(slugs: string[]) {
    if (slugs.length === 0) return
    try {
      _loading = true
      const res = await fetch(
        `/api/books.json?slugs=${encodeURIComponent(slugs.join(','))}`,
      )
      if (!res.ok) throw new Error('Failed to load')
      const data = (await res.json()) as unknown as Record<string, Book>
      books = { ...books, ...data }
      _error = null
    } catch {
      _error = 'Nepodařilo se načíst data o knize'
    } finally {
      _loading = false
      slugs.forEach((s) => {
        if (!books[s]) requested = requested.filter((r) => r !== s)
      })
    }
  }

  onMount(() => {
    const slugs = Array.from(new Set($orderStore.cart.map((i) => i.slug)))
    void fetchBooks(slugs)
  })

  $: {
    const known = Object.keys(books)
    const all = Array.from(new Set($orderStore.cart.map((i) => i.slug)))
    const needed = all.filter((s) => !known.includes(s) && !requested.includes(s))
    if (needed.length > 0) {
      needed.forEach((s) => {
        if (!requested.includes(s)) requested = [...requested, s]
      })
      void fetchBooks(needed).finally(() => {
        needed.forEach((s) => {
          requested = requested.filter((r) => r !== s)
        })
      })
    }
  }
</script>

{#if !isHidden}
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Falling sprites overlay -->
    {#if fallSprites.length > 0}
      <div
        class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 w-14 h-24 z-[60]"
      >
        {#each fallSprites as s (s.id)}
          <img
            src={s.cover}
            alt=""
            class="absolute top-0 left-1/2 w-8 h-10 object-cover rounded shadow-md animate-[cartFall_700ms_ease-out_forwards]"
          />
        {/each}
      </div>
    {/if}
    <div
      class="bg-brand-first-500 overflow-hidden rounded-[1.75rem] shadow-lg border border-transparent duration-200 group w-14 h-14 transition-all druation-700 relative hover:border-brand-first-300 hover:bg-white hover:w-80 hover:h-100"
    >
      <div
        class="aboslute top-0 w-full h-6 group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-transparent"
      ></div>

      <div
        class="overflow-y-scroll w-full h-full group-hover:opacity-100 opacity-0 pb-9 transition-opacity"
      >
        <div class="flex flex-col justify-between w-80 p-4 pb-12">
          {#if $orderStore.cart.length === 0}
            <p class="text-gray-500 text-sm text-center py-4">Košík je prázdný</p>
          {:else}
            <div class="grid grid-cols-2 gap-4">
              {#each $orderStore.cart as { slug, count } (slug)}
                {#key slug}
                  <div
                    class="relative flex flex-col items-center p-2 hover:bg-gray-50 rounded border border-gray-100"
                  >
                    <button
                      on:click={() => { removeFromCart(slug); }}
                      class="text-red-500 absolute top-0 cursor-pointer right-0 size-5 flex items-center justify-center"
                      aria-label="Odebrat z košíku"
                    >
                      <Icon icon="ph:trash" class="size-3" />
                    </button>
                    <div class="w-16 h-20 mb-2">
                      {#if books[slug]?.cover}
                        <img
                          src={books[slug].cover}
                          alt={books[slug].title || slug}
                          class="w-full h-full object-cover rounded shadow-sm"
                        />
                      {:else}
                        <div
                          class="w-full h-full rounded bg-gray-200"
                          aria-hidden="true"
                        ></div>
                      {/if}
                    </div>

                    <div class="text-center mb-2">
                      <h4
                        class="font-medium text-xs text-gray-900 leading-tight line-clamp-2"
                      >
                        {books[slug]?.title ?? slug}
                      </h4>
                      <p class="text-[10px] text-gray-500">
                        {books[slug]?.author ?? ''}
                      </p>
                      {#if books[slug]?.price}
                        <p class="text-xs text-gray-700 font-semibold">
                          {books[slug].price} Kč
                        </p>
                      {/if}
                    </div>

                    <div class="flex items-center space-x-1 mb-1">
                      <button
                        on:click={() => { updateQuantity(slug, count - 1); }}
                        class="size-5 rounded-full hover:bg-gray-300 flex items-center justify-center"
                        disabled={count <= 1}
                        aria-label="Snížit počet"
                      >
                        <Icon icon="ph:minus" class="w-2.5 h-2.5" />
                      </button>
                      <span class="text-xs font-medium w-4 text-center">{count}</span>
                      <button
                        on:click={() => { updateQuantity(slug, count + 1); }}
                        class="w-5 h-5 rounded-full hover:bg-gray-300 flex items-center justify-center"
                        aria-label="Zvýšit počet"
                      >
                        <Icon icon="ph:plus" class="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                {/key}
              {/each}
            </div>
          {/if}

          <!--
        {#if items.length > 0}
          <div class="flex justify-between items-center mb-2 px-2">
            <span class="text-sm font-medium text-gray-700">Celkem:</span>
            <span class="text-sm font-bold text-gray-900">
              {items.reduce((total, { slug, count }) => (total + (books[slug]?.price ?? 0) * count), 0)} Kč
            </span>
          </div>
        {/if}
        -->
        </div>
      </div>

      <div
        class="flex justify-between items-center absolute bottom-0 right-0 w-80 h-14 p-1.5 group-hover:bg-linear-to-t group-hover:from-80% group-hover:from-white group-hover:to-transparent"
      >
        <div class="pl-2">
          {#if $orderStore.cart.length > 0}
            <div class="text-sm text-gray-800 font-semibold">Celkem: {totalPrice} Kč</div>
          {/if}
        </div>
        <a
          href="/kosik"
          class={cn(
            'flex font-alt gap-4 text-white text-sm bg-brand-first-500 items-center p-1 pr-2 pl-3 border border-transparent transition-colors rounded-[1.75rem]',
            'hover:bg-brand-first-700 hover:text-white',
            'group-hover:bg-white group-hover:border-gray-700 group-hover:text-black',
          )}
        >
          Dokončit nákup
          <Icon icon="ph:shopping-cart" class="w-6 h-6" />
        </a>
      </div>
    </div>

    {#if totalCount > 0}
      <span
        class="absolute -top-2 -right-2 bg-brand-second-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold overflow-hidden"
      >
        {#key totalCount > 99 ? '99+' : totalCount}
          <span
            class="absolute inset-0 flex items-center justify-center"
            out:fly={{ y: -6, duration: 160 }}
            in:fly={{ y: 6, duration: 160 }}
          >
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        {/key}
      </span>
    {/if}
  </div>
{/if}
