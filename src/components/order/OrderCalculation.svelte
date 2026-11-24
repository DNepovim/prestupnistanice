<script lang="ts">
  import { DELIVERY_OPTIONS, PAYMENT_OPTIONS, PICKUP_LOCATIONS } from '@/configs/shipping'
  import { order, type OrderStep } from '@/stores/order'
  import { formatPrice } from '@/utils/formatPrice'
  import type { OrderLine, OrderTotals } from '@/utils/order/totals'
  import type { FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { FIELD_LABELS } from './fieldLabels'
  import { STEP_VARS } from './stepVars'
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
    step: OrderStep
    onsubmit: () => void
    onfix: (key: FieldKey) => void
  }

  const { lines, totals, issues, isReady, step, onsubmit, onfix }: Props = $props()

  const COLOR_TRANSITION = 'transition-colors duration-500 motion-reduce:transition-none'

  const deliveryName = $derived(
    $order.delivery === null
      ? 'Doprava nevybrána'
      : DELIVERY_OPTIONS[$order.delivery].name,
  )
  const paymentName = $derived(
    $order.payment === null ? 'Platba nevybrána' : PAYMENT_OPTIONS[$order.payment].name,
  )
  const handover = $derived(
    $order.pickupLocation === null
      ? $order.balikovnaPoint?.name
      : PICKUP_LOCATIONS[$order.pickupLocation],
  )
  const customer = $derived($order.customer)
  const contactLines = $derived(
    [
      `${customer.firstname} ${customer.surname}`.trim(),
      customer.email,
      customer.phone,
      [customer.street, `${customer.postcode} ${customer.city}`.trim()]
        .filter((part) => part.trim() !== '')
        .join(', '),
      customer.isCompany
        ? [customer.companyName, customer.ico === '' ? '' : `IČO ${customer.ico}`]
            .filter((part) => part !== '')
            .join(', ')
        : '',
    ].filter((line) => line !== ''),
  )
  const leader =
    'border-(--step)/60 min-w-2 flex-1 -translate-y-[0.2em] self-end border-b border-dotted'
</script>

<aside
  aria-labelledby="h-summary"
  class={[
    'flex flex-col gap-5 border-t-2 border-(--step) pt-6 min-lg:sticky min-lg:top-6 min-lg:self-start min-lg:border-t-0 min-lg:border-l min-lg:pt-0 min-lg:pl-6',
    COLOR_TRANSITION,
    STEP_VARS[step],
  ]}
>
  <h2
    id="h-summary"
    class={[
      'font-head text-[1.5rem] leading-[1.05] font-extrabold text-(--step)',
      COLOR_TRANSITION,
    ]}
  >
    {tp('Souhrn')}
  </h2>

  <ul class="font-alt flex flex-col gap-2 text-[0.8rem] leading-[1.3]">
    {#each lines as { book, count, total } (book.slug)}
      <li class="flex items-baseline gap-2">
        <span class="min-w-0">{tp(book.title)} × {count}</span>
        <i class={[leader, COLOR_TRANSITION]} aria-hidden="true"></i>
        <b class="font-head text-[0.9rem] whitespace-nowrap lining-nums"
          >{formatPrice(total)}</b
        >
      </li>
    {/each}
  </ul>

  <dl
    class={[
      'font-alt flex flex-col gap-2 border-t border-dashed border-(--step)/60 pt-4 text-[0.8rem] leading-[1.3]',
      COLOR_TRANSITION,
    ]}
  >
    <div class="flex items-baseline gap-2">
      <dt class="min-w-0">{tp(deliveryName)}</dt>
      <i class={[leader, COLOR_TRANSITION]} aria-hidden="true"></i>
      <dd class="font-head text-[0.9rem] font-bold whitespace-nowrap lining-nums">
        {formatPrice(totals.deliveryPrice)}
      </dd>
    </div>
    {#if handover !== undefined}
      <p class="text-[0.75rem] text-gray-700">{tp(handover)}</p>
    {/if}
    <div class="flex items-baseline gap-2">
      <dt class="min-w-0">{tp(paymentName)}</dt>
      <i class={[leader, COLOR_TRANSITION]} aria-hidden="true"></i>
      <dd class="font-head text-[0.9rem] font-bold whitespace-nowrap lining-nums">
        {formatPrice(totals.paymentPrice)}
      </dd>
    </div>
    <div
      class={[
        'mt-2 flex items-baseline gap-2 border-t border-(--step) pt-3 text-[0.95rem] font-bold',
        COLOR_TRANSITION,
      ]}
    >
      <dt class="min-w-0">{tp('Celkem k úhradě')}</dt>
      <i class={[leader, COLOR_TRANSITION]} aria-hidden="true"></i>
      <dd
        class="font-head text-[1.4rem] font-extrabold whitespace-nowrap text-black lining-nums"
        aria-live="polite"
      >
        {formatPrice(totals.total)}
      </dd>
    </div>
  </dl>

  {#if contactLines.length > 0}
    <p
      class="font-display border-t border-dashed border-(--step)/60 pt-4 text-[0.78rem] leading-[1.5] text-gray-800"
    >
      {#each contactLines as line (line)}
        {tp(line)}<br />
      {/each}
    </p>
  {/if}

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

  <button
    type="button"
    class={[PRIMARY_BUTTON, COLOR_TRANSITION, 'w-full']}
    onclick={onsubmit}
  >
    {tp('Odeslat objednávku')}
  </button>
  {#if isReady}
    <p role="status" class="font-alt text-(--step-ink) text-[0.8rem] leading-snug">
      {tp('Objednávka je kompletně vyplněná a připravená k odeslání.')}
    </p>
  {/if}
</aside>
