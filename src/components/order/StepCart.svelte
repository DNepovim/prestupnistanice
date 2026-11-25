<script lang="ts">
  import 'iconify-icon'

  import { removeFromCart } from '@/stores/cart'
  import { formatPrice } from '@/utils/formatPrice'
  import type { OrderLine } from '@/utils/order/totals'
  import { tp } from '@/utils/tp'

  import ItemMarks from './ItemMarks.svelte'
  import QuantityField from './QuantityField.svelte'

  type Props = {
    lines: OrderLine[]
  }

  const { lines }: Props = $props()
</script>

<ul class="grid auto-rows-fr px-2 pt-3">
  {#each lines as { book, count, total }, index (book.slug)}
    <li
      style={`--c1:${book.color}`}
      class="group/item relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-3 py-4 not-first:border-t not-first:border-dashed not-first:border-gray-300 transition-colors focus-within:bg-[color-mix(in_srgb,var(--c1)_9%,transparent)] hover:bg-[color-mix(in_srgb,var(--c1)_9%,transparent)] min-sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] motion-reduce:transition-none"
    >
      <ItemMarks isFirst={index === 0} isLast={index === lines.length - 1} />
      <img
        src={book.cover}
        alt=""
        width="72"
        class="row-span-2 w-[4.5rem] self-start shadow-[0_0.2rem_0.9rem_rgba(0,0,0,0.18)] min-sm:row-span-1"
      />
      <div class="flex min-w-0 flex-col gap-1 pr-4">
        <h3
          class="font-head text-[1.6rem] leading-[1.05] font-extrabold text-black transition-colors group-focus-within/item:text-[color-mix(in_srgb,var(--c1),black_30%)] group-hover/item:text-[color-mix(in_srgb,var(--c1),black_30%)] motion-reduce:transition-none"
        >
          {tp(book.title)}
        </h3>
        <p class="font-alt text-[0.95rem] text-gray-800 italic">{tp(book.author)}</p>
      </div>
      <div
        class="font-alt col-start-2 flex flex-wrap items-end justify-between gap-x-5 gap-y-2 min-sm:col-start-3 min-sm:h-full min-sm:flex-col min-sm:items-end min-sm:justify-between"
      >
        <QuantityField slug={book.slug} title={book.title} {count} />
        <div class="flex flex-col items-end gap-1">
          <p
            class="font-head text-[2.1rem] leading-none font-extrabold text-black lining-nums"
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
        class="border-gray-300 text-gray-500 hover:border-error hover:bg-error focus-visible:border-error focus-visible:bg-error focus-visible:outline-error absolute top-0 right-0 z-10 flex size-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-white text-[0.8rem] transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
        aria-label={`${tp('Odebrat')}: ${book.title}`}
        onclick={() => {
          removeFromCart(book.slug)
        }}
      >
        <iconify-icon icon="ph:trash" aria-hidden="true"></iconify-icon>
      </button>
    </li>
  {/each}
</ul>
