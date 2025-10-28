<script lang="ts">
  import { navigate } from 'astro:transitions/client'
  import Fuse from 'fuse.js'

  import { cn } from '../utils/cn'

  export let data: {
    slug: string
    title: string
    subtitle: string
    image: string
    link: string
    type: 'book' | 'author'
  }[]

  export let toggle: (is?: boolean) => void

  let searchValue = ''
  let container: HTMLDivElement
  let items: HTMLAnchorElement[] = []
  let indicator: HTMLDivElement
  let selectedIndex = 0
  // eslint-disable-next-line unused-imports/no-unused-vars
  let hoveredIndex: number | null = null

  const fuseOptions = {
    ignoreDiacritics: true,
    includeMatches: false,
    threshold: 0.4,
    keys: [
      { name: 'title', weight: 1 },
      { name: 'subtitle', weight: 0.1 },
    ],
  }

  const fuse = new Fuse(data, fuseOptions)

  const updateIndicator = (index: number) => {
    const el = items[index]
    if (!el) return
    const { offsetTop, offsetHeight } = el
    indicator.style.transform = `translateY(${String(offsetTop)}px)`
    indicator.style.height = `${String(offsetHeight)}px`
  }

  $: filteredBooks =
    searchValue.trim() === '' ? data.map((item) => ({ item })) : fuse.search(searchValue)

  $: if (searchValue) {
    selectedIndex = 0
  }

  const selectedItem = items[selectedIndex]

  $: if (selectedItem) {
    selectedItem.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    })
    updateIndicator(selectedIndex)
  }

  const autofocus = (node: HTMLInputElement) => {
    node.focus()
  }
</script>

<div class="fixed inset-0 z-100 px-4">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-gradient-to-t from-brand-second-50/90 to-white/90 size-full"
    onclick={() => {
      toggle(false)
    }}
  ></div>
  <div class="block mx-auto max-w-160 mt-20">
    <label class="relative text-5xl">
      <div
        class="absolute bottom-[0.15em] inset-x-0 h-[1px] w-full border-b-2 border-dotted border-brand-first-900"
      ></div>
      <input
        id="search"
        class="relative pt-4 text-outline-white leading-[1em] text-brand-first-500 w-full font-alt bg-transparent outline-none"
        type="text"
        placeholder="najděte si svou knihu…"
        use:autofocus
        bind:value={searchValue}
      />
      <iconify-icon
        icon="ph:magnifying-glass"
        class="absolute right-2 text-4xl bottom-1/2 translate-y-1/2 text-brand-first-500"
        noobserver
      ></iconify-icon>
    </label>
    <div
      class="mt-4 overflow-y-auto h-[calc(100vh-13rem)] relative"
      bind:this={container}
    >
      {#if filteredBooks.length > 0}
        <div
          bind:this={indicator}
          class="max-xs:hidden absolute left-0 top-0 w-[2px] bg-gradient-to-t from-brand-first-500 to-brand-second-500 transition-all duration-300 ease-in-out"
        ></div>
      {/if}

      <ul class="px-4">
        {#each filteredBooks as book, index (book.item.slug)}
          <li
            class="py-4"
            onmouseenter={() => {
              hoveredIndex = index
              updateIndicator(index)
            }}
            onmouseleave={() => {
              hoveredIndex = null
              updateIndicator(selectedIndex)
            }}
          >
            <a
              href={book.item.link}
              class="flex gap-4 px-4 border-l-2 border-transparent"
              bind:this={items[index]}
            >
              {#if book.item.image}
                <img
                  src={book.item.image}
                  alt={book.item.title}
                  class={cn(
                    'w-20 rounded shadow-2xl',
                    book.item.type === 'author' && 'rounde-full',
                  )}
                />
              {:else}
                <div
                  class="from-brand-first-200 to-brand-second-200 size-20 rounded-full bg-gradient-to-tr"
                ></div>
              {/if}
              <div>
                <p class="font-alt text-xl text-brand-first-500 font-bold">
                  {book.item.title}
                </p>
                <p class="">
                  {book.item.subtitle}
                </p>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<svelte:window
  onkeydown={(e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && selectedIndex > 0) {
      selectedIndex -= 1
    }

    if (e.key === 'ArrowDown' && selectedIndex < filteredBooks.length - 1) {
      selectedIndex += 1
    }

    const selectedBook = filteredBooks[selectedIndex]

    if (e.key === 'Enter' && filteredBooks[selectedIndex] && selectedBook) {
      void navigate(selectedBook.item.link)
    }
  }}
/>

<!-- on:wheel|nonpassive={(e) => { -->
<!--   if (isOpen) e.preventDefault() -->
<!-- }} -->
