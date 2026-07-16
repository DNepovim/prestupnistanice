<script lang="ts">
  import { navigate } from 'astro:transitions/client'
  import { Command } from 'bits-ui'
  import Fuse from 'fuse.js'
  import { onMount } from 'svelte'

  type SearchItem = {
    slug: string
    title: string
    subtitle?: string
    image?: { src: string }
    link: string
    type: 'book' | 'author'
  }

  export let data: SearchItem[]

  export let toggle: (is?: boolean) => void

  let searchValue = ''

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

  const normalizeSearch = (value: string) => value.trim()

  const createKeywords = (item: SearchItem) =>
    [item.title, item.subtitle, item.slug]
      .filter((part): part is string => typeof part === 'string' && part.length > 0)
      .map((part) => part.toLowerCase())

  const goToItem = (item: SearchItem) => {
    toggle(false)
    void navigate(item.link)
  }

  const scrollCurrentSelectionIntoView = () => {
    const selectedItem = document.querySelector<HTMLElement>(
      '[cmdk-item][data-selected], [data-command-item][data-selected]',
    )
    if (!selectedItem) return
    selectedItem.scrollIntoView({
      block: 'nearest',
    })
  }

  const keepFocusOnInput = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key)) return
    window.requestAnimationFrame(scrollCurrentSelectionIntoView)
  }

  $: filteredBooks =
    normalizeSearch(searchValue) === '' ? data.map((item) => ({ item })) : fuse.search(searchValue)

  onMount(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  })
</script>

<div class="fixed inset-0 z-100 px-4">
  <button
    type="button"
    class="fixed inset-0 size-full bg-gradient-to-t from-brand-second-50/90 to-white/90"
    aria-label="Zavřít vyhledávání"
    tabindex={-1}
    onclick={() => {
      toggle(false)
    }}
  ></button>
  <button
    type="button"
    class="absolute top-4 right-4 flex size-12 items-center justify-center text-brand-first-500 cursor-pointer transition-transform hover:rotate-90"
    aria-label="Zavřít vyhledávání"
    onclick={() => {
      toggle(false)
    }}
  >
    <iconify-icon
      icon="ph:x"
      class="text-3xl"
      noobserver
    ></iconify-icon>
  </button>
  <div class="block mx-auto max-w-160 mt-20">
    <Command.Root
      class="w-full"
      shouldFilter={false}
    >
      <label class="relative text-5xl">
        <div
          class="absolute bottom-[0.15em] inset-x-0 h-[1px] w-full border-b-2 border-dotted border-brand-first-900"
        ></div>
        <Command.Input
          class="relative w-full bg-transparent pt-4 font-alt leading-[1em] text-brand-first-500 text-5xl text-outline-white outline-none placeholder:text-brand-first-500"
          placeholder="najděte si svou knihu…"
          bind:value={searchValue}
          onkeydown={keepFocusOnInput}
          autofocus
        />
        <iconify-icon
          icon="ph:magnifying-glass"
          class="absolute right-2 bottom-1/2 translate-y-1/2 text-4xl text-brand-first-500"
          noobserver
        ></iconify-icon>
      </label>
      <Command.List
        class="relative mt-4 h-[calc(100vh-13rem)] overflow-y-auto"
        tabindex={-1}
      >
        <Command.Empty class="px-4 py-6 text-brand-first-500">
          Žádné výsledky.
        </Command.Empty>
        <ul class="px-4">
          {#each filteredBooks as book (book.item.link)}
            <li class="py-4">
              <Command.Item
                value={book.item.link}
                keywords={createKeywords(book.item)}
                class="block w-full cursor-pointer border-l-2 border-transparent px-4 outline-none data-[selected]:border-brand-first-500"
                tabindex={-1}
                onSelect={() => {
                  goToItem(book.item)
                }}
              >
                <a
                  href={book.item.link}
                  class="flex gap-4"
                  tabindex={-1}
                  onclick={(event) => {
                    event.preventDefault()
                    goToItem(book.item)
                  }}
                >
                  {#if book.item.image}
                    <img
                      src={book.item.image.src}
                      alt={book.item.title}
                      class={[
                        'w-20 rounded-md shadow-2xl',
                        book.item.type === 'author' && 'rounded-full',
                      ]}
                    />
                  {:else}
                    <div
                      class="size-20 rounded-full bg-gradient-to-tr from-brand-first-200 to-brand-second-200"
                    ></div>
                  {/if}
                  <div>
                    <p class="font-alt text-xl font-bold text-brand-first-500">
                      {book.item.title}
                    </p>
                    <p>{book.item.subtitle}</p>
                  </div>
                </a>
              </Command.Item>
            </li>
          {/each}
        </ul>
      </Command.List>
    </Command.Root>
  </div>
</div>
