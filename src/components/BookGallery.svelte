<script lang="ts">
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

  let dialog: HTMLDialogElement | undefined
  let current = 0
  let dragStartX: number | undefined

  $: fitsInRow = items.length <= MAX_UNSCROLLED
  $: item = items[current]

  const open = (index: number) => {
    current = index
    dialog?.showModal()
  }

  const close = () => {
    dialog?.close()
  }

  const step = (delta: number) => {
    current = (current + delta + items.length) % items.length
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!dialog?.open) {
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
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
      step(delta < 0 ? 1 : -1)
    }
  }

  const onDialogClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      close()
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
        on:click={() => {
          open(index)
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
      class="flex size-full flex-col items-center justify-center gap-4 p-4 min-md:p-10"
      role="presentation"
      on:click={onDialogClick}
      on:pointerdown={onPointerDown}
      on:pointerup={onPointerUp}
      on:pointercancel={() => (dragStartX = undefined)}
    >
      <img
        src={item.full}
        alt={item.alt}
        width={item.fullWidth}
        height={item.fullHeight}
        draggable="false"
        class="max-h-[calc(100%-3rem)] max-w-full object-contain select-none"
      />
      <p class="font-alt text-xs text-white/70" aria-live="polite">
        {current + 1} / {items.length}
      </p>
    </div>
    <button
      type="button"
      class="absolute top-3 right-3 border border-white/40 px-3 py-2 text-lg leading-none text-white hover:bg-white/10"
      aria-label="Zavřít"
      on:click={close}
    >
      <span aria-hidden="true">✕</span>
    </button>
    {#if items.length > 1}
      <button
        type="button"
        class="absolute top-1/2 left-3 -translate-y-1/2 border border-white/40 px-3 py-4 text-xl leading-none text-white hover:bg-white/10"
        aria-label="Předchozí fotografie"
        on:click={() => {
          step(-1)
        }}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        class="absolute top-1/2 right-3 -translate-y-1/2 border border-white/40 px-3 py-4 text-xl leading-none text-white hover:bg-white/10"
        aria-label="Další fotografie"
        on:click={() => {
          step(1)
        }}
      >
        <span aria-hidden="true">→</span>
      </button>
    {/if}
  {/if}
</dialog>
