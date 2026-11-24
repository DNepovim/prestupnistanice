<script lang="ts">
  import { DELIVERY_OPTIONS, PAYMENT_OPTIONS } from '@/configs/shipping'
  import { order } from '@/stores/order'
  import { formatPrice } from '@/utils/formatPrice'
  import type { OrderLine, OrderTotals } from '@/utils/order/totals'
  import type { FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { FIELD_LABELS } from './fieldLabels'
  import { PRIMARY_BUTTON, TEXT_BUTTON } from './styles'

  type Issue = {
    key: FieldKey
    message: string
  }

  type Props = {
    lines: OrderLine[]
    totals: OrderTotals
    issues: Issue[]
    isReady: boolean
    onsubmit: () => void
    onfix: (key: FieldKey) => void
  }

  const { lines, totals, issues, isReady, onsubmit, onfix }: Props = $props()

  const deliveryName = $derived(
    $order.delivery === null
      ? 'Doprava nevybrána'
      : DELIVERY_OPTIONS[$order.delivery].name,
  )
  const paymentName = $derived(
    $order.payment === null ? 'Platba nevybrána' : PAYMENT_OPTIONS[$order.payment].name,
  )
  const leader =
    'border-brand-first-300 min-w-2 flex-1 -translate-y-[0.2em] self-end border-b border-dotted'
</script>

<aside
  aria-labelledby="h-calculation"
  class="border-brand-first-500 flex flex-col gap-5 border-t-2 pt-6 min-lg:sticky min-lg:top-6 min-lg:self-start min-lg:border-t-0 min-lg:border-l min-lg:pt-0 min-lg:pl-6"
>
  <div>
    <p
      class="font-alt text-brand-first-700 mb-2 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
    >
      {tp('Souhrn')}
    </p>
    <h2
      id="h-calculation"
      class="font-head text-[1.5rem] leading-[1.05] font-extrabold text-black"
    >
      {tp('Kalkulace zakázky')}
    </h2>
  </div>

  <ul class="font-alt flex flex-col gap-2 text-[0.8rem] leading-[1.3]">
    {#each lines as { book, count, total } (book.slug)}
      <li class="flex items-baseline gap-2">
        <span class="min-w-0">{tp(book.title)} × {count}</span>
        <i class={leader} aria-hidden="true"></i>
        <b class="font-head text-[0.9rem] whitespace-nowrap lining-nums"
          >{formatPrice(total)}</b
        >
      </li>
    {/each}
  </ul>

  <dl
    class="font-alt border-brand-first-300/60 flex flex-col gap-2 border-t border-dashed pt-4 text-[0.8rem] leading-[1.3]"
  >
    <div class="flex items-baseline gap-2">
      <dt class="min-w-0">{tp(deliveryName)}</dt>
      <i class={leader} aria-hidden="true"></i>
      <dd class="font-head text-[0.9rem] font-bold whitespace-nowrap lining-nums">
        {formatPrice(totals.deliveryPrice)}
      </dd>
    </div>
    <div class="flex items-baseline gap-2">
      <dt class="min-w-0">{tp(paymentName)}</dt>
      <i class={leader} aria-hidden="true"></i>
      <dd class="font-head text-[0.9rem] font-bold whitespace-nowrap lining-nums">
        {formatPrice(totals.paymentPrice)}
      </dd>
    </div>
    <div
      class="border-brand-first-500 mt-2 flex items-baseline gap-2 border-t pt-3 text-[0.95rem] font-bold"
    >
      <dt class="min-w-0">{tp('Celkem k úhradě')}</dt>
      <i class={leader} aria-hidden="true"></i>
      <dd
        class="font-head text-[1.4rem] font-extrabold whitespace-nowrap text-black lining-nums"
        aria-live="polite"
      >
        {formatPrice(totals.total)}
      </dd>
    </div>
  </dl>

  {#if issues.length > 0}
    <div role="alert" class="border-error border-l-2 pl-3">
      <p
        class="font-alt text-error mb-2 text-[0.7rem] leading-none font-bold tracking-[0.1em] uppercase"
      >
        {tp('K opravě')} ({issues.length})
      </p>
      <ul class="flex flex-col gap-1.5">
        {#each issues as issue (issue.key)}
          <li>
            <button
              type="button"
              class={[TEXT_BUTTON, 'text-left']}
              onclick={() => {
                onfix(issue.key)
              }}
            >
              {tp(FIELD_LABELS[issue.key])}: {tp(issue.message)}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <button type="button" class={[PRIMARY_BUTTON, 'w-full']} onclick={onsubmit}>
    {tp('Odeslat objednávku')}
  </button>
  {#if isReady}
    <p role="status" class="font-alt text-brand-first-700 text-[0.8rem] leading-snug">
      {tp('Objednávka je kompletně vyplněná a připravená k odeslání.')}
    </p>
  {/if}
</aside>
