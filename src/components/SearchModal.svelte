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

  const ITEM_IMAGE_CLASSES = {
    book: 'rounded-md',
    author: 'aspect-square rounded-full object-cover',
  } as const satisfies Record<SearchItem['type'], string>

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
    if (
      !['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key)
    )
      return
    window.requestAnimationFrame(scrollCurrentSelectionIntoView)
  }

  let dialogEl: HTMLElement | undefined

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

  $: filteredBooks =
    normalizeSearch(searchValue) === ''
      ? data.map((item) => ({ item }))
      : fuse.search(searchValue)

  onMount(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  })
</script>

<div
  class="fixed inset-0 z-100 px-4"
  role="dialog"
  aria-modal="true"
  aria-label="Vyhledávání knih a autorů"
  tabindex={-1}
  bind:this={dialogEl}
  onkeydown={trapFocus}
>
  <button
    type="button"
    class="fixed inset-0 size-full bg-gradient-to-t from-brand-second-50/97 to-white/97"
    aria-hidden="true"
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
    <iconify-icon icon="ph:x" class="text-3xl" noobserver></iconify-icon>
  </button>
  <div class="block mx-auto max-w-160 mt-20 max-md:mt-16">
    <Command.Root class="w-full" shouldFilter={false}>
      <label class="relative text-5xl max-md:text-2xl">
        <div
          class="absolute bottom-[0.15em] inset-x-0 h-[1px] w-full border-b-2 border-dotted border-brand-first-900"
        ></div>
        <Command.Input
          class="relative w-full bg-transparent pt-4 pr-12 font-alt leading-[1em] text-brand-first-500 text-5xl text-outline-white outline-none placeholder:text-brand-first-500 max-md:pr-9 max-md:text-2xl"
          placeholder="najděte si svou knihu…"
          bind:value={searchValue}
          onkeydown={keepFocusOnInput}
          autofocus
        />
        <iconify-icon
          icon="ph:magnifying-glass"
          class="absolute right-2 bottom-1/2 translate-y-1/2 text-4xl text-brand-first-500 max-md:text-2xl"
          noobserver
        ></iconify-icon>
      </label>
      <Command.List
        class="relative mt-4 h-[calc(100dvh-13rem)] overflow-y-auto max-md:h-[calc(100dvh-10rem)]"
        tabindex={-1}
      >
        <Command.Empty class="px-4 py-6 text-brand-first-500">
          Žádné výsledky.
        </Command.Empty>
        <ul class="px-4 max-md:px-0">
          {#each filteredBooks as book (book.item.link)}
            <li class="py-4">
              <Command.Item
                value={book.item.link}
                keywords={createKeywords(book.item)}
                class="block w-full cursor-pointer border-l-2 border-transparent px-4 outline-none data-[selected]:border-brand-first-500 max-md:px-3"
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
                        'w-20 shadow-2xl max-md:w-14',
                        ITEM_IMAGE_CLASSES[book.item.type],
                      ]}
                    />
                  {:else}
                    <div
                      class="size-20 rounded-full bg-gradient-to-tr from-brand-first-200 to-brand-second-200 max-md:size-14"
                    ></div>
                  {/if}
                  <div>
                    <p
                      class="font-alt text-xl font-bold text-brand-first-500 max-md:text-base"
                    >
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
