<script lang="ts">
  import { onMount } from 'svelte'

  const STORAGE_KEY = 'dev:book-bg-alpha'
  const DEFAULT_PERCENT = 70

  const readStored = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      const parsed = Number(stored)
      return stored !== null &&
        Number.isInteger(parsed) &&
        parsed >= 0 &&
        parsed <= 100
        ? parsed
        : DEFAULT_PERCENT
    } catch {
      return DEFAULT_PERCENT
    }
  }

  const writeStored = (percent: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(percent))
    } catch {
      return
    }
  }

  const applyToDocument = (percent: number) => {
    document.body.dataset.bookBgAlpha = ''
    document.documentElement.style.setProperty('--book-bg-alpha', String(percent / 100))
  }

  let percent = $state(DEFAULT_PERCENT)

  onMount(() => {
    percent = readStored()
    applyToDocument(percent)

    return () => {
      delete document.body.dataset.bookBgAlpha
      document.documentElement.style.removeProperty('--book-bg-alpha')
    }
  })

  const handleInput = (event: Event & { currentTarget: HTMLInputElement }) => {
    percent = event.currentTarget.valueAsNumber
    applyToDocument(percent)
    writeStored(percent)
  }
</script>

<div
  class="font-alt fixed bottom-4 left-4 z-40 flex w-[min(15rem,calc(100vw-2rem))] flex-col gap-2 rounded border border-gray-300 bg-white/95 px-3 py-2 text-[0.75rem] text-gray-800 shadow-lg"
>
  <label for="book-bg-alpha" class="flex items-baseline justify-between gap-3">
    <span class="tracking-[0.05em] uppercase">Dočasné: alfa pozadí</span>
    <output for="book-bg-alpha" class="font-liga text-brand-first-700 font-bold">
      {percent} %
    </output>
  </label>
  <input
    id="book-bg-alpha"
    type="range"
    min="0"
    max="100"
    step="1"
    value={percent}
    aria-valuetext="{percent} procent"
    class="accent-brand-first-500 w-full"
    oninput={handleInput}
  />
</div>

<style>
  :global(body[data-book-bg-alpha]) {
    background-color: color-mix(
      in srgb,
      var(--tint-bg, var(--color-brand-first-500)) calc(var(--book-bg-alpha) * 100%),
      transparent
    );
  }
</style>
