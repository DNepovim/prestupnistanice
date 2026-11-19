<script lang="ts">
  export let slug: string
  export let title: string

  const addToCart = () => {
    window.dispatchEvent(new CustomEvent('cart:add', { detail: { slug } }))
  }
</script>

<button
  type="button"
  class="group font-head text-brand-first-700 relative inline-block cursor-pointer pr-9 text-[1.2rem] leading-none font-extrabold whitespace-nowrap z-10"
  aria-label={`Přidat do košíku: ${title}`}
  on:click={addToCart}
>
  Přidat do košíku
  <span
    aria-hidden="true"
    class="absolute top-1/2 right-[2px] block size-2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-current"
  ></span>
  <span
    aria-hidden="true"
    class="absolute top-1/2 right-0 block h-[2px] w-5 -translate-y-1/2 bg-current transition-all duration-500 group-hover:w-full group-focus-visible:w-full"
  ></span>
</button>
