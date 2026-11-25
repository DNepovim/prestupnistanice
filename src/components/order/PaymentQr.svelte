<script lang="ts">
  import { tp } from '@/utils/tp'

  type Props = {
    payload: string
  }

  const { payload }: Props = $props()

  const SIZE = 25
  const FINDER = 7
  const MODULE = 4
  const HASH_MULTIPLIER = 31
  const HASH_MODULO = 2 ** 31
  const ARIA_LABEL = 'Ukázkový QR kód, platba zatím nefunguje'

  const isFinderModule = (x: number, y: number) => {
    const inCorner = (cx: number, cy: number) =>
      x >= cx && x < cx + FINDER && y >= cy && y < cy + FINDER
    return inCorner(0, 0) || inCorner(SIZE - FINDER, 0) || inCorner(0, SIZE - FINDER)
  }

  const isFinderFilled = (x: number, y: number) => {
    const local = (value: number) =>
      value >= SIZE - FINDER ? value - (SIZE - FINDER) : value
    const lx = local(x)
    const ly = local(y)
    const isEdge = lx === 0 || ly === 0 || lx === FINDER - 1 || ly === FINDER - 1
    const isCore = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
    return isEdge || isCore
  }

  const seed = $derived(
    Array.from(payload).reduce(
      (hash, char) => (hash * HASH_MULTIPLIER + char.charCodeAt(0)) % HASH_MODULO,
      7,
    ),
  )

  const isFilled = (x: number, y: number) =>
    isFinderModule(x, y)
      ? isFinderFilled(x, y)
      : ((seed + x * 131 + y * 197 + x * y * 17) % 7) % 2 === 0 &&
        (x * 3 + y * 5 + seed) % 5 !== 0

  const modules = $derived(
    Array.from({ length: SIZE * SIZE }, (_, index) => ({
      x: index % SIZE,
      y: Math.floor(index / SIZE),
    })).filter(({ x, y }) => isFilled(x, y)),
  )
</script>

<figure class="m-0 flex flex-col items-start gap-2">
  <svg
    role="img"
    aria-label={ARIA_LABEL}
    viewBox={`0 0 ${String(SIZE * MODULE)} ${String(SIZE * MODULE)}`}
    class="size-40 bg-white p-2 shadow-[0_0.2rem_0.9rem_rgba(0,0,0,0.18)]"
    shape-rendering="crispEdges"
  >
    {#each modules as module (`${String(module.x)}-${String(module.y)}`)}
      <rect
        x={module.x * MODULE}
        y={module.y * MODULE}
        width={MODULE}
        height={MODULE}
        fill="black"
      />
    {/each}
  </svg>
  <figcaption class="font-alt max-w-40 text-[0.7rem] leading-[1.3] text-black">
    {tp('Ukázkový QR kód, platba zatím nefunguje.')}
  </figcaption>
</figure>
