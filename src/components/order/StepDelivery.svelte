<script lang="ts">
  import 'iconify-icon'

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
    type PickupId,
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

  import Reveal from './Reveal.svelte'
  import {
    ERROR_BOX,
    FIELD_LABEL,
    SMALL_OUTLINE_BUTTON,
    SMALL_PRIMARY_BUTTON,
    TEXT_BUTTON,
  } from './styles'

  type Props = {
    errorOf: (key: FieldKey) => string | undefined
  }

  const { errorOf }: Props = $props()

  const OPTION_ROW =
    'border-(--step)/40 has-checked:bg-[color-mix(in_srgb,var(--step),white_90%)] has-focus-visible:outline-2 has-focus-visible:outline-(--step) grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-3 border-t border-dashed px-2 py-3 transition-colors first:border-t-0 has-disabled:cursor-not-allowed has-disabled:text-gray-600 motion-reduce:transition-none'

  const PICKUP_TILE =
    'font-alt group/tile border-(--tile) has-checked:bg-[color-mix(in_srgb,var(--tile),white_88%)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--tile) flex cursor-pointer items-center gap-2 border bg-white px-3 py-2 text-base text-gray-900 transition-colors motion-reduce:transition-none'

  const PICKUP_COLORS = {
    'praha-kralin': '[--tile:var(--color-ink-cyan)]',
    melnik: '[--tile:var(--color-ink-magenta)]',
    revnice: '[--tile:var(--color-ink-blue)]',
  } as const satisfies Record<PickupId, string>

  let dialogEl = $state<HTMLDialogElement>()
  let iframeEl = $state<HTMLIFrameElement>()
  let isWidgetOpen = $state(false)
  let isWidgetLoaded = $state(false)

  const openWidget = () => {
    isWidgetLoaded = false
    isWidgetOpen = true
    dialogEl?.showModal()
  }

  const handleMessage = (event: MessageEvent) => {
    if (
      !isWidgetOpen ||
      event.origin !== BALIKOVNA_WIDGET_ORIGIN ||
      event.source !== (iframeEl?.contentWindow ?? null)
    ) {
      return
    }
    const point = parseBalikovnaMessage(event.data)
    if (point === undefined) {
      return
    }
    setBalikovnaPoint(point)
    dialogEl?.close()
  }

  const deliveryError = $derived(
    errorOf('delivery') ?? errorOf('pickupLocation') ?? errorOf('point'),
  )

  const priceLabel = (price: number) => (price === 0 ? tp('zdarma') : formatPrice(price))
</script>

<svelte:window onmessage={handleMessage} />

<div class="flex flex-col">
  <fieldset
    id="f-delivery"
    tabindex="-1"
    class="flex flex-col outline-none"
    aria-describedby={deliveryError === undefined ? undefined : 'e-delivery'}
  >
    <legend class={[FIELD_LABEL, 'mb-3']}>{tp('Způsob doručení')}</legend>
    <Reveal open={deliveryError !== undefined}>
      <p id="e-delivery" role="alert" class={[ERROR_BOX, 'mb-3']}>
        {tp(deliveryError ?? '')}
      </p>
    </Reveal>
    {#each DELIVERY_IDS as id (id)}
      {@const option = DELIVERY_OPTIONS[id]}
      <label class={OPTION_ROW}>
        <input
          type="radio"
          name="delivery"
          value={id}
          checked={$order.delivery === id}
          class="size-4 translate-y-0.5 accent-(--step)"
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
      {#if id === 'balikovna'}
        <Reveal open={$order.delivery === 'balikovna'}>
          <div class="flex items-center gap-4 py-4 pl-9">
            <div class="flex min-w-0 flex-1 items-start gap-3">
              <iconify-icon
                icon="ph:map-pin-fill"
                class="text-ink-blue mt-0.5 shrink-0 text-2xl"
                aria-hidden="true"
              ></iconify-icon>
              <p
                id="f-point"
                tabindex="-1"
                class="font-alt flex min-w-0 flex-col outline-none"
              >
                {#if $order.balikovnaPoint}
                  <span class="text-base font-bold text-gray-900">
                    {tp($order.balikovnaPoint.name)}
                  </span>
                  {#if $order.balikovnaPoint.address !== undefined}
                    <span class="text-[0.85rem] leading-snug text-gray-700">
                      {tp($order.balikovnaPoint.address)}
                    </span>
                  {/if}
                {:else}
                  <span class="text-[0.9rem] text-gray-700">
                    {tp('Výdejna zatím není vybrána.')}
                  </span>
                {/if}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                class={[
                  $order.balikovnaPoint ? SMALL_OUTLINE_BUTTON : SMALL_PRIMARY_BUTTON,
                  'shrink-0',
                ]}
                aria-haspopup="dialog"
                onclick={openWidget}
              >
                {$order.balikovnaPoint
                  ? tp('Změnit výdejní místo')
                  : tp('Vybrat výdejnu')}
              </button>
              {#if $order.balikovnaPoint?.detailUrl !== undefined}
                <a
                  href={$order.balikovnaPoint.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={TEXT_BUTTON}
                >
                  {tp('Detail výdejního místa')}
                  <span class="sr-only">({tp('otevře se v novém okně')})</span>
                </a>
              {/if}
            </div>
          </div>
        </Reveal>
      {/if}
      {#if id === 'osobni-prevzeti'}
        <Reveal open={$order.delivery === 'osobni-prevzeti'}>
          <fieldset
            id="f-pickupLocation"
            tabindex="-1"
            class="flex flex-col gap-3 py-4 pl-9 outline-none"
          >
            <legend class="sr-only">{tp('Místo převzetí')}</legend>
            <div class="grid gap-3 min-xs:grid-cols-3">
              {#each PICKUP_IDS as pickupId (pickupId)}
                <label class={[PICKUP_TILE, PICKUP_COLORS[pickupId]]}>
                  <input
                    type="radio"
                    name="pickupLocation"
                    value={pickupId}
                    checked={$order.pickupLocation === pickupId}
                    class="sr-only"
                    onchange={() => {
                      setPickupLocation(pickupId)
                    }}
                  />
                  <iconify-icon
                    icon="ph:map-pin"
                    class="shrink-0 text-xl text-(--tile) group-has-checked/tile:hidden"
                    aria-hidden="true"
                  ></iconify-icon>
                  <iconify-icon
                    icon="ph:map-pin-fill"
                    class="hidden shrink-0 text-xl text-(--tile) group-has-checked/tile:block"
                    aria-hidden="true"
                  ></iconify-icon>
                  <span class="font-bold">{tp(PICKUP_LOCATIONS[pickupId])}</span>
                </label>
              {/each}
            </div>
            <p class="font-alt text-[0.8rem] leading-snug text-gray-700 italic">
              {tp('Na termínu předání se domluvíme po odeslání objednávky.')}
            </p>
          </fieldset>
        </Reveal>
      {/if}
    {/each}
  </fieldset>

  <fieldset
    id="f-payment"
    tabindex="-1"
    class="mt-10 flex flex-col outline-none"
    aria-describedby={errorOf('payment') === undefined ? undefined : 'e-payment'}
  >
    <legend class={[FIELD_LABEL, 'mb-3']}>{tp('Způsob platby')}</legend>
    <Reveal open={errorOf('payment') !== undefined}>
      <p id="e-payment" role="alert" class={[ERROR_BOX, 'mb-3']}>
        {tp(errorOf('payment') ?? '')}
      </p>
    </Reveal>
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
          class="size-4 translate-y-0.5 accent-(--step)"
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
  </fieldset>
</div>

<dialog
  bind:this={dialogEl}
  aria-labelledby="balikovna-title"
  class="border-(--step) m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-visible border bg-white p-0 text-gray-900 backdrop:bg-black/50"
  onclose={() => {
    isWidgetOpen = false
  }}
>
  <button
    type="button"
    class="border-(--step) text-(--step-ink) hover:bg-(--step-ink) focus-visible:bg-(--step-ink) absolute top-0 right-0 z-10 flex size-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-white transition-colors hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--step) motion-reduce:transition-none"
    aria-label={tp('Zavřít')}
    onclick={() => {
      dialogEl?.close()
    }}
  >
    <svg
      viewBox="0 0 16 16"
      class="size-3"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <path d="M3 3L13 13M13 3L3 13" />
    </svg>
  </button>
  <h2
    id="balikovna-title"
    class="font-head px-4 py-3 text-xl font-extrabold text-(--step)"
  >
    {tp('Výběr výdejního místa Balíkovny')}
  </h2>
  {#if isWidgetOpen}
    <div
      class="border-(--step)/40 relative h-[min(36rem,calc(100svh-8rem))] w-full border-t bg-white"
    >
      <iframe
        bind:this={iframeEl}
        src={BALIKOVNA_WIDGET_URL}
        title={tp('Mapa výdejních míst Balíkovny')}
        class={[
          'block size-full transition-opacity duration-300 motion-reduce:transition-none',
          isWidgetLoaded ? 'opacity-100' : 'opacity-0',
        ]}
        onload={() => {
          isWidgetLoaded = true
        }}
      ></iframe>
      {#if !isWidgetLoaded}
        <div class="absolute inset-0 flex bg-white max-md:flex-col" role="status">
          <span class="sr-only">{tp('Načítám výdejní místa…')}</span>
          <div
            aria-hidden="true"
            class="flex w-full flex-col gap-3 p-4 min-md:w-[40%] motion-safe:animate-pulse"
          >
            <div class="h-10 bg-gray-200"></div>
            {#each [0, 1, 2, 3, 4] as row (row)}
              <div
                class="flex flex-col gap-2 border-b border-dashed border-gray-300 pb-3"
              >
                <div class="h-4 w-3/4 bg-gray-200"></div>
                <div class="h-3 w-1/2 bg-gray-100"></div>
              </div>
            {/each}
          </div>
          <div
            aria-hidden="true"
            class="relative min-h-40 flex-1 bg-gray-100 motion-safe:animate-pulse"
          >
            <iconify-icon
              icon="ph:map-pin-fill"
              class="text-ink-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
            ></iconify-icon>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</dialog>
