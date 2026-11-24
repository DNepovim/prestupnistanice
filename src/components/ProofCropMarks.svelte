<script lang="ts">
  type Side = 'left' | 'right'

  type Props = {
    side: Side
  }

  const { side }: Props = $props()

  const CORNERS = [
    {
      key: 'tl',
      isInnerOn: 'right',
      class: 'top-[calc(-1*var(--cm-s))] left-[calc(-1*var(--cm-s))]',
    },
    {
      key: 'tr',
      isInnerOn: 'left',
      class: 'top-[calc(-1*var(--cm-s))] right-[calc(-1*var(--cm-s))] -scale-x-100',
    },
    {
      key: 'bl',
      isInnerOn: 'right',
      class: 'bottom-[calc(-1*var(--cm-s))] left-[calc(-1*var(--cm-s))] -scale-y-100',
    },
    {
      key: 'br',
      isInnerOn: 'left',
      class: 'right-[calc(-1*var(--cm-s))] bottom-[calc(-1*var(--cm-s))] -scale-100',
    },
  ] as const satisfies readonly { key: string; isInnerOn: Side; class: string }[]
</script>

{#each CORNERS as corner (corner.key)}
  <i
    aria-hidden="true"
    class={[
      'text-brand-first-300/60 pointer-events-none absolute size-[var(--cm-s)]',
      'before:absolute before:bottom-0 before:left-0 before:w-[var(--cm-l)] before:border-t before:border-current',
      'after:absolute after:top-0 after:right-0 after:h-[var(--cm-l)] after:border-l after:border-current',
      corner.class,
      corner.isInnerOn === side && '@min-[40rem]:hidden',
    ]}
  ></i>
{/each}
