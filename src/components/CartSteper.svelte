<script lang="ts">
  import Icon from '@iconify/svelte'

  import type { OrderState } from '@/stores/order'
  import { orderStore, setCurrentState } from '@/stores/order'
  import { cn } from '@/utils/cn'

  const steps: { id: OrderState; name: string; icon: string }[] = [
    { id: 'cartContent', name: 'Košík', icon: 'ph:shopping-cart' },
    { id: 'deliveryPayment', name: 'Doprava & Platba', icon: 'ph:truck-trailer' },
    { id: 'personalData', name: 'Údaje', icon: 'ph:user' },
    { id: 'summary', name: 'Shrnutí', icon: 'ph:list-checks' },
  ]

  let maxVisitedIndex = 0
  $: currentStateIndex = steps.findIndex((s) => s.id === $orderStore.currentState)
  $: maxVisitedIndex = Math.max(maxVisitedIndex, currentStateIndex)
  const go = (s: OrderState) => { setCurrentState(s); }
  const canNavigate = (idx: number) => idx <= maxVisitedIndex
</script>

<div class="mb-8">
  <div class="flex items-start justify-between max-w-xl mx-auto">
    {#each steps as step, index (step.id)}
      <button
        class={cn(
          'flex flex-col items-center w-18',
          canNavigate(index) ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
        )}
        disabled={!canNavigate(index)}
        aria-disabled={!canNavigate(index)}
        on:click={() => {
          if (canNavigate(index)) go(step.id)
        }}
      >
        <div
          class={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border border-transparent',
            index < currentStateIndex && 'bg-brand-second-200 text-brand-first-500',
            index === currentStateIndex && 'bg-brand-first-500 text-white',
            index > currentStateIndex &&
              'bg-gray-200 border-brand-first-500 text-brand-first-500',
          )}
        >
          <Icon icon={step.icon} class="size-4" />
        </div>
        <span
          class={cn(
            'text-sm mt-2 font-alt text-center',
            index === currentStateIndex && 'font-bold',
          )}
        >
          {step.name}
        </span>
      </button>
      {#if index < steps.length - 1}
        <div
          class={cn(
            'flex-1 h-1 items-center mt-3.5 -mx-5',
            index < currentStateIndex - 1 && 'bg-brand-second-500',
            index === currentStateIndex - 1 &&
              index < currentStateIndex &&
              'bg-gradient-to-r from-brand-second-200 to-brand-first-500',
            index === currentStateIndex &&
              'bg-gradient-to-r from-brand-first-500 to-gray-200',
            index > currentStateIndex && 'bg-gray-200',
          )}
        ></div>
      {/if}
    {/each}
  </div>
</div>
