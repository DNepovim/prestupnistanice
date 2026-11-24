<script lang="ts">
  import { removeFromCart, updateQuantity } from '@/stores/cart'
  import { formatPrice } from '@/utils/formatPrice'
  import type { OrderLine } from '@/utils/order/totals'
  import { tp } from '@/utils/tp'

  import ItemMarks from './ItemMarks.svelte'

  type Props = {
    lines: OrderLine[]
  }

  const { lines }: Props = $props()

  const MAX_COUNT = 99

  const QUANTITY_BUTTON =
    'border-(--step) text-(--step-ink) hover:bg-[color-mix(in_srgb,var(--step),white_90%)] flex size-9 items-center justify-center border bg-white text-lg leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--step) disabled:cursor-not-allowed disabled:border-(--step)/40 disabled:text-gray-500 disabled:hover:bg-white motion-reduce:transition-none'
</script>

<ul class="flex flex-col gap-8 px-2 pt-3">
  {#each lines as { book, count, total }, index (book.slug)}
    <li
      style={`--c1:${book.color}`}
      class="group/item relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-3 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--c1)_9%,transparent)] focus-within:bg-[color-mix(in_srgb,var(--c1)_9%,transparent)] min-sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] motion-reduce:transition-none"
    >
      <ItemMarks hasCut={index < lines.length - 1} />
      <img
        src={book.cover}
        alt=""
        width="72"
        class="row-span-2 w-[4.5rem] shadow-[0_0.2rem_0.9rem_rgba(0,0,0,0.18)] min-sm:row-span-1"
      />
      <div class="flex min-w-0 flex-col gap-1 pr-4">
        <h3
          class="font-head text-[1.25rem] leading-[1.1] font-extrabold text-black transition-colors group-hover/item:text-[color-mix(in_srgb,var(--c1),black_30%)] group-focus-within/item:text-[color-mix(in_srgb,var(--c1),black_30%)] motion-reduce:transition-none"
        >
          {tp(book.title)}
        </h3>
        <p class="font-alt text-[0.95rem] text-gray-800 italic">{tp(book.author)}</p>
      </div>
      <div
        class="font-alt col-start-2 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 min-sm:col-start-3 min-sm:flex-col min-sm:items-end min-sm:justify-start"
      >
        <div
          role="group"
          aria-label={`${tp('Počet kusů')}: ${book.title}`}
          class="flex items-center"
        >
          <button
            type="button"
            class={QUANTITY_BUTTON}
            aria-label={tp('Ubrat kus')}
            disabled={count <= 1}
            onclick={() => {
              updateQuantity(book.slug, count - 1)
            }}>−</button
          >
          <output
            class="w-10 text-center text-base text-black lining-nums"
            aria-live="polite"
          >
            {count}
          </output>
          <button
            type="button"
            class={QUANTITY_BUTTON}
            aria-label={tp('Přidat kus')}
            disabled={count >= MAX_COUNT}
            onclick={() => {
              updateQuantity(book.slug, count + 1)
            }}>+</button
          >
        </div>
        <div class="flex flex-col items-end gap-1">
          <p
            class="font-head text-[1.7rem] leading-none font-extrabold text-black lining-nums"
          >
            {formatPrice(total)}
          </p>
          <p class="text-[0.7rem] leading-none text-gray-600 lining-nums">
            {formatPrice(book.price)}
            {tp('za kus')}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="border-(--step) text-(--step-ink) hover:bg-(--step-ink) focus-visible:bg-(--step-ink) absolute top-0 right-0 z-10 flex size-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-white transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--step) motion-reduce:transition-none"
        aria-label={`${tp('Odebrat')}: ${book.title}`}
        onclick={() => {
          removeFromCart(book.slug)
        }}
      >
        <svg
          viewBox="0 0 16 16"
          class="size-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M3 3L13 13M13 3L3 13" />
        </svg>
      </button>
    </li>
  {/each}
</ul>
