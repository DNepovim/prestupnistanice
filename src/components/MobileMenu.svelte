<script lang="ts">
  import 'iconify-icon'

  type NavItem = {
    link: string
    label: string
  }

  export let navigations: NavItem[]

  let isOpen = false
  let containerEl: HTMLElement | undefined

  const close = () => {
    isOpen = false
  }

  const onWindowPointerdown = (event: PointerEvent) => {
    if (!isOpen || !containerEl) return
    if (event.target instanceof Node && containerEl.contains(event.target)) return
    close()
  }
</script>

<svelte:window
  onkeydown={(event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      close()
    }
  }}
  onpointerdown={onWindowPointerdown}
/>

<div class="relative" bind:this={containerEl}>
  <button
    type="button"
    class="font-alt flex cursor-pointer items-center gap-2 text-xs tracking-wider text-black uppercase"
    aria-expanded={isOpen}
    aria-controls="mobile-menu"
    onclick={() => {
      isOpen = !isOpen
    }}
  >
    obsah
    <iconify-icon
      icon={isOpen ? 'ph:x' : 'ph:list'}
      class="text-2xl"
      noobserver
      aria-hidden="true"
    ></iconify-icon>
  </button>

  {#if isOpen}
    <nav
      id="mobile-menu"
      aria-label="Hlavní navigace"
      class="absolute top-full right-0 z-50 mt-3 flex min-w-48 flex-col rounded-md border border-black bg-white py-2 shadow-lg"
    >
      {#each navigations as item (item.link)}
        <a
          href={item.link}
          class="font-alt px-5 py-2 text-black no-underline transition-colors hover:bg-black hover:text-white"
          onclick={close}
        >
          {item.label}
        </a>
      {/each}
    </nav>
  {/if}
</div>
