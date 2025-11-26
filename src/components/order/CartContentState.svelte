<script lang="ts">
  import { onMount } from "svelte";
  import { orderStore, updateQuantity, removeFromCart, emptyCart, setCurrentState } from "@/stores/order";

  // Book info loaded from API
  type Book = { title: string; author?: string; cover?: string; price?: number };
  let books: Record<string, Book> = {};
  let _loading = false;
  let _error: string | null = null;
  let requested: string[] = [];

  $: total = $orderStore.cart.reduce(
    (sum, { slug, count }) => sum + (books[slug]?.price ?? 0) * count,
    0,
  );

  async function fetchBooks(slugs: string[]) {
    if (slugs.length === 0) return;
    try {
      _loading = true;
      const res = await fetch(`/api/books.json?slugs=${encodeURIComponent(slugs.join(","))}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as unknown as Record<string, Book>;
      books = { ...books, ...data };
      _error = null;
    } catch {
      _error = "Nepodařilo se načíst data o knize";
    } finally {
      _loading = false;
      slugs.forEach((s) => {
        if (!books[s]) requested = requested.filter((r) => r !== s);
      });
    }
  }

  onMount(() => {
    const slugs = Array.from(new Set($orderStore.cart.map((i) => i.slug)));
    void fetchBooks(slugs);
  });

  $: {
    const known = Object.keys(books);
    const all = Array.from(new Set($orderStore.cart.map((i) => i.slug)));
    const needed = all.filter((s) => !known.includes(s) && !requested.includes(s));
    if (needed.length > 0) {
      needed.forEach((s) => {
        if (!requested.includes(s)) requested = [...requested, s];
      });
      void fetchBooks(needed).finally(() => {
        needed.forEach((s) => {
          requested = requested.filter((r) => r !== s);
        });
      });
    }
  }
</script>

<div class="max-w-4xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold">Obsah košíku</h2>
    <button on:click={() => { emptyCart(); }}
      class="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border border-red-200 hover:border-red-300">
      Vymazat košík
    </button>
  </div>

  {#if $orderStore.cart.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500 text-lg">Váš košík je prázdný</p>
      <a href="/knihy" class="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Prohlédnout knihy
      </a>
    </div>
  {:else}
    <div class="space-y-4 mb-8">
      {#each $orderStore.cart as { slug, count } (slug)}
        {#key slug}
          <div class="relative border rounded-lg p-4 bg-white shadow-sm">
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-20 h-28 border rounded overflow-hidden bg-gray-100">
                {#if books[slug]?.cover}
                  <img src={books[slug].cover} alt={books[slug].title || slug} class="w-full h-full object-cover" />
                {/if}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900">{books[slug]?.title ?? slug}</h3>
                {#if books[slug]?.author}
                  <p class="text-gray-600 text-sm mb-2">{books[slug].author}</p>
                {/if}
                {#if books[slug]?.price}
                  <p class="text-lg font-bold text-gray-900">{books[slug].price} Kč</p>
                {/if}
              </div>
              <div class="flex flex-col items-end space-y-2">
                <div class="flex items-center space-x-1">
                  <button
                    on:click={() => { updateQuantity(slug, count - 1); }}
                    class="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    disabled={count <= 1}
                    aria-label="Snížit počet"
                  >
                    -
                  </button>
                  <span class="w-6 text-center font-medium">{count}</span>
                  <button
                    on:click={() => { updateQuantity(slug, count + 1); }}
                    class="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    aria-label="Zvýšit počet"
                  >
                    +
                  </button>
                </div>
                <button
                  on:click={() => { removeFromCart(slug); }}
                  class="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-200 hover:border-red-300"
                >
                  Odstranit
                </button>
              </div>
            </div>
          </div>
        {/key}
      {/each}
    </div>

    <div class="border-t pt-6">
      <div class="flex justify-end mb-6">
        <div class="text-right">
          <div class="text-lg font-bold text-gray-900">Celkem: {total} Kč</div>
        </div>
      </div>
      <div class="flex justify-between items-center mb-6">
        <div class="flex space-x-4">
          <a href="/knihy" class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Pokračovat v nakupování</a>
          <button on:click={() => { setCurrentState('deliveryPayment'); }} class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Pokračovat k objednávce
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
