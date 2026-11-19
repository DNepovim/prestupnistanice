<script lang="ts">
  import type { ClassValue } from 'svelte/elements'

  import type { SearchBook } from '@/utils/search/types'

  export let books: SearchBook[]

  let className: ClassValue = ''
  export { className as class }
</script>

<span class={['flex', className]} aria-hidden="true">
  {#each books as book (book.slug)}
    <img
      src={book.cover.src}
      width={book.cover.width}
      height={book.cover.height}
      alt=""
      class="-ml-3 h-full w-auto shadow-[0_0.15rem_0.5rem_rgba(0,0,0,0.25)] first:ml-0"
    />
  {/each}
</span>
