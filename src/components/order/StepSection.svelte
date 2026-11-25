<script lang="ts">
  import type { Snippet } from 'svelte'

  import type { OrderStep } from '@/stores/order'
  import { tp } from '@/utils/tp'

  import { STEP_TITLES } from './fieldLabels'
  import { STEP_VARS } from './stepVars'
  import { OUTLINE_BUTTON, STEP_HEADING } from './styles'

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
  <h2 id={`h-step-${String(step)}`} tabindex="-1" class={[STEP_HEADING, 'mb-6']}>
    {tp(STEP_TITLES[step])}
  </h2>
  {@render children()}
  {#if continueLabel !== undefined && oncontinue !== undefined}
    <div class="mt-8 flex justify-center">
      <button type="button" class={OUTLINE_BUTTON} onclick={oncontinue}>
        {tp(continueLabel)}
      </button>
    </div>
  {/if}
</section>
