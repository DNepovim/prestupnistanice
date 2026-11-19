<script lang="ts">
  import { navigate } from 'astro:transitions/client'
  import { isNonEmptyArray, isOneOf } from 'narrowland'
  import { onDestroy, onMount, tick } from 'svelte'

  import SearchAuthorStrip from '@/components/search/SearchAuthorStrip.svelte'
  import SearchColorBar from '@/components/search/SearchColorBar.svelte'
  import SearchInput from '@/components/search/SearchInput.svelte'
  import SearchQuickCategories from '@/components/search/SearchQuickCategories.svelte'
  import SearchResults from '@/components/search/SearchResults.svelte'
  import { routes } from '@/routes'
  import { pluralize } from '@/utils/pluralize'
  import { createSearcher } from '@/utils/search/createSearcher'
  import {
    findDefaultEntity,
    getFocusedBookSlugs,
    getOptionId,
    getThemeSlug,
  } from '@/utils/search/entities'
  import type { SearchCategoryKey, SearchEntity, SearchIndex } from '@/utils/search/types'

  export let data: SearchIndex

  export let toggle: (is?: boolean) => void

  const LIST_ID = 'search-results'

  const THEME_SETTLE_MS = 250

  const ARROW_STEPS = { ArrowDown: 1, ArrowUp: -1 } as const

  const search = createSearcher(data)

  let query = ''
  let category: SearchCategoryKey | null = null
  let selectedId = ''
  let dialogEl: HTMLElement | undefined
  let inputElement: HTMLInputElement | undefined
  let appliedThemeStyle: string | undefined
  let themeTimer: ReturnType<typeof setTimeout> | undefined

  $: result = search(query, category)
  $: selectedId = findDefaultEntity(result.entities)?.id ?? ''
  $: selectedEntity = result.entities.find((entity) => entity.id === selectedId)
  $: focusedSlugs = new Set(
    selectedEntity ? getFocusedBookSlugs(selectedEntity, data.books) : [],
  )
  $: themeStyle = selectedEntity
    ? data.themes[getThemeSlug(selectedEntity, data.books)]
    : undefined
  $: highlightedCategories = category
    ? [category]
    : result.entities.flatMap((entity) =>
        entity.kind === 'category' ? [entity.key] : [],
      )
  $: settleTheme(themeStyle)
  $: selectedAuthorSlugs = new Set(getSelectedAuthorSlugs(selectedEntity))
  $: resultsAnnouncement = pluralize(result.entities.length, [
    'výsledek',
    'výsledky',
    'výsledků',
  ])

  const settleTheme = (style: string | undefined) => {
    clearTimeout(themeTimer)
    themeTimer = setTimeout(() => {
      appliedThemeStyle = style
    }, THEME_SETTLE_MS)
  }

  const getSelectedAuthorSlugs = (entity: SearchEntity | undefined) => {
    if (entity?.kind === 'author') {
      return [entity.author.slug]
    }
    return entity?.kind === 'book' ? entity.book.authorSlugs : []
  }

  const selectCategory = (key: SearchCategoryKey) => {
    category = key
    query = ''
    inputElement?.focus()
  }

  const toggleCategory = (key: SearchCategoryKey) => {
    if (category === key) {
      category = null
      inputElement?.focus()
      return
    }
    selectCategory(key)
  }

  const activate = (entity: SearchEntity) => {
    if (entity.kind === 'category') {
      selectCategory(entity.key)
      return
    }
    toggle(false)
    void navigate(
      entity.kind === 'author'
        ? routes.authors.detail(entity.author.slug)
        : routes.books.detail(entity.book.slug),
    )
  }

  const select = (id: string) => {
    if (id !== selectedId) {
      selectedId = id
    }
  }

  const findEntity = (predicate: (entity: SearchEntity) => boolean) =>
    result.entities.find(predicate)

  const selectBook = (slug: string) => {
    const entity = findEntity((e) => e.kind === 'book' && e.book.slug === slug)
    if (entity) {
      select(entity.id)
    }
  }

  const activateBook = (slug: string) => {
    const entity = findEntity((e) => e.kind === 'book' && e.book.slug === slug)
    if (entity) {
      activate(entity)
    }
  }

  const selectAuthor = (slug: string) => {
    const entity = findEntity((e) => e.kind === 'author' && e.author.slug === slug)
    if (entity) {
      select(entity.id)
    }
  }

  const filterByAuthor = (slug: string) => {
    const author = data.authors.find((a) => a.slug === slug)
    if (!author) {
      return
    }
    query = query.trim() === author.name ? '' : `${author.name} `
    inputElement?.focus()
  }

  const moveSelection = (step: number) => {
    const { entities } = result
    if (!isNonEmptyArray(entities)) {
      return
    }
    const current = entities.findIndex((entity) => entity.id === selectedId)
    const next = entities[(current + step + entities.length) % entities.length]
    if (!next) {
      return
    }
    selectedId = next.id
    void tick().then(() => {
      document.getElementById(getOptionId(next.id))?.scrollIntoView({ block: 'nearest' })
    })
  }

  const handleInputKeydown = (event: KeyboardEvent) => {
    if (isOneOf(event.key, ['ArrowDown', 'ArrowUp'])) {
      event.preventDefault()
      moveSelection(ARROW_STEPS[event.key])
      return
    }
    if (event.key === 'Enter' && selectedEntity) {
      event.preventDefault()
      activate(selectedEntity)
      return
    }
    if (event.key === 'Backspace' && query === '' && category) {
      category = null
    }
  }

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !dialogEl) return

    const focusable = [
      ...dialogEl.querySelectorAll<HTMLElement>('a[href], button, input, [tabindex]'),
    ].filter(
      (el) =>
        el.getAttribute('tabindex') !== '-1' &&
        (el.offsetWidth > 0 || el.offsetHeight > 0),
    )

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
      return
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onDestroy(() => {
    clearTimeout(themeTimer)
  })

  onMount(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputElement?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  })
</script>

<div
  class="transition-theme fixed inset-0 z-100 px-4"
  role="dialog"
  aria-modal="true"
  aria-label="Vyhledávání knih, autorů a kategorií"
  tabindex={-1}
  style={appliedThemeStyle}
  bind:this={dialogEl}
  onkeydown={trapFocus}
>
  <button
    type="button"
    class="bg-paper/97 fixed inset-0 size-full"
    aria-hidden="true"
    tabindex={-1}
    onclick={() => {
      toggle(false)
    }}
  ></button>
  <div
    class="bg-brand-second-100/20 pointer-events-none fixed inset-0"
    aria-hidden="true"
  ></div>
  <button
    type="button"
    class="text-brand-first-500 absolute top-4 right-4 flex size-12 cursor-pointer items-center justify-center transition-transform hover:rotate-90"
    aria-label="Zavřít vyhledávání"
    onclick={() => {
      toggle(false)
    }}
  >
    <iconify-icon icon="ph:x" class="text-3xl" noobserver></iconify-icon>
  </button>
  <div
    class="relative mx-auto flex h-dvh max-w-5xl flex-col pt-16 pb-4 max-md:pt-14 max-md:pb-2"
  >
    <SearchInput
      bind:value={query}
      bind:inputElement
      {category}
      listId={LIST_ID}
      activeDescendant={selectedId ? getOptionId(selectedId) : undefined}
      onkeydown={handleInputKeydown}
      onclearcategory={() => {
        category = null
        inputElement?.focus()
      }}
    />
    <SearchQuickCategories activeKeys={highlightedCategories} onselect={toggleCategory} />
    <div class="max-md:hidden">
      <SearchAuthorStrip
        authors={data.authors}
        matchedBookSlugs={result.matchedBookSlugs}
        {selectedAuthorSlugs}
        onhover={selectAuthor}
        onfilter={filterByAuthor}
      />
    </div>
    <SearchResults
      entities={result.entities}
      {selectedId}
      terms={result.terms}
      activeCategory={category}
      index={data}
      listId={LIST_ID}
      onselect={select}
      onactivate={activate}
    />
    <div class="max-md:hidden">
      <SearchColorBar
        index={data}
        selected={selectedEntity}
        {focusedSlugs}
        matchedBookSlugs={result.matchedBookSlugs}
        onhover={selectBook}
        onactivate={activateBook}
        oncategory={selectCategory}
      />
    </div>
    <p class="sr-only" role="status">{resultsAnnouncement}</p>
  </div>
</div>
