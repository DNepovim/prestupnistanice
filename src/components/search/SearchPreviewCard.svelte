<script lang="ts">
  import SearchCoverStack from '@/components/search/SearchCoverStack.svelte'
  import { getCategoryLabel } from '@/utils/search/categories'
  import { getCategoryBooks, getCategoryStats } from '@/utils/search/entities'
  import type { SearchIndex, SearchPreviewEntity } from '@/utils/search/types'

  export let entity: SearchPreviewEntity
  export let index: SearchIndex

  const KICKER_CLASS =
    'font-alt text-brand-first-700 block text-[0.6rem] tracking-[0.12em] uppercase'
  const TITLE_CLASS = 'font-head m-0 text-2xl leading-[1.1] font-extrabold'
  const BYLINE_CLASS = 'font-alt m-0 mt-1 text-sm text-gray-800 italic'
</script>

{#if entity.kind === 'book'}
  <img
    src={entity.book.cover.src}
    width={entity.book.cover.width}
    height={entity.book.cover.height}
    alt=""
    class="h-36 w-auto shrink-0 shadow-[0_0.3rem_1.4rem_rgba(0,0,0,0.18)]"
  />
  <div class="min-w-0">
    <span class={KICKER_CLASS}>Kniha</span>
    <p class={[TITLE_CLASS, 'text-black']}>{entity.book.title}</p>
    <p class={BYLINE_CLASS}>{entity.book.authorsLabel} · {entity.book.year}</p>
  </div>
{:else if entity.kind === 'category'}
  {@const categoryBooks = getCategoryBooks(entity.key, index.books)}
  <div class="min-w-0">
    <p class={[TITLE_CLASS, 'text-brand-first-500']}>{getCategoryLabel(entity.key)}</p>
    <p class={BYLINE_CLASS}>{getCategoryStats(entity.key, index)}</p>
    <SearchCoverStack books={categoryBooks.slice(0, 7)} class="mt-2 h-11" />
  </div>
{/if}
