<script lang="ts">
  import { highlightParts } from '@/utils/search/highlight'

  export let text: string
  export let terms: string[]

  $: parts = highlightParts(text, terms)
</script>

{#each parts as part, index (index)}{#if part.match}<mark
      class="bg-brand-second-200 text-inherit">{part.text}</mark
    >{:else}{part.text}{/if}{/each}
