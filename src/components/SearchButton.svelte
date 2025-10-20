<script lang="ts">
  import 'iconify-icon'

  import SearchModal from './SearchModal.svelte'

  export let data: {
    title: string
    subtitle: string
    image: string
    link: string
    type: 'book' | 'author'
  }[]

  let isOpen = false

  const toggle = (is?: boolean) => (isOpen = is ?? !isOpen)
</script>

<button
  onclick={() => toggle(true)}
  class="font-head hover:text-brand-first-500 cursor-pointer relative text-2xl text-gray-600 no-underline"
>
  <iconify-icon class="-mb-1" icon="ph:magnifying-glass" noobserver></iconify-icon>
  <span
    class="bg-brand-first-500 absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-600 group-hover:w-full"
  ></span>
</button>

{#if isOpen}
  <SearchModal {data} {isOpen} {toggle} />
{/if}

<svelte:window
  onkeydown={(e) => {
    e.key === 'k' && (e.ctrlKey || e.metaKey) && toggle()
    e.key === 'Escape' && toggle(false)
  }}
/>
