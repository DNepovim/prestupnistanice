<script lang="ts">
  import SearchPreviewCard from '@/components/search/SearchPreviewCard.svelte'
  import { createBarLayout, getCardPlacement } from '@/utils/search/barLayout'
  import { getCategoryTabLabel } from '@/utils/search/categories'
  import type { SearchCategoryKey, SearchEntity, SearchIndex } from '@/utils/search/types'

  export let index: SearchIndex
  export let selected: SearchEntity | undefined
  export let focusedSlugs: ReadonlySet<string>
  export let matchedBookSlugs: ReadonlySet<string>
  export let onhover: (slug: string) => void
  export let onactivate: (slug: string) => void
  export let oncategory: (key: SearchCategoryKey) => void

  const getState = (
    slug: string,
    focused: ReadonlySet<string>,
    matched: ReadonlySet<string>,
  ) => {
    if (focused.has(slug)) {
      return 'focus'
    }
    return matched.has(slug) ? 'match' : 'miss'
  }

  $: layout = createBarLayout(index.books)
  $: focusedColumns = layout.segments
    .filter((segment) => focusedSlugs.has(segment.book.slug))
    .map((segment) => segment.column)
  $: card = getCardPlacement(focusedColumns, layout.totalColumns)
  $: anchorColumn = card?.side === 'left' ? card.start : (card?.end ?? 1) - 1
</script>

<div class="mt-3" style:--columns={layout.columns} aria-hidden="true">
  <div class="grid h-44 grid-cols-(--columns) grid-rows-[1fr_auto] gap-x-0.5">
    {#if selected && selected.kind !== 'author' && card}
      {#each focusedColumns as column (column)}
        <span
          style:--col={column}
          class={[
            'bg-brand-first-500 col-start-(--col) row-start-2 w-px justify-self-center',
            column === anchorColumn
              ? 'relative h-4 before:absolute before:top-[-0.15rem] before:left-1/2 before:size-[0.3rem] before:-translate-x-1/2 before:rounded-full before:bg-brand-first-500'
              : 'h-2 self-end',
          ]}
        ></span>
      {/each}
      {#if focusedColumns.length > 1}
        <span
          style:--col-start={card.start}
          style:--col-end={card.end}
          class="bg-brand-first-500 col-start-(--col-start) col-end-(--col-end) row-start-2 h-px self-center"
        ></span>
      {/if}
      <div
        data-side={card.side}
        style:--card-start={card.start}
        style:--card-end={card.end}
        class="row-start-1 flex items-end gap-4 self-end data-[side=left]:col-start-(--card-start) data-[side=left]:-col-end-1 data-[side=right]:col-start-1 data-[side=right]:col-end-(--card-end) data-[side=right]:flex-row-reverse data-[side=right]:justify-self-end data-[side=right]:text-right"
      >
        <SearchPreviewCard entity={selected} {index} />
      </div>
    {/if}
  </div>
  <div class="grid h-[5.2rem] grid-cols-(--columns) items-center gap-x-0.5">
    {#each layout.segments as segment (segment.book.slug)}
      <button
        type="button"
        tabindex={-1}
        aria-label={segment.book.title}
        data-state={getState(segment.book.slug, focusedSlugs, matchedBookSlugs)}
        style:--col={segment.column}
        style:--from={segment.book.colors.first}
        style:--to={segment.book.colors.second}
        class="col-start-(--col) h-16 w-full min-w-0 cursor-pointer bg-[linear-gradient(90deg,var(--from)_66.67%,var(--to)_66.67%)] transition-[height,opacity] duration-400 ease-out data-[state=focus]:h-[5.2rem] data-[state=miss]:h-[0.4rem] data-[state=miss]:opacity-70 motion-reduce:transition-none"
        onpointerenter={() => {
          onhover(segment.book.slug)
        }}
        onclick={() => {
          onactivate(segment.book.slug)
        }}
      ></button>
    {/each}
  </div>
  <div
    class="font-alt text-brand-first-700 mt-1.5 grid grid-cols-(--columns) gap-x-0.5 text-[0.5rem] tracking-[0.06em]"
  >
    {#each layout.groups as group (group.category)}
      <button
        type="button"
        tabindex={-1}
        style:--col-start={group.startColumn}
        style:--col-end={group.endColumn}
        class="border-brand-first-500/55 col-start-(--col-start) col-end-(--col-end) min-w-0 cursor-pointer border-t pt-1 text-left leading-tight hover:underline"
        onclick={() => {
          oncategory(group.category)
        }}
      >
        {getCategoryTabLabel(group.category)}
      </button>
    {/each}
  </div>
</div>
