<script lang="ts">
  import { tick } from 'svelte'

  import { cart } from '@/stores/cart'
  import { order, setStep, type OrderStep } from '@/stores/order'
  import type { CartIndex } from '@/utils/cart/types'
  import { getOrderLines, getOrderTotals } from '@/utils/order/totals'
  import {
    FIELD_ORDER,
    FIELD_STEPS,
    getFirstErrorStep,
    validateOrder,
    type FieldKey,
  } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { STEP_TITLES } from './fieldLabels'
  import OrderCalculation from './OrderCalculation.svelte'
  import OrderEmpty from './OrderEmpty.svelte'
  import OrderStepper from './OrderStepper.svelte'
  import StepCart from './StepCart.svelte'
  import StepCustomer from './StepCustomer.svelte'
  import StepDelivery from './StepDelivery.svelte'
  import StepSummary from './StepSummary.svelte'
  import { PRIMARY_BUTTON, STEP_HEADING, TEXT_BUTTON } from './styles'

  type Props = {
    books: CartIndex
  }

  const { books }: Props = $props()

  const NEXT_STEP = { 1: 2, 2: 3, 3: 4, 4: 4 } as const satisfies Record<
    OrderStep,
    OrderStep
  >
  const PREVIOUS_STEP = { 1: 1, 2: 1, 3: 2, 4: 3 } as const satisfies Record<
    OrderStep,
    OrderStep
  >
  const NEXT_LABELS = {
    1: 'Pokračovat k dopravě',
    2: 'Pokračovat k údajům',
    3: 'Ke shrnutí',
    4: '',
  } as const satisfies Record<OrderStep, string>

  let heading = $state<HTMLHeadingElement>()
  let touched = $state<FieldKey[]>([])
  let showAll = $state(false)
  let isReady = $state(false)

  const lines = $derived(getOrderLines($cart, books))
  const errors = $derived(validateOrder($order, lines.length))
  const totals = $derived(getOrderTotals(lines, $order))
  const isStepValid = (step: OrderStep) =>
    FIELD_ORDER.every((key) => FIELD_STEPS[key] !== step || errors[key] === undefined)
  const reachable = $derived<OrderStep>(
    !isStepValid(1) ? 1 : !isStepValid(2) ? 2 : !isStepValid(3) ? 3 : 4,
  )
  const current = $derived<OrderStep>($order.step > reachable ? reachable : $order.step)
  const issues = $derived(
    showAll
      ? FIELD_ORDER.flatMap((key) => {
          const message = errors[key]
          return message === undefined ? [] : [{ key, message }]
        })
      : [],
  )

  const errorOf = (key: FieldKey) =>
    showAll || touched.includes(key) ? errors[key] : undefined

  const touch = (key: FieldKey) => {
    touched = touched.includes(key) ? touched : [...touched, key]
  }

  const focusField = async (key: FieldKey) => {
    await tick()
    document.getElementById(`f-${key}`)?.focus()
  }

  const goToStep = async (step: OrderStep) => {
    setStep(step)
    isReady = false
    await tick()
    heading?.focus()
  }

  const next = async () => {
    const firstError = FIELD_ORDER.find(
      (key) => FIELD_STEPS[key] === current && errors[key] !== undefined,
    )
    if (firstError !== undefined) {
      showAll = true
      await focusField(firstError)
      return
    }
    showAll = false
    await goToStep(NEXT_STEP[current])
  }

  const fix = async (key: FieldKey) => {
    const step = FIELD_STEPS[key]
    if (step !== current) {
      await goToStep(step)
    }
    await focusField(key)
  }

  const submit = async () => {
    showAll = true
    const firstStep = getFirstErrorStep(errors)
    const firstError = FIELD_ORDER.find((key) => errors[key] !== undefined)
    isReady = firstStep === undefined
    if (firstStep === undefined || firstError === undefined) {
      return
    }
    await fix(firstError)
  }
</script>

{#if lines.length === 0}
  <OrderEmpty />
{:else}
  <div
    class="grid gap-x-8 gap-y-8 min-md:grid-cols-[minmax(0,1fr)_16rem] min-lg:grid-cols-[8rem_minmax(0,1fr)_16rem]"
  >
    <div class="min-md:col-span-2 min-lg:col-span-1">
      <OrderStepper
        {current}
        {reachable}
        onselect={(step: OrderStep) => {
          showAll = false
          void goToStep(step)
        }}
      />
    </div>

    <section aria-labelledby="h-step" class="min-w-0">
      <p
        class="font-alt text-brand-first-700 mb-2 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
      >
        {tp(`Krok ${String(current)} ze 4`)}
      </p>
      <h2 id="h-step" bind:this={heading} tabindex="-1" class={[STEP_HEADING, 'mb-6']}>
        {tp(STEP_TITLES[current])}
      </h2>

      {#if current === 1}
        <StepCart {lines} />
      {:else if current === 2}
        <StepDelivery {errorOf} />
      {:else if current === 3}
        <StepCustomer {errorOf} {touch} />
      {:else}
        <StepSummary
          {errors}
          ongoto={(step: OrderStep) => {
            void goToStep(step)
          }}
        />
        <p class="font-alt mt-6 text-[0.85rem] leading-snug text-gray-700 italic">
          {tp('Objednávku odešlete tlačítkem v kalkulaci.')}
        </p>
      {/if}

      <div
        class="border-brand-first-300/60 mt-8 flex items-center justify-between border-t border-dashed pt-5"
      >
        {#if current > 1}
          <button
            type="button"
            class={TEXT_BUTTON}
            onclick={() => {
              showAll = false
              void goToStep(PREVIOUS_STEP[current])
            }}
          >
            {tp('Zpět')}
          </button>
        {:else}
          <span></span>
        {/if}
        {#if current < 4}
          <button type="button" class={PRIMARY_BUTTON} onclick={next}>
            {tp(NEXT_LABELS[current])}
          </button>
        {/if}
      </div>
    </section>

    <OrderCalculation {lines} {totals} {issues} {isReady} onsubmit={submit} onfix={fix} />
  </div>
{/if}
