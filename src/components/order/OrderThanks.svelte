<script lang="ts">
  import { BANK_ACCOUNT, ORDER_STORAGE_KEY } from '@/configs/order'
  import type { PaymentId } from '@/configs/shipping'
  import { routes } from '@/routes'
  import { formatPrice } from '@/utils/formatPrice'
  import { orderResultSchema, type OrderResult } from '@/utils/order/orderSchema'
  import { tp } from '@/utils/tp'

  import CopyButton from './CopyButton.svelte'
  import PaymentQr from './PaymentQr.svelte'

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

  const PAYMENT_NOTES = {
    prevodem: 'Zásilku odešleme po připsání platby na náš účet.',
    dobirkou: 'Celou částku zaplatíte při převzetí zásilky.',
    hotovost: 'Celou částku zaplatíte v hotovosti při osobním převzetí.',
  } as const satisfies Record<PaymentId, string>

  const LABEL =
    'font-alt text-[0.7rem] leading-none tracking-[0.1em] text-black uppercase'
  const LEADER =
    'border-brand-first-300/60 min-w-2 flex-1 -translate-y-[0.2em] self-end border-b border-dotted'
  const PRICE =
    'font-head text-[0.95rem] font-bold whitespace-nowrap text-black lining-nums'
  const RULE = 'border-brand-first-300/60 border-t border-dashed'
  const LINK =
    'font-alt self-start text-[0.8rem] tracking-[0.1em] text-black uppercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
</script>

{#if result === undefined}
  <div class="flex max-w-[34rem] flex-col items-start gap-5">
    <p class="font-alt text-base leading-[1.5] text-black italic">
      {tp('Děkujeme, že si u nás vybíráte knihy. Podrobnosti objednávky tu už nemáme.')}
    </p>
    <a href={routes.books.list()} class={LINK}>{tp('Naše knihy')}</a>
  </div>
{:else}
  {@const summary = result.summary}
  {@const orderNumber = result.orderNumber}
  {@const isTransfer = summary.payment.id === 'prevodem'}
  <div class="flex flex-col gap-10">
    <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
      <div class="flex flex-col gap-3">
        <p class={LABEL}>{tp('Korektura · schváleno do tisku')}</p>
        <p class="font-alt max-w-[34rem] text-base leading-[1.5] text-black italic">
          {tp(
            'Objednávku jsme přijali. Číslo si poznamenejte, hodí se při platbě i dotazech.',
          )}
        </p>
      </div>
      <div
        class="border-ink-red text-ink-red -rotate-12 animate-rotate-on-load border-2 px-4 py-2 text-center motion-reduce:animate-none"
      >
        <p
          class="font-alt text-[0.7rem] leading-none font-bold tracking-[0.2em] uppercase"
        >
          {tp('Vytištěno')}
        </p>
        <p class="font-head text-[1.8rem] leading-[1.1] font-extrabold lining-nums">
          {orderNumber}
        </p>
        <p class="sr-only">{tp(`Číslo objednávky ${orderNumber}`)}</p>
      </div>
    </div>

    <section aria-labelledby="h-items" class="flex flex-col gap-4">
      <h2 id="h-items" class={LABEL}>{tp('Objednané knihy')}</h2>
      <ul class="flex flex-col">
        {#each summary.items as item (item.slug)}
          <li class={[RULE, 'flex items-center gap-4 py-4']}>
            <img
              src={item.cover}
              alt=""
              width="64"
              class="h-auto w-16 shrink-0 shadow-[0_0.2rem_0.9rem_rgba(0,0,0,0.18)]"
            />
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <p class="font-head text-[1.3rem] leading-[1.1] font-extrabold text-black">
                {tp(item.title)}
              </p>
              <p class="font-alt text-[0.85rem] text-black italic">{tp(item.author)}</p>
              <p class="font-alt text-[0.8rem] text-black lining-nums">
                {tp(`${String(item.count)} × ${formatPrice(item.unitPrice)}`)}
              </p>
            </div>
            <p class={PRICE}>{formatPrice(item.total)}</p>
          </li>
        {/each}
      </ul>
    </section>

    <dl class="font-alt flex max-w-[40rem] flex-col gap-3 text-[0.85rem] text-black">
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-2">
          <dt>{tp('Doprava')}</dt>
          <i class={LEADER} aria-hidden="true"></i>
          <dd class={PRICE}>{formatPrice(summary.delivery.price)}</dd>
        </div>
        <p class="text-[0.8rem]">{tp(summary.delivery.name)}</p>
        {#if summary.delivery.handover !== undefined}
          <p class="text-[0.8rem]">{tp(summary.delivery.handover)}</p>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-2">
          <dt>{tp('Platba')}</dt>
          <i class={LEADER} aria-hidden="true"></i>
          <dd class={PRICE}>{formatPrice(summary.payment.price)}</dd>
        </div>
        <p class="text-[0.8rem]">{tp(summary.payment.name)}</p>
      </div>
      <div class="mt-3 flex items-baseline gap-2 font-bold">
        <dt>{tp('Celkem')}</dt>
        <i class={LEADER} aria-hidden="true"></i>
        <dd class="font-head text-[1.5rem] font-extrabold whitespace-nowrap lining-nums">
          {formatPrice(summary.total)}
        </dd>
      </div>
    </dl>

    <section aria-labelledby="h-payment" class="flex flex-col gap-4">
      <h2 id="h-payment" class={LABEL}>{tp('Jak zaplatit')}</h2>
      <p class="font-display text-[0.95rem] leading-[1.5] text-black">
        {tp(PAYMENT_NOTES[summary.payment.id])}
      </p>
      {#if isTransfer}
        <div class="flex flex-wrap items-start gap-x-10 gap-y-6">
          <dl class="flex min-w-0 flex-1 basis-80 flex-col">
            <div class={[RULE, 'flex flex-wrap items-center justify-between gap-3 py-3']}>
              <div class="flex flex-col gap-1">
                <dt class={LABEL}>{tp('Číslo účtu')}</dt>
                <dd class="font-head text-[1.3rem] font-extrabold text-black lining-nums">
                  {BANK_ACCOUNT}
                </dd>
              </div>
              <CopyButton value={BANK_ACCOUNT} label="číslo účtu" />
            </div>
            <div class={[RULE, 'flex flex-col gap-1 py-3']}>
              <dt class={LABEL}>{tp('Částka k úhradě')}</dt>
              <dd class="font-head text-[1.3rem] font-extrabold text-black lining-nums">
                {formatPrice(summary.total)}
              </dd>
            </div>
            <div
              class={[
                RULE,
                'border-brand-first-300/60 border-b flex flex-wrap items-center justify-between gap-3 py-3',
              ]}
            >
              <div class="flex flex-col gap-1">
                <dt class={LABEL}>{tp('Zpráva pro příjemce a číslo objednávky')}</dt>
                <dd class="font-head text-[1.3rem] font-extrabold text-black lining-nums">
                  {orderNumber}
                </dd>
              </div>
              <CopyButton value={orderNumber} label="číslo objednávky" />
            </div>
          </dl>
          <PaymentQr
            payload={`${BANK_ACCOUNT}|${String(summary.total)}|${orderNumber}`}
          />
        </div>
      {/if}
    </section>

    <a href={routes.books.list()} class={LINK}>{tp('Zpět na knihy')}</a>
  </div>
{/if}
