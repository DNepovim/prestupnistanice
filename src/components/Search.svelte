<script lang="ts">
  import 'iconify-icon'

  import { tick } from 'svelte'

  import { cn } from '../utils/cn'

  let isOpen = false
  let inputEl: HTMLInputElement

  const open = async () => {
    isOpen = true
    await tick()
    inputEl.focus()
  }

  const close = () => (isOpen = false)
</script>

<button
  onclick={open}
  class="font-head hover:text-brand-first-500 cursor-pointer relative text-2xl text-gray-600 no-underline"
>
  Hledat
  <iconify-icon class="-mb-1" icon="ph:magnifying-glass" noobserver></iconify-icon>
  <span
    class="bg-brand-first-500 absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-600 group-hover:w-full"
  ></span>
</button>

<div class={cn('fixed inset-0 bg-white/90 z-100 hidden', isOpen && 'block')}>
  <div class="block mx-auto w-200 mt-40 text-5xl fixed top-20 right-1/2 translate-x-1/2">
    <div
      class="absolute bottom-[0.2em] inset-x-0 h-[1px] w-full bg-brand-first-900"
    ></div>
    <input
      id="search"
      class="relative pt-4 text-outline-white leading-[1em] text-brand-first-500 w-full font-alt bg-transparent outline-none"
      type="text"
      placeholder="Hledat knihy a autory..."
      bind:this={inputEl}
      onblur={close}
    />
    <iconify-icon
      icon="ph:magnifying-glass"
      class="absolute right-2 text-4xl bottom-1/2 translate-y-1/2 text-brand-first-500"
      noobserver
    ></iconify-icon>
  </div>
</div>
