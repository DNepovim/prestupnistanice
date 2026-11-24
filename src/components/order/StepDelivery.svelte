<script lang="ts">
  import {
    BALIKOVNA_WIDGET_ORIGIN,
    BALIKOVNA_WIDGET_URL,
    DELIVERY_IDS,
    DELIVERY_OPTIONS,
    isPaymentAvailable,
    PAYMENT_IDS,
    PAYMENT_OPTIONS,
    PICKUP_IDS,
    PICKUP_LOCATIONS,
  } from '@/configs/shipping'
  import {
    order,
    setBalikovnaPoint,
    setDelivery,
    setPayment,
    setPickupLocation,
  } from '@/stores/order'
  import { formatPrice } from '@/utils/formatPrice'
  import { parseBalikovnaMessage } from '@/utils/order/balikovna'
  import type { FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { FIELD_ERROR, FIELD_LABEL, PRIMARY_BUTTON } from './styles'

  type Props = {
    errorOf: (key: FieldKey) => string | undefined
  }

  const { errorOf }: Props = $props()

  const OPTION_ROW =
    'border-brand-first-300/60 has-checked:bg-brand-first-50 has-focus-visible:outline-2 has-focus-visible:outline-brand-first-500 grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-dashed py-3 first:border-t-0 has-disabled:cursor-not-allowed has-disabled:text-gray-600'

  let isWidgetOpen = $state(false)

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== BALIKOVNA_WIDGET_ORIGIN) {
      return
    }
    const point = parseBalikovnaMessage(event.data)
    if (point === undefined) {
      return
    }
    setBalikovnaPoint(point)
    isWidgetOpen = false
  }

  const priceLabel = (price: number) => (price === 0 ? tp('zdarma') : formatPrice(price))
</script>

<svelte:window onmessage={handleMessage} />

<div class="flex flex-col gap-10">
  <fieldset
    id="f-delivery"
    tabindex="-1"
    class="flex flex-col outline-none"
    aria-describedby={errorOf('delivery') === undefined ? undefined : 'e-delivery'}
  >
    <legend class={[FIELD_LABEL, 'mb-3']}>{tp('Způsob doručení')}</legend>
    {#each DELIVERY_IDS as id (id)}
      {@const option = DELIVERY_OPTIONS[id]}
      <label class={OPTION_ROW}>
        <input
          type="radio"
          name="delivery"
          value={id}
          checked={$order.delivery === id}
          class="accent-brand-first-700 size-4 translate-y-0.5"
          onchange={() => {
            setDelivery(id)
          }}
        />
        <span class="flex flex-col gap-1">
          <span class="font-alt text-base font-semibold text-gray-900"
            >{tp(option.name)}</span
          >
          <span class="text-[0.8rem] leading-snug text-gray-700"
            >{tp(option.description)}</span
          >
        </span>
        <span class="font-head text-lg font-extrabold text-black lining-nums">
          {priceLabel(option.price)}
        </span>
      </label>
      {#if id === 'balikovna' && $order.delivery === 'balikovna'}
        <div class="flex flex-col gap-3 pb-4 pl-7">
          <p class="font-alt text-[0.9rem] text-gray-900">
            {#if $order.balikovnaPoint}
              {tp($order.balikovnaPoint.name)}
            {:else}
              {tp('Výdejna zatím není vybrána.')}
            {/if}
          </p>
          <button
            id="f-point"
            type="button"
            class={[PRIMARY_BUTTON, 'self-start']}
            aria-expanded={isWidgetOpen}
            onclick={() => {
              isWidgetOpen = !isWidgetOpen
            }}
          >
            {isWidgetOpen
              ? tp('Zavřít mapu')
              : $order.balikovnaPoint
                ? tp('Změnit výdejnu')
                : tp('Vybrat výdejnu')}
          </button>
          {#if errorOf('point') !== undefined}
            <p class={FIELD_ERROR}>{tp(errorOf('point') ?? '')}</p>
          {/if}
          {#if isWidgetOpen}
            <iframe
              src={BALIKOVNA_WIDGET_URL}
              title={tp('Výběr výdejního místa Balíkovny')}
              class="border-brand-first-500 h-[32rem] w-full border bg-white"
            ></iframe>
          {/if}
        </div>
      {/if}
      {#if id === 'osobni-prevzeti' && $order.delivery === 'osobni-prevzeti'}
        <fieldset
          id="f-pickupLocation"
          tabindex="-1"
          class="flex flex-col gap-1 pb-4 pl-7 outline-none"
        >
          <legend class={[FIELD_LABEL, 'mb-2']}>{tp('Místo převzetí')}</legend>
          {#each PICKUP_IDS as pickupId (pickupId)}
            <label
              class="font-alt flex cursor-pointer items-center gap-3 py-1 text-base text-gray-900"
            >
              <input
                type="radio"
                name="pickupLocation"
                value={pickupId}
                checked={$order.pickupLocation === pickupId}
                class="accent-brand-first-700 size-4"
                onchange={() => {
                  setPickupLocation(pickupId)
                }}
              />
              {tp(PICKUP_LOCATIONS[pickupId])}
            </label>
          {/each}
          {#if errorOf('pickupLocation') !== undefined}
            <p class={FIELD_ERROR}>{tp(errorOf('pickupLocation') ?? '')}</p>
          {/if}
        </fieldset>
      {/if}
    {/each}
    {#if errorOf('delivery') !== undefined}
      <p id="e-delivery" class={[FIELD_ERROR, 'mt-2']}>{tp(errorOf('delivery') ?? '')}</p>
    {/if}
  </fieldset>

  <fieldset
    id="f-payment"
    tabindex="-1"
    class="flex flex-col outline-none"
    aria-describedby={errorOf('payment') === undefined ? undefined : 'e-payment'}
  >
    <legend class={[FIELD_LABEL, 'mb-3']}>{tp('Způsob platby')}</legend>
    {#if $order.delivery === null}
      <p class="font-alt mb-3 text-[0.8rem] leading-snug text-gray-700">
        {tp('Nabídka plateb závisí na dopravě, nejdřív proto vyberte způsob doručení.')}
      </p>
    {/if}
    {#each PAYMENT_IDS as id (id)}
      {@const option = PAYMENT_OPTIONS[id]}
      {@const isAvailable = isPaymentAvailable(id, $order.delivery)}
      <label class={OPTION_ROW}>
        <input
          type="radio"
          name="payment"
          value={id}
          checked={$order.payment === id}
          disabled={!isAvailable}
          class="accent-brand-first-700 size-4 translate-y-0.5"
          onchange={() => {
            setPayment(id)
          }}
        />
        <span class="flex flex-col gap-1">
          <span class="font-alt text-base font-semibold">{tp(option.name)}</span>
          <span class="text-[0.8rem] leading-snug text-gray-700">
            {tp(
              isAvailable || $order.delivery === null
                ? option.description
                : option.unavailableNote,
            )}
          </span>
        </span>
        <span class="font-head text-lg font-extrabold lining-nums">
          {priceLabel(option.price)}
        </span>
      </label>
    {/each}
    {#if errorOf('payment') !== undefined}
      <p id="e-payment" class={[FIELD_ERROR, 'mt-2']}>{tp(errorOf('payment') ?? '')}</p>
    {/if}
  </fieldset>
</div>
