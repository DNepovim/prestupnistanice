<script lang="ts">
  import type { Snippet } from 'svelte'
  import { MediaQuery } from 'svelte/reactivity'
  import { slide } from 'svelte/transition'

  type Props = {
    open: boolean
    children: Snippet
  }

  const { open, children }: Props = $props()

  const reducedMotion = new MediaQuery('prefers-reduced-motion: reduce')
</script>

{#if open}
  <div transition:slide={{ duration: reducedMotion.current ? 0 : 450 }}>
    {@render children()}
  </div>
{/if}
