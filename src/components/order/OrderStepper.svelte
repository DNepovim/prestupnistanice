<script lang="ts">
  import { ORDER_STEPS, type OrderStep } from '@/stores/order'
  import { tp } from '@/utils/tp'

  import { STEP_TITLES } from './fieldLabels'

  type Props = {
    current: OrderStep
    reachable: OrderStep
    onselect: (step: OrderStep) => void
  }

  const { current, reachable, onselect }: Props = $props()
</script>

<nav aria-label={tp('Kroky objednávky')}>
  <ol
    class="border-brand-first-500 text-brand-first-300 relative flex flex-col border-l bg-[repeating-linear-gradient(to_bottom,currentColor_0_1px,transparent_1px_0.45rem)] bg-size-[0.4rem_100%] bg-no-repeat"
  >
    {#each ORDER_STEPS as step (step)}
      <li
        class={[
          'text-brand-first-500 relative before:absolute before:top-6 before:left-0 before:block before:h-px before:bg-current',
          step === current ? 'before:w-6' : 'before:w-3',
        ]}
      >
        <button
          type="button"
          class={[
            'flex w-full items-baseline gap-3 py-2 pr-1 pl-8 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-first-500',
            step > reachable ? 'cursor-not-allowed text-gray-600' : 'text-gray-900',
          ]}
          disabled={step > reachable}
          aria-current={step === current ? 'step' : undefined}
          onclick={() => {
            onselect(step)
          }}
        >
          <span
            class={[
              'font-head text-[1.8rem] leading-none font-extrabold oldstyle-nums',
              step > reachable ? 'text-brand-first-300' : 'text-brand-first-500',
            ]}
          >
            {step}
          </span>
          <span
            class={[
              'font-alt text-[0.7rem] leading-[1.25] tracking-[0.08em] uppercase',
              step === current && 'font-bold',
            ]}
          >
            {tp(STEP_TITLES[step])}
          </span>
        </button>
      </li>
    {/each}
  </ol>
</nav>
