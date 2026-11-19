<script lang="ts">
  import { tick } from 'svelte'

  type Item = {
    alt: string
    ratio: number
    thumb: string
    full: string
    fullWidth: number
    fullHeight: number
  }

  export let items: Item[]

  const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'] as const
  const MAX_UNSCROLLED = 3
  const MAX_FRAME_WIDTH_REM = 24
  const SWIPE_THRESHOLD_PX = 40
  const OPEN_DURATION_MS = 450
  const CLOSE_DURATION_MS = 200
  const STEP_DURATION_MS = 300
  const STEP_OFFSET_PX = 48
  const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

  let dialog: HTMLDialogElement | undefined
  let lightboxImage: HTMLElement | undefined
  let loadedUrls: string[] = []
  let requestedUrls: string[] = []
  let current = 0
  let dragStartX: number | undefined

  $: fitsInRow = items.length <= MAX_UNSCROLLED
  $: item = items[current]

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const preload = (index: number) => {
    const url = items[(index + items.length) % items.length]?.full
    if (!url || requestedUrls.includes(url)) {
      return
    }
    requestedUrls = [...requestedUrls, url]
    const image = document.createElement('img')
    image.onload = () => {
      loadedUrls = [...loadedUrls, url]
    }
    image.src = url
  }

  const preloadAround = (index: number) => {
    ;[index, index + 1, index - 1].forEach(preload)
  }

  const open = async (index: number, trigger: HTMLElement) => {
    current = index
    preloadAround(index)
    dialog?.showModal()
    await tick()
    const thumb = trigger.querySelector('img')
    if (!dialog || !lightboxImage || !thumb || prefersReducedMotion()) {
      return
    }
    const from = thumb.getBoundingClientRect()
    const to = lightboxImage.getBoundingClientRect()
    const scale = from.width / to.width
    const dx = from.left + from.width / 2 - (to.left + to.width / 2)
    const dy = from.top + from.height / 2 - (to.top + to.height / 2)
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: OPEN_DURATION_MS,
      easing: 'ease-out',
    })
    lightboxImage.animate(
      [
        {
          transform: `translate(${String(dx)}px, ${String(dy)}px) scale(${String(scale)})`,
        },
        { transform: 'none' },
      ],
      { duration: OPEN_DURATION_MS, easing: EASE_OUT },
    )
  }

  const close = async () => {
    if (!dialog) {
      return
    }
    if (!prefersReducedMotion()) {
      await dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: CLOSE_DURATION_MS,
        easing: 'ease-in',
      }).finished
    }
    dialog.close()
  }

  const step = async (delta: number) => {
    current = (current + delta + items.length) % items.length
    preloadAround(current)
    await tick()
    if (!lightboxImage || prefersReducedMotion()) {
      return
    }
    lightboxImage.animate(
      [
        { opacity: 0, transform: `translateX(${String(delta * STEP_OFFSET_PX)}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: STEP_DURATION_MS, easing: EASE_OUT },
    )
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!dialog?.open) {
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      void step(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      void step(-1)
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    dragStartX = event.clientX
  }

  const onPointerUp = (event: PointerEvent) => {
    if (dragStartX === undefined) {
      return
    }
    const delta = event.clientX - dragStartX
    dragStartX = undefined
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      void step(delta < 0 ? 1 : -1)
    }
  }

  const onDialogClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      void close()
    }
  }
</script>

<svelte:window on:keydown={onKeyDown} />

<ul
  style:max-width={fitsInRow
    ? `${String(items.length * MAX_FRAME_WIDTH_REM)}rem`
    : undefined}
  class={[
    'flex items-start gap-5 py-4 min-md:gap-7',
    !fitsInRow &&
      '-mx-[0.9rem] snap-x overflow-x-auto px-[0.9rem] min-md:-mx-[2.6rem] min-md:px-[2.6rem]',
  ]}
>
  {#each items as entry, index (entry.thumb)}
    <li
      style:flex={fitsInRow ? `${entry.ratio.toFixed(4)} 1 0` : undefined}
      class={fitsInRow ? 'min-w-0' : 'shrink-0 snap-center'}
    >
      <button
        type="button"
        aria-label={`Zvětšit: ${entry.alt}`}
        class={[
          'border-brand-first-500 block cursor-zoom-in border bg-white p-1 pb-5 shadow-[0_0.2rem_0.7rem_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.03] hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 min-md:p-1.5 min-md:pb-7',
          !fitsInRow && 'w-fit',
          TILTS[index % TILTS.length],
        ]}
        on:click={(event) => {
          void open(index, event.currentTarget)
        }}
      >
        <img
          src={entry.thumb}
          alt={entry.alt}
          loading="lazy"
          draggable="false"
          class={[
            'border-brand-first-500 border',
            fitsInRow ? 'h-auto w-full' : 'h-[13rem] w-auto max-w-none min-md:h-[17rem]',
          ]}
        />
      </button>
    </li>
  {/each}
</ul>

<dialog
  bind:this={dialog}
  aria-label="Prohlížeč fotografií"
  class="m-0 size-full max-h-none max-w-none bg-black/90 p-0 backdrop:bg-transparent"
  on:click={onDialogClick}
>
  {#if item}
    <div
      class="flex size-full flex-col items-center justify-center p-4 min-md:p-10"
      role="presentation"
      on:click={onDialogClick}
      on:pointerdown={onPointerDown}
      on:pointerup={onPointerUp}
      on:pointercancel={() => (dragStartX = undefined)}
    >
      {#if loadedUrls.includes(item.full)}
        <img
          bind:this={lightboxImage}
          src={item.full}
          alt={item.alt}
          width={item.fullWidth}
          height={item.fullHeight}
          draggable="false"
          class="max-h-full max-w-full object-contain select-none"
        />
      {:else}
        <div
          bind:this={lightboxImage}
          role="status"
          aria-label="Načítání fotografie"
          style:aspect-ratio={item.fullWidth / item.fullHeight}
          style:width={`min(100%, calc((100dvh - 5rem) * ${String(item.fullWidth / item.fullHeight)}))`}
          class="animate-pulse bg-white/10"
        ></div>
      {/if}
    </div>
    <button
      type="button"
      class="absolute top-3 right-3 border border-white/40 px-3 py-2 text-lg leading-none text-white hover:bg-white/10"
      aria-label="Zavřít"
      on:click={() => {
        void close()
      }}
    >
      <span aria-hidden="true">✕</span>
    </button>
    {#if items.length > 1}
      <button
        type="button"
        class="absolute top-1/2 left-3 -translate-y-1/2 border border-white/40 px-3 py-4 text-xl leading-none text-white hover:bg-white/10"
        aria-label="Předchozí fotografie"
        on:click={() => {
          void step(-1)
        }}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        class="absolute top-1/2 right-3 -translate-y-1/2 border border-white/40 px-3 py-4 text-xl leading-none text-white hover:bg-white/10"
        aria-label="Další fotografie"
        on:click={() => {
          void step(1)
        }}
      >
        <span aria-hidden="true">→</span>
      </button>
    {/if}
  {/if}
</dialog>
