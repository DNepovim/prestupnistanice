<script lang="ts">
  import Icon from '@iconify/svelte'

  type CartItem = { slug: string; count: number }
  type Book = { title: string; cover?: string; price?: number }

  let items: CartItem[] = [
    { slug: 'kniha-1', count: 1 },
    { slug: 'kniha-2', count: 2 },
    { slug: 'kniha-3', count: 1 },
  ]

  const books: Record<string, Book> = {
    'kniha-1': {
      title: 'Kniha první',
      price: 299,
      cover: 'https://placehold.co/64x80?text=K1',
    },
    'kniha-2': {
      title: 'Kniha druhá',
      price: 399,
      cover: 'https://placehold.co/64x80?text=K2',
    },
    'kniha-3': {
      title: 'Kniha třetí',
      price: 249,
      cover: 'https://placehold.co/64x80?text=K3',
    },
  }

  let loading = false
  let error: string | null = null

  const totalItems = () => items.reduce((total, { count }) => total + count, 0)

  function updateQuantity(slug: string, quantity: number) {
    const next = Math.max(1, quantity)
    items = items.map((i) => (i.slug === slug ? { ...i, count: next } : i))
  }

  function removeFromCart(slug: string) {
    items = items.filter((i) => i.slug !== slug)
  }
</script>

<div class="fixed bottom-6 right-6 z-50">
  <div
    class="bg-brand-first overflow-hidden rounded-[1.75rem] shadow-lg border border-transparent duration-200 group w-14 h-14 transition-all druation-700 relative hover:border-brand-first-300 hover:bg-white hover:w-80 hover:h-100"
  >
    <div
      class="aboslute top-0 w-full h-6 group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-transparent"
    ></div>

    <div
      class="overflow-y-scroll w-full h-full group-hover:opacity-100 opacity-0 pb-9 transition-opacity"
    >
      <div class="flex flex-col justify-between w-80 p-2">
        <div class="py-4">
          {#if items.length === 0}
            <p class="text-gray-500 text-sm text-center py-4">Košík je prázdný</p>
          {:else}
            <div class="grid grid-cols-2 gap-2">
              {#each items as { slug, count }}
                {#key slug}
                  <div
                    class="flex flex-col items-center p-2 hover:bg-gray-50 rounded border border-gray-100"
                  >
                    {#if books[slug]?.cover}
                      <div class="w-16 h-20 mb-2">
                        <img
                          src={books[slug].cover}
                          alt={books[slug].title}
                          class="w-full h-full object-cover rounded shadow-sm"
                        />
                      </div>
                    {/if}

                    <div class="text-center mb-2">
                      <h4 class="font-medium text-xs text-gray-900 leading-tight">
                        {books[slug]?.title ?? slug}
                      </h4>
                      {#if books[slug]?.price}
                        <p class="text-xs text-gray-600 font-semibold">
                          {books[slug].price} Kč
                        </p>
                      {/if}
                      {#if loading}
                        <p class="text-xs text-gray-500">Načítání...</p>
                      {/if}
                      {#if error && !books[slug]}
                        <p class="text-xs text-red-500">Chyba při načítání</p>
                      {/if}
                    </div>

                    <div class="flex items-center space-x-1 mb-1">
                      <button
                        on:click={() => { updateQuantity(slug, count - 1); }}
                        class="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        disabled={count <= 1}
                        aria-label="Snížit počet"
                      >
                        <Icon icon="ph:minus" class="w-2.5 h-2.5" />
                      </button>
                      <span class="text-xs font-medium w-4 text-center">{count}</span>
                      <button
                        on:click={() => { updateQuantity(slug, count + 1); }}
                        class="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        aria-label="Zvýšit počet"
                      >
                        <Icon icon="ph:plus" class="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      on:click={() => { removeFromCart(slug); }}
                      class="text-red-500 hover:text-red-700 p-1"
                      aria-label="Odebrat z košíku"
                    >
                      <Icon icon="ph:x" class="w-3 h-3" />
                    </button>
                  </div>
                {/key}
              {/each}
            </div>
          {/if}
        </div>

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
      class="flex justify-end absolute bottom-0 right-0 w-80 h-14 p-1.5 group-hover:bg-linear-to-t group-hover:from-80% group-hover:from-white group-hover:to-transparent"
    >
      <a
        href="/kosik"
        class="flex font-alt gap-4 text-white text-sm bg-brand-first items-center p-1 pr-2 pl-3 border border-transparent transition-colors rounded-[1.75rem] hover:bg-brand-first-700 hover:text-white group-hover:bg-white group-hover:border-gray-700 group-hover:text-black"
      >
        Dokončit nákup
        <Icon icon="ph:shopping-cart" class="w-6 h-6" />
      </a>
    </div>
  </div>

  {#if totalItems() > 0}
    <span
      class="absolute -top-2 -right-2 bg-brand-second text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
    >
      {totalItems() > 99 ? '99+' : totalItems()}
    </span>
  {/if}
</div>
