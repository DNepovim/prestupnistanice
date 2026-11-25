<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'

  import { cart } from '@/stores/cart'
  import { order, ORDER_STEPS, type OrderStep } from '@/stores/order'
  import type { CartIndex } from '@/utils/cart/types'
  import { buildOrderRequest, completeOrder, sendOrder } from '@/utils/order/sendOrder'
  import { getOrderLines, getOrderTotals } from '@/utils/order/totals'
  import {
    FIELD_ORDER,
    FIELD_STEPS,
    validateOrder,
    type FieldKey,
  } from '@/utils/order/validation'

  import OrderCalculation from './OrderCalculation.svelte'
  import OrderEmpty from './OrderEmpty.svelte'
  import OrderStepper from './OrderStepper.svelte'
  import StepCart from './StepCart.svelte'
  import StepCustomer from './StepCustomer.svelte'
  import StepDelivery from './StepDelivery.svelte'
  import StepSection from './StepSection.svelte'

  type Props = {
    books: CartIndex
  }

  const { books }: Props = $props()

  const NEXT_LABELS = {
    1: 'Pokračovat k dopravě',
    2: 'Pokračovat k údajům',
  } as const satisfies Record<Exclude<OrderStep, 3>, string>

  const ACTIVE_LINE_RATIO = 0.35

  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce')

  let touched = $state<FieldKey[]>([])
  let attempted = $state<number[]>([])
  let isSubmitAttempted = $state(false)
  let isSubmitting = $state(false)
  let submitError = $state('')
  let website = $state('')
  let activeStep = $state<OrderStep>(1)

  const lines = $derived(getOrderLines($cart, books))
  const errors = $derived(validateOrder($order, lines.length))
  const totals = $derived(getOrderTotals(lines, $order))
  const issues = $derived(
    isSubmitAttempted
      ? FIELD_ORDER.flatMap((key) => {
          const message = errors[key]
          return message === undefined ? [] : [{ key, message }]
        })
      : [],
  )

  const sectionOf = (step: OrderStep) => document.getElementById(`step-${String(step)}`)

  const errorOf = (key: FieldKey) =>
    attempted.includes(FIELD_STEPS[key]) || touched.includes(key)
      ? errors[key]
      : undefined

  const touch = (key: FieldKey) => {
    touched = touched.includes(key) ? touched : [...touched, key]
  }

  const scrollBehavior = () => (reducedMotion.current ? 'auto' : 'smooth')

  const focusField = async (key: FieldKey) => {
    await tick()
    const element = document.getElementById(`f-${key}`)
    element?.focus({ preventScroll: true })
    element?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
  }

  const scrollToStep = async (step: OrderStep) => {
    await tick()
    const section = sectionOf(step)
    section?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    section?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }

  const next = async (step: OrderStep) => {
    const firstError = FIELD_ORDER.find(
      (key) => FIELD_STEPS[key] === step && errors[key] !== undefined,
    )
    if (firstError !== undefined) {
      attempted = [...attempted, step]
      await focusField(firstError)
      return
    }
    const following = ORDER_STEPS.find((candidate) => candidate === step + 1)
    if (following !== undefined) {
      await scrollToStep(following)
    }
  }

  const submit = async () => {
    attempted = [...ORDER_STEPS]
    isSubmitAttempted = true
    submitError = ''
    const firstError = FIELD_ORDER.find((key) => errors[key] !== undefined)
    if (firstError !== undefined) {
      await focusField(firstError)
      return
    }
    const request = buildOrderRequest(
      lines.map(({ book, count }) => ({ slug: book.slug, count })),
      $order,
      website,
    )
    if (request === undefined) {
      return
    }
    isSubmitting = true
    const response = await sendOrder(request)
    if (response.ok) {
      completeOrder(response.result)
      return
    }
    submitError = response.message
    isSubmitting = false
  }

  const updateActiveStep = () => {
    const isAtBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    const threshold = window.innerHeight * ACTIVE_LINE_RATIO
    const reached = ORDER_STEPS.filter(
      (step) => (sectionOf(step)?.getBoundingClientRect().top ?? Infinity) <= threshold,
    )
    activeStep = isAtBottom ? 3 : (reached.at(-1) ?? 1)
  }

  onMount(() => {
    let frame = 0
    const schedule = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateActiveStep)
    }
    updateActiveStep()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
    }
  })
</script>

{#if lines.length === 0}
  <OrderEmpty />
{:else}
  <div
    class="flex flex-col gap-x-8 gap-y-8 min-md:grid min-md:grid-cols-[3.8rem_minmax(0,1fr)] min-lg:grid-cols-[3.8rem_minmax(0,1fr)_16rem]"
  >
    <OrderStepper
      active={activeStep}
      onselect={(step: OrderStep) => {
        void scrollToStep(step)
      }}
    />

    <div class="flex min-w-0 flex-col gap-16">
      <StepSection
        step={1}
        continueLabel={NEXT_LABELS[1]}
        oncontinue={() => {
          void next(1)
        }}
      >
        <StepCart {lines} />
      </StepSection>
      <StepSection
        step={2}
        continueLabel={NEXT_LABELS[2]}
        oncontinue={() => {
          void next(2)
        }}
      >
        <StepDelivery {errorOf} />
      </StepSection>
      <StepSection step={3}>
        <StepCustomer {errorOf} {touch} />
      </StepSection>
    </div>

    <input
      type="text"
      name="website"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="absolute -left-[9999px] size-px opacity-0"
      bind:value={website}
    />

    <div class="min-md:col-span-2 min-lg:col-span-1">
      <OrderCalculation
        {totals}
        {issues}
        {isSubmitting}
        {submitError}
        step={activeStep}
        onsubmit={submit}
        onfix={focusField}
      />
    </div>
  </div>
{/if}
