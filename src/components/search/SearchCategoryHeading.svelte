<script lang="ts">
  import { routes } from '@/routes'
  import { getCategoryLabel } from '@/utils/search/categories'
  import { getCategoryStats } from '@/utils/search/entities'
  import type { SearchCategoryKey, SearchIndex } from '@/utils/search/types'

  export let category: SearchCategoryKey
  export let index: SearchIndex
  export let showLink = false
</script>

<span class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
  <span
    class="font-head text-brand-first-500 text-3xl leading-none font-extrabold tracking-[-0.02em] max-md:text-2xl"
  >
    {getCategoryLabel(category)}
  </span>
  <span class="font-alt text-sm text-gray-800 italic"
    >{getCategoryStats(category, index)}</span
  >
  {#if showLink}
    <a
      href={routes.books.category(category)}
      class="font-alt text-brand-first-700 ml-auto border-b border-dotted border-current text-xs"
    >
      celá kategorie →
    </a>
  {/if}
</span>
