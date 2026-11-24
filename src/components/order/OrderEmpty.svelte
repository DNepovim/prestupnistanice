<script lang="ts">
  import { routes } from '@/routes'
  import { tp } from '@/utils/tp'
</script>

<div class="flex flex-col items-start gap-5 py-8">
  <p
    class="font-alt text-brand-first-700 text-[0.7rem] leading-none tracking-[0.1em] uppercase"
  >
    {tp('Košík · 0 ks')}
  </p>
  <h2
    class="font-head text-brand-first-500 text-[2.4rem] leading-[1.05] font-extrabold tracking-[-0.02em]"
  >
    {tp('Košík je prázdný')}
  </h2>
  <p class="font-alt max-w-[34rem] text-base leading-[1.5] text-gray-800 italic">
    {tp('Zatím jste do něj nevložili žádnou knihu. Vyberte si z naší nabídky.')}
  </p>
  <a
    href={routes.books.list()}
    data-arrow-link
    class="group font-alt text-brand-first-700 relative mr-7 inline-block text-[0.8rem] tracking-[0.1em] uppercase"
  >
    {tp('Naše knihy')}
    <span
      aria-hidden="true"
      data-arrow="right"
      class="border-current absolute top-1/2 -right-7 block size-2 -translate-y-1/2 rotate-45 border-t border-r"
    ></span>
    <span
      aria-hidden="true"
      data-arrow="right"
      class="bg-current absolute top-1/2 -right-[29px] block h-px w-4 -translate-y-1/2 transition-all duration-500 group-hover:w-[calc(100%+2rem)] group-focus-visible:w-[calc(100%+2rem)]"
    ></span>
  </a>
</div>
