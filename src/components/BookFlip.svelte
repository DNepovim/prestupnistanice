<script lang="ts">
  import { onMount, tick } from 'svelte'

  type Page = { src: string; width: number; height: number }
  type Direction = 'next' | 'prev'

  export let pages: Page[]
  export let title: string
  export let startsWithSpread = false

  const TURN_MS = 700
  const SWIPE_THRESHOLD_PX = 40
  const TURN_DELTA = { next: 1, prev: -1 } as const satisfies Record<Direction, number>

  let position = 0
  let turning: Direction | undefined
  let flipped = false
  let single = false
  let reducedMotion = false
  let dragStartX: number | undefined
  let root: HTMLDivElement | undefined

  $: shift = startsWithSpread ? 1 : 0
  $: leftOf = (spread: number) => pages[spread * 2 - 1 + shift]
  $: rightOf = (spread: number) => pages[spread * 2 + shift]
  const pageNumber = (page: Page) => pages.indexOf(page) + 1

  $: ratio = pages[0] ? pages[0].width / pages[0].height : 2 / 3
  $: maxPosition = single ? pages.length - 1 : Math.floor((pages.length - shift) / 2)
  $: target = turning ? position + TURN_DELTA[turning] : position
  $: baseLeft = leftOf(turning === 'prev' ? target : position)
  $: baseRight = rightOf(turning === 'next' ? target : position)
  $: leafFront = rightOf(turning === 'next' ? position : target)
  $: leafBack = leftOf(turning === 'next' ? target : position)
  $: angle = flipped === (turning === 'next') ? -180 : 0
  $: label = single
    ? `strana ${String(position + 1)} z ${String(pages.length)}`
    : position === 0 && !startsWithSpread
      ? `strana 1 z ${String(pages.length)}`
      : `strany ${String(position * 2 + shift)}–${String(Math.min(position * 2 + shift + 1, pages.length))} z ${String(pages.length)}`

  const turn = async (direction: Direction) => {
    const next = position + TURN_DELTA[direction]
    if (turning || next < 0 || next > maxPosition) {
      return
    }
    if (single || reducedMotion) {
      position = next
      return
    }
    turning = direction
    await tick()
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        flipped = true
      })
    })
    setTimeout(() => {
      position = next
      turning = undefined
      flipped = false
    }, TURN_MS)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!root?.contains(document.activeElement)) {
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      void turn('next')
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      void turn('prev')
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
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      return
    }
    void turn(delta < 0 ? 'next' : 'prev')
  }

  onMount(() => {
    const narrow = window.matchMedia('(max-width: 639px)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      single = narrow.matches
      reducedMotion = motion.matches
      position = 0
    }
    sync()
    narrow.addEventListener('change', sync)
    motion.addEventListener('change', sync)
    return () => {
      narrow.removeEventListener('change', sync)
      motion.removeEventListener('change', sync)
    }
  })
</script>

<svelte:window on:keydown={onKeyDown} />

{#if pages.length > 0}
  <div bind:this={root} class="flex flex-col items-center gap-5">
    <div class="flex w-full items-center justify-center gap-2 min-sm:gap-5">
      <button
        type="button"
        class="border-white/70 text-white flex shrink-0 items-center justify-center border px-2 py-3 text-lg font-semibold disabled:opacity-30 min-sm:px-4"
        disabled={position === 0}
        aria-label="Předchozí strana"
        on:click={() => turn('prev')}
      >
        <span aria-hidden="true">←</span>
      </button>
      <div
        role="group"
        aria-label={`Ukázka z knihy ${title}. Listujte tlačítky nebo tažením za okraj stránky.`}
        class="relative min-w-0 flex-1 touch-pan-y select-none [perspective:2400px]"
        style:aspect-ratio={single ? ratio : ratio * 2}
        on:pointerdown={onPointerDown}
        on:pointerup={onPointerUp}
        on:pointercancel={() => (dragStartX = undefined)}
      >
        {#if single}
          {#each pages as page, index (page.src)}
            {#if index === position}
              <img
                src={page.src}
                width={page.width}
                height={page.height}
                alt={`Strana ${String(index + 1)}`}
                draggable="false"
                class="size-full bg-white object-cover shadow-xl"
              />
            {/if}
          {/each}
        {:else}
          <div
            class="bg-brand-first-50 absolute top-0 left-0 h-full w-1/2 shadow-[inset_-1.2rem_0_1.2rem_-1rem_rgba(0,0,0,0.2),-0.2rem_0.2rem_1rem_rgba(0,0,0,0.12)]"
          >
            {#if baseLeft}
              <img
                src={baseLeft.src}
                width={baseLeft.width}
                height={baseLeft.height}
                alt={`Strana ${String(pageNumber(baseLeft))}`}
                draggable="false"
                class="size-full bg-white object-cover"
              />
            {/if}
          </div>
          <div
            class="bg-brand-first-50 absolute top-0 left-1/2 h-full w-1/2 shadow-[inset_1.2rem_0_1.2rem_-1rem_rgba(0,0,0,0.2),0.2rem_0.2rem_1rem_rgba(0,0,0,0.12)]"
          >
            {#if baseRight}
              <img
                src={baseRight.src}
                width={baseRight.width}
                height={baseRight.height}
                alt={`Strana ${String(pageNumber(baseRight))}`}
                draggable="false"
                class="size-full bg-white object-cover"
              />
            {/if}
          </div>
          {#if turning}
            <div
              class="absolute top-0 left-1/2 h-full w-1/2 origin-left transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
              style:transform={`rotateY(${String(angle)}deg)`}
            >
              <div class="absolute inset-0 [backface-visibility:hidden]">
                {#if leafFront}
                  <img
                    src={leafFront.src}
                    width={leafFront.width}
                    height={leafFront.height}
                    alt=""
                    draggable="false"
                    class="size-full bg-white object-cover"
                  />
                {/if}
              </div>
              <div
                class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
              >
                {#if leafBack}
                  <img
                    src={leafBack.src}
                    width={leafBack.width}
                    height={leafBack.height}
                    alt=""
                    draggable="false"
                    class="size-full bg-white object-cover"
                  />
                {/if}
              </div>
            </div>
          {/if}
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent"
          ></div>
        {/if}
      </div>
      <button
        type="button"
        class="border-white/70 text-white flex shrink-0 items-center justify-center border px-2 py-3 text-lg font-semibold disabled:opacity-30 min-sm:px-4"
        disabled={position >= maxPosition}
        aria-label="Další strana"
        on:click={() => turn('next')}
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
    <span
      class="font-alt text-white text-[0.65rem] font-medium"
      aria-live="polite"
    >
      {label}
    </span>
  </div>
{/if}
