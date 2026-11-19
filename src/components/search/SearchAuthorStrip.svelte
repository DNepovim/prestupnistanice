<script lang="ts">
  import SearchPortrait from '@/components/search/SearchPortrait.svelte'
  import type { SearchAuthor } from '@/utils/search/types'

  export let authors: SearchAuthor[]
  export let matchedBookSlugs: ReadonlySet<string>
  export let selectedAuthorSlugs: ReadonlySet<string>
  export let onhover: (slug: string) => void
  export let onfilter: (slug: string) => void
</script>

<div class="mt-3 flex gap-2 overflow-x-auto px-1 py-1.5" aria-hidden="true">
  {#each authors as author (author.slug)}
    {@const selected = selectedAuthorSlugs.has(author.slug)}
    {@const matched = author.bookSlugs.some((slug) => matchedBookSlugs.has(slug))}
    <button
      type="button"
      tabindex={-1}
      title={author.name}
      aria-label={`Hledat knihy autora ${author.name}`}
      class={[
        'group/person shrink-0 cursor-pointer transition-[opacity,translate] duration-300 motion-reduce:transition-none',
        !matched && 'opacity-25',
        selected && '-translate-y-0.5',
      ]}
      onpointerenter={() => {
        onhover(author.slug)
      }}
      onclick={() => {
        onfilter(author.slug)
      }}
    >
      <SearchPortrait
        {author}
        revealed={selected}
        class={[
          'size-10 text-sm',
          selected && 'outline-brand-first-700 outline-2 outline-offset-2',
        ]}
      />
    </button>
  {/each}
</div>
