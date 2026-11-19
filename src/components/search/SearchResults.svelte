<script lang="ts">
  import SearchCategoryHeading from '@/components/search/SearchCategoryHeading.svelte'
  import SearchCoverStack from '@/components/search/SearchCoverStack.svelte'
  import SearchHighlight from '@/components/search/SearchHighlight.svelte'
  import SearchPortrait from '@/components/search/SearchPortrait.svelte'
  import { routes } from '@/routes'
  import { pluralize } from '@/utils/pluralize'
  import { getAuthorBooks, getOptionId } from '@/utils/search/entities'
  import type { SearchCategoryKey, SearchEntity, SearchIndex } from '@/utils/search/types'

  export let entities: SearchEntity[]
  export let selectedId: string
  export let terms: string[]
  export let activeCategory: SearchCategoryKey | null
  export let index: SearchIndex
  export let listId: string
  export let onselect: (id: string) => void
  export let onactivate: (entity: SearchEntity) => void

  const ROW_CLASS =
    'group/person flex w-full cursor-pointer items-center gap-3 border-b border-dashed border-brand-first-300/60 px-3 py-2 text-left outline-none transition-colors data-[selected=true]:bg-brand-first-500/10'
</script>

<div
  class="mt-3 min-h-0 flex-1 overflow-y-auto pb-12 [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]"
>
  <ul
    id={listId}
    role="listbox"
    aria-label="Výsledky hledání"
    tabindex={-1}
    class="columns-2 gap-x-8 max-md:columns-1"
  >
    {#if activeCategory}
      <li
        role="presentation"
        class="border-brand-first-500 [column-span:all] border-b-2 px-3 py-3"
      >
        <SearchCategoryHeading category={activeCategory} {index} showLink />
      </li>
    {/if}
    {#each entities as entity (entity.id)}
      {@const selected = entity.id === selectedId}
      <li
        role="presentation"
        class={entity.kind === 'book' ? 'break-inside-avoid' : '[column-span:all]'}
      >
        {#if entity.kind === 'category'}
          <button
            type="button"
            id={getOptionId(entity.id)}
            role="option"
            aria-selected={selected}
            data-selected={selected}
            tabindex={-1}
            class="border-brand-first-500 w-full cursor-pointer border-b-2 px-3 py-3 text-left transition-colors data-[selected=true]:bg-brand-first-500/10"
            onpointermove={() => {
              onselect(entity.id)
            }}
            onclick={() => {
              onactivate(entity)
            }}
          >
            <SearchCategoryHeading category={entity.key} {index} />
          </button>
        {:else if entity.kind === 'author'}
          {@const authorBooks = getAuthorBooks(entity.author, index.books)}
          <a
            id={getOptionId(entity.id)}
            role="option"
            aria-selected={selected}
            data-selected={selected}
            tabindex={-1}
            href={routes.authors.detail(entity.author.slug)}
            class={[ROW_CLASS, 'py-3']}
            onpointermove={() => {
              onselect(entity.id)
            }}
            onclick={(event) => {
              event.preventDefault()
              onactivate(entity)
            }}
          >
            <SearchPortrait
              author={entity.author}
              revealed={selected}
              class="size-14 text-lg"
            />
            <span class="flex min-w-0 flex-col">
              <span
                class="font-head text-brand-first-500 text-xl leading-tight font-bold italic"
              >
                <SearchHighlight text={entity.author.name} {terms} />
              </span>
              <span
                class="font-alt text-brand-first-700 mt-0.5 text-[0.66rem] tracking-[0.06em]"
              >
                {entity.author.life ? `${entity.author.life} · ` : ''}{pluralize(
                  authorBooks.length,
                  ['kniha', 'knihy', 'knih'],
                )}
              </span>
            </span>
            <SearchCoverStack
              books={authorBooks.slice(0, 4)}
              class="ml-auto h-10 max-md:hidden"
            />
          </a>
        {:else if entity.kind === 'book'}
          <a
            id={getOptionId(entity.id)}
            role="option"
            aria-selected={selected}
            data-selected={selected}
            tabindex={-1}
            href={routes.books.detail(entity.book.slug)}
            class={[ROW_CLASS, entity.indented && 'pl-9']}
            onpointermove={() => {
              onselect(entity.id)
            }}
            onclick={(event) => {
              event.preventDefault()
              onactivate(entity)
            }}
          >
            <span
              class="flex h-14 w-11 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <img
                src={entity.book.cover.src}
                width={entity.book.cover.width}
                height={entity.book.cover.height}
                alt=""
                class="max-h-full max-w-full shadow-[0_0.15rem_0.5rem_rgba(0,0,0,0.25)]"
              />
            </span>
            <span class="flex min-w-0 flex-col">
              <span class="font-head text-lg leading-tight font-extrabold text-black">
                <SearchHighlight text={entity.book.title} {terms} />
              </span>
              <span class="font-alt mt-0.5 text-sm text-gray-800 italic">
                <SearchHighlight text={entity.book.authorsLabel} {terms} />
              </span>
            </span>
          </a>
        {/if}
      </li>
    {:else}
      <li
        role="presentation"
        class="font-alt text-brand-first-700 [column-span:all] px-3 py-6 italic"
      >
        Nic jsme nenašli. Zkuste kratší slovo nebo jinou kategorii.
      </li>
    {/each}
  </ul>
</div>
