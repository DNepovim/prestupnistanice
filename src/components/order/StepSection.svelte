<script lang="ts">
  import type { Snippet } from 'svelte'

  import type { OrderStep } from '@/stores/order'
  import { tp } from '@/utils/tp'

  import { STEP_TITLES } from './fieldLabels'
  import { STEP_VARS } from './stepVars'
  import { PRIMARY_BUTTON, STEP_HEADING } from './styles'

  type Props = {
    step: OrderStep
    continueLabel?: string
    oncontinue?: () => void
    children: Snippet
  }

  const { step, continueLabel, oncontinue, children }: Props = $props()
</script>

<section
  id={`step-${String(step)}`}
  aria-labelledby={`h-step-${String(step)}`}
  class={[
    'scroll-mt-20 min-md:scroll-mt-8',
    STEP_VARS[step],
    step > 1 && 'border-(--step) border-t border-dashed pt-12',
  ]}
>
  <p
    class="font-alt text-(--step-ink) mb-2 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
  >
    {tp(`Krok ${String(step)} ze 3`)}
  </p>
  <h2 id={`h-step-${String(step)}`} tabindex="-1" class={[STEP_HEADING, 'mb-6']}>
    {tp(STEP_TITLES[step])}
  </h2>
  {@render children()}
  {#if continueLabel !== undefined && oncontinue !== undefined}
    <div class="mt-8 flex justify-center">
      <button type="button" class={PRIMARY_BUTTON} onclick={oncontinue}>
        {tp(continueLabel)}
      </button>
    </div>
  {/if}
</section>
