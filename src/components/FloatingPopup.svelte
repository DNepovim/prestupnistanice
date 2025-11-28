<script lang="ts">
  import { cn } from '../utils/cn'

  export let offsetX = 16
  export let offsetY = 16
  let visible = false
  let x = 0
  let y = 0
  let left = '0px'
  let top = '0px'
  let hasMouseMoved = false
  const onEnter = () => {
    if (hasMouseMoved) visible = true
  }
  const onLeave = () => {
    visible = false
  }
  const onMove = (e: MouseEvent) => {
    hasMouseMoved = true
    x = e.clientX + offsetX
    y = e.clientY + offsetY
    left = String(x) + 'px'
    top = String(y) + 'px'
    visible = true
  }
</script>

<div
  role="group"
  on:mouseenter={onEnter}
  on:mouseleave={onLeave}
  on:mousemove={onMove}
  class="relative inline-block"
>
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
