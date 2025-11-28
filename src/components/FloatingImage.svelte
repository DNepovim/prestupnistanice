<script lang="ts">
  import FloatingPopup from './FloatingPopup.svelte'
  export let src: string | undefined
  export let alt = ''
  export let offsetX = 16
  export let offsetY = 16
  export let popupClass = 'w-[168px]'
</script>

<FloatingPopup {offsetX} {offsetY} {...$$restProps}>
  <slot />
  <div slot="popup" class={popupClass}>
    {#if src}
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        class="h-auto w-full border border-gray-200 shadow-xl"
      />
    {/if}
  </div>
</FloatingPopup>

