<script lang="ts">
  import { removeFromCart, updateQuantity } from '@/stores/cart'
  import { formatPrice } from '@/utils/formatPrice'
  import type { OrderLine } from '@/utils/order/totals'
  import { tp } from '@/utils/tp'

  import { TEXT_BUTTON } from './styles'

  type Props = {
    lines: OrderLine[]
  }

  const { lines }: Props = $props()

  const MAX_COUNT = 99

  const QUANTITY_BUTTON =
    'border-brand-first-500 text-brand-first-700 hover:bg-brand-first-50 flex size-9 items-center justify-center border text-lg leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-first-500 disabled:cursor-not-allowed disabled:border-brand-first-300 disabled:text-gray-500 disabled:hover:bg-transparent motion-reduce:transition-none'
</script>

<ul class="flex flex-col">
  {#each lines as { book, count, total } (book.slug)}
    <li
      class="border-brand-first-300/60 grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-dashed py-5 first:border-t-0 min-sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
    >
      <img
        src={book.cover}
        alt=""
        width="64"
        class="row-span-2 w-16 shadow-[0_0.2rem_0.9rem_rgba(0,0,0,0.18)] min-sm:row-span-1"
      />
      <div class="flex min-w-0 flex-col items-start gap-1">
        <h3 class="font-head text-[1.3rem] leading-[1.1] font-extrabold text-black">
          {tp(book.title)}
        </h3>
        <p class="font-alt text-[0.95rem] text-gray-800 italic">{tp(book.author)}</p>
        <button
          type="button"
          class={[TEXT_BUTTON, 'mt-2']}
          onclick={() => {
            removeFromCart(book.slug)
          }}
        >
          {tp('Odebrat')}<span class="sr-only"> {tp(book.title)} {tp('z košíku')}</span>
        </button>
      </div>
      <div
        class="font-alt col-start-2 flex flex-wrap items-center gap-x-5 gap-y-2 min-sm:col-start-3 min-sm:flex-col min-sm:items-end"
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
        <p class="text-[0.75rem] text-gray-700">
          {formatPrice(book.price)}
          {tp('za kus')}
        </p>
        <p
          class="font-head text-[1.3rem] leading-none font-extrabold text-black lining-nums"
        >
          {formatPrice(total)}
        </p>
      </div>
    </li>
  {/each}
</ul>
