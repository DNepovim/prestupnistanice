<script lang="ts">
  import { getCategoryLabel } from '@/utils/search/categories'
  import type { SearchCategoryKey } from '@/utils/search/types'

  export let value: string
  export let category: SearchCategoryKey | null
  export let listId: string
  export let activeDescendant: string | undefined
  export let inputElement: HTMLInputElement | undefined = undefined
  export let onkeydown: (event: KeyboardEvent) => void
  export let onclearcategory: () => void
</script>

<div
  class="border-brand-first-900 relative flex items-center gap-3 border-b-2 border-dotted pr-12 focus-within:border-solid max-md:pr-9"
>
  {#if category}
    <span
      class="bg-brand-first-700 font-alt flex shrink-0 items-center gap-1 py-1 pr-1 pl-3 text-xs font-bold tracking-[0.08em] text-white uppercase"
    >
      {getCategoryLabel(category)}
      <button
        type="button"
        class="cursor-pointer px-1.5 text-base leading-none"
        aria-label={`Zrušit kategorii ${getCategoryLabel(category)}`}
        onclick={onclearcategory}
      >
        ×
      </button>
    </span>
  {/if}
  <input
    bind:this={inputElement}
    bind:value
    {onkeydown}
    type="text"
    role="combobox"
    aria-label="Hledat knihy, autory a kategorie"
    aria-autocomplete="list"
    aria-expanded="true"
    aria-controls={listId}
    aria-activedescendant={activeDescendant}
    autocomplete="off"
    placeholder={category ? 'hledat v kategorii…' : 'najděte si svou knihu…'}
    class="font-alt text-brand-first-500 placeholder:text-brand-first-500/80 min-w-0 flex-1 bg-transparent pt-3 pb-1 text-3xl leading-[1.2] outline-none max-md:text-xl"
  />
  <iconify-icon
    icon="ph:magnifying-glass"
    class="text-brand-first-500 absolute right-2 text-3xl max-md:text-xl"
    noobserver
    aria-hidden="true"
  ></iconify-icon>
</div>
