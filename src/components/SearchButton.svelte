<script lang="ts">
  import 'iconify-icon'

  import SearchModal from './SearchModal.svelte'

  type SearchItem = {
    slug: string
    title: string
    subtitle?: string
    image?: { src: string }
    link: string
    type: 'book' | 'author'
  }

  export let data: SearchItem[]

  let isOpen = false
  let triggerEl: HTMLButtonElement | undefined

  const toggle = (is?: boolean) => {
    const next = is ?? !isOpen
    if (!next && isOpen) {
      triggerEl?.focus()
    }
    isOpen = next
  }
</script>

<button
  bind:this={triggerEl}
  onclick={() => {
    toggle(true)
  }}
  class="font-liga font-head hover:text-brand-first-500 cursor-pointer relative text-2xl text-brand-first-500 no-underline"
  aria-label="Vyhledávání"
  aria-haspopup="dialog"
  aria-expanded={isOpen}
>
  <iconify-icon class="-mb-1" icon="ph:magnifying-glass" noobserver aria-hidden="true"
  ></iconify-icon>
  <span
    class="bg-brand-first-500 absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-600 group-hover:w-full"
  ></span>
</button>

{#if isOpen}
  <SearchModal {data} {toggle} />
{/if}

<svelte:window
  onkeydown={(e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      toggle()
    }
    if (e.key === 'Escape') {
      toggle(false)
    }
  }}
/>
