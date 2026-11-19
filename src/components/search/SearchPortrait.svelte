<script lang="ts">
  import type { ClassValue } from 'svelte/elements'

  import type { SearchAuthor } from '@/utils/search/types'

  export let author: Pick<SearchAuthor, 'portrait' | 'initials'>
  export let revealed = false

  let className: ClassValue = ''
  export { className as class }
</script>

<span
  class={[
    'bg-brand-first-100 relative isolate flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full',
    className,
  ]}
>
  {#if author.portrait}
    <img
      src={author.portrait.src}
      width={author.portrait.width}
      height={author.portrait.height}
      alt=""
      class={[
        'size-full object-cover object-[50%_25%] mix-blend-multiply transition-[filter] duration-500',
        revealed
          ? 'brightness-100 contrast-100 grayscale-0'
          : 'brightness-[1.2] contrast-[0.92] grayscale group-hover/person:brightness-100 group-hover/person:contrast-100 group-hover/person:grayscale-0',
      ]}
    />
  {:else}
    <span class="font-head text-brand-first-700 font-extrabold" aria-hidden="true">
      {author.initials}
    </span>
  {/if}
</span>
