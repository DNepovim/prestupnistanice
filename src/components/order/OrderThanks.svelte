<script lang="ts">
  import { BANK_ACCOUNT, ORDER_STORAGE_KEY } from '@/configs/order'
  import type { PaymentId } from '@/configs/shipping'
  import { routes } from '@/routes'
  import { formatPrice } from '@/utils/formatPrice'
  import { orderResultSchema, type OrderResult } from '@/utils/order/orderSchema'
  import { tp } from '@/utils/tp'

  const readResult = (): OrderResult | undefined => {
    try {
      const parsed = orderResultSchema.safeParse(
        JSON.parse(window.sessionStorage.getItem(ORDER_STORAGE_KEY) ?? 'null'),
      )
      return parsed.success ? parsed.data : undefined
    } catch {
      return undefined
    }
  }

  const result = readResult()

  const PAYMENT_INSTRUCTIONS = {
    prevodem: (total, orderNumber) =>
      `Zaplaťte ${formatPrice(total)} převodem na účet ${BANK_ACCOUNT}. Jako variabilní symbol nebo zprávu pro příjemce uveďte číslo objednávky ${orderNumber}. Zásilku odešleme po připsání platby.`,
    dobirkou: (total) => `Částku ${formatPrice(total)} zaplatíte při převzetí zásilky.`,
    hotovost: (total) =>
      `Částku ${formatPrice(total)} zaplatíte v hotovosti při osobním převzetí.`,
  } as const satisfies Record<PaymentId, (total: number, orderNumber: string) => string>

  const instructions =
    result === undefined
      ? undefined
      : PAYMENT_INSTRUCTIONS[result.summary.payment.id](
          result.summary.total,
          result.orderNumber,
        )

  const LABEL =
    'font-alt text-brand-first-700 text-[0.7rem] leading-none tracking-[0.1em] uppercase'
  const LEADER =
    'border-brand-first-500/60 min-w-2 flex-1 -translate-y-[0.2em] self-end border-b border-dotted'
  const PRICE = 'font-head text-[0.95rem] font-bold whitespace-nowrap lining-nums'
</script>

{#if result === undefined}
  <div class="flex flex-col items-start gap-5">
    <p class="font-alt max-w-[34rem] text-base leading-[1.5] text-gray-800 italic">
      {tp('Děkujeme, že si u nás vybíráte knihy. Podrobnosti objednávky tu už nemáme.')}
    </p>
    <a
      href={routes.books.list()}
      class="font-alt text-brand-first-700 text-[0.8rem] tracking-[0.1em] uppercase underline underline-offset-4"
    >
      {tp('Naše knihy')}
    </a>
  </div>
{:else}
  {@const summary = result.summary}
  {@const orderNumber = result.orderNumber}
  <div class="flex max-w-[40rem] flex-col gap-8">
    <div class="flex flex-col gap-2">
      <p class={LABEL}>{tp('Číslo objednávky')}</p>
      <p
        class="font-head text-brand-first-500 text-[2.2rem] leading-none font-extrabold lining-nums"
      >
        {orderNumber}
      </p>
      <p class="font-alt text-base leading-[1.5] text-gray-800 italic">
        {tp(
          'Objednávku jsme přijali. Číslo si poznamenejte, hodí se při platbě i dotazech.',
        )}
      </p>
    </div>

    <section aria-labelledby="h-items" class="flex flex-col gap-3">
      <h2 id="h-items" class={LABEL}>{tp('Objednané knihy')}</h2>
      <ul class="flex flex-col gap-2">
        {#each summary.items as item (item.slug)}
          <li class="flex items-baseline gap-2">
            <span class="font-display min-w-0 text-[0.9rem]">
              {tp(item.title)}{item.count > 1 ? ` × ${String(item.count)}` : ''}
            </span>
            <i class={LEADER} aria-hidden="true"></i>
            <span class={PRICE}>{formatPrice(item.total)}</span>
          </li>
        {/each}
      </ul>
    </section>

    <dl class="font-alt flex flex-col gap-3 text-[0.85rem]">
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-2">
          <dt>{tp('Doprava')}</dt>
          <i class={LEADER} aria-hidden="true"></i>
          <dd class={PRICE}>{formatPrice(summary.delivery.price)}</dd>
        </div>
        <p class="text-[0.78rem] text-gray-700">{tp(summary.delivery.name)}</p>
        {#if summary.delivery.handover !== undefined}
          <p class="text-[0.78rem] text-gray-700">{tp(summary.delivery.handover)}</p>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-2">
          <dt>{tp('Platba')}</dt>
          <i class={LEADER} aria-hidden="true"></i>
          <dd class={PRICE}>{formatPrice(summary.payment.price)}</dd>
        </div>
        <p class="text-[0.78rem] text-gray-700">{tp(summary.payment.name)}</p>
      </div>
      <div class="mt-3 flex items-baseline gap-2 font-bold">
        <dt>{tp('Celkem')}</dt>
        <i class={LEADER} aria-hidden="true"></i>
        <dd class="font-head text-[1.4rem] font-extrabold whitespace-nowrap lining-nums">
          {formatPrice(summary.total)}
        </dd>
      </div>
    </dl>

    {#if instructions !== undefined}
      <section aria-labelledby="h-payment" class="flex flex-col gap-2">
        <h2 id="h-payment" class={LABEL}>{tp('Jak zaplatit')}</h2>
        <p class="font-display text-[0.95rem] leading-[1.5] text-gray-900">
          {tp(instructions)}
        </p>
      </section>
    {/if}

    <a
      href={routes.books.list()}
      class="font-alt text-brand-first-700 self-start text-[0.8rem] tracking-[0.1em] uppercase underline underline-offset-4"
    >
      {tp('Zpět na knihy')}
    </a>
  </div>
{/if}
