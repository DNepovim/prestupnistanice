<script lang="ts">
  import { getCategoryTabLabel, SEARCH_CATEGORY_KEYS } from '@/utils/search/categories'
  import type { SearchCategoryKey } from '@/utils/search/types'

  export let activeKeys: SearchCategoryKey[]
  export let onselect: (key: SearchCategoryKey) => void
</script>

<div class="font-alt mt-3 flex flex-wrap items-center gap-2">
  {#each SEARCH_CATEGORY_KEYS as key (key)}
    <button
      type="button"
      aria-pressed={activeKeys.includes(key)}
      class="border-brand-first-300 text-brand-first-700 hover:bg-brand-first-100 aria-pressed:border-brand-first-500 aria-pressed:bg-brand-first-500 cursor-pointer border px-2.5 py-1 text-xs transition-colors aria-pressed:text-white"
      onclick={() => {
        onselect(key)
      }}
    >
      {getCategoryTabLabel(key)}
    </button>
  {/each}
</div>
