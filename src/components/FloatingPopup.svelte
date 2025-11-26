<script lang="ts">
  import { cn } from '../utils/cn'
  export let offsetX = 16
  export let offsetY = 16
  let visible = false
  let x = 0
  let y = 0
  let left = '0px'
  let top = '0px'
  const onEnter = () => { visible = true }
  const onLeave = () => { visible = false }
  const onMove = (e: MouseEvent) => {
    x = e.clientX + offsetX
    y = e.clientY + offsetY
    left = String(x) + 'px'
    top = String(y) + 'px'
  }
</script>

<div on:mouseenter={onEnter} on:mouseleave={onLeave} on:mousemove={onMove} class="relative inline-block">
  <slot />
  {#if visible}
    <div
      class={cn(
        'pointer-events-none fixed z-50 shadow-2xl transition-opacity opacity-100',
      )}
      style={`left:${left};top:${top}`}
      aria-hidden={!visible}
    >
      <slot name="popup" />
    </div>
  {/if}
</div>

