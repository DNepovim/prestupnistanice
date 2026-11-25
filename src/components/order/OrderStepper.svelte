<script lang="ts">
  import { ORDER_STEPS, type OrderStep } from '@/stores/order'
  import { tp } from '@/utils/tp'

  import { STEP_TITLES } from './fieldLabels'
  import { STEP_VARS } from './stepVars'

  type Props = {
    active: OrderStep
    onselect: (step: OrderStep) => void
  }

  const { active, onselect }: Props = $props()

  const STEP_COLORS = {
    1: 'bg-ink-blue',
    2: 'bg-ink-magenta',
    3: 'bg-[color-mix(in_srgb,var(--color-ink-green),black_30%)]',
  } as const satisfies Record<OrderStep, string>

  const RULER =
    'min-md:[background-image:linear-gradient(to_bottom,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] min-md:[background-size:0.9rem_100%,0.6rem_50%,0.35rem_10%] min-md:[background-repeat:no-repeat,repeat-y,repeat-y] min-md:[background-position:0.5rem_0,0.5rem_0,0.5rem_0]'
</script>

<nav
  aria-label={tp('Kroky objednávky')}
  class="bg-white max-md:sticky max-md:top-0 max-md:z-20 max-md:border-b max-md:border-brand-first-300/60 min-md:sticky min-md:top-6 min-md:self-start"
>
  <ol
    class="text-brand-first-500 grid grid-cols-3 min-md:h-[min(36rem,calc(100svh-3rem))] min-md:grid-cols-1 min-md:grid-rows-3"
  >
    {#each ORDER_STEPS as step (step)}
      <li class={['relative min-h-0', RULER, STEP_VARS[step]]}>
        <button
          type="button"
          class="flex size-full min-h-0 items-center gap-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-black max-md:justify-center min-md:flex-col min-md:items-start min-md:py-1 min-md:pl-6"
          aria-current={step === active ? 'step' : undefined}
          onclick={() => {
            onselect(step)
          }}
        >
          <span
            class={[
              'font-alt flex min-h-0 items-baseline gap-2 overflow-hidden text-[0.72rem] leading-none tracking-[0.05em] whitespace-nowrap uppercase min-md:[writing-mode:vertical-rl]',
              step === active ? 'font-bold text-(--step-ink)' : 'text-gray-600',
            ]}
          >
            <span
              class="font-head text-[1.2rem] font-extrabold tracking-normal oldstyle-nums"
            >
              {step}
            </span>
            <span class="max-md:sr-only">{tp(STEP_TITLES[step])}</span>
          </span>
        </button>
        <span
          aria-hidden="true"
          class={[
            'pointer-events-none absolute transition-[width,height] duration-300 motion-reduce:transition-none',
            'max-md:inset-x-0 max-md:bottom-0',
            'min-md:top-0 min-md:bottom-0 min-md:left-0',
            step === active ? 'max-md:h-1.5 min-md:w-1.5' : 'max-md:h-0.5 min-md:w-0.5',
            STEP_COLORS[step],
          ]}
        ></span>
      </li>
    {/each}
  </ol>
</nav>
