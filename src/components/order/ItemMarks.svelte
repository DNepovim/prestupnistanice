<script lang="ts">
  type Props = {
    hasCut: boolean
  }

  const { hasCut }: Props = $props()

  const CUT_MARK =
    'absolute -right-(--mk-s) -left-(--mk-s) top-[calc(100%+1rem)] h-0 before:absolute before:left-0 before:w-(--mk-l) before:border-t after:absolute after:right-0 after:w-(--mk-l) after:border-t'

  const CORNER =
    'absolute size-(--mk-s) before:absolute before:bottom-0 before:left-0 before:w-(--mk-l) before:border-t after:absolute after:top-0 after:right-0 after:h-(--mk-l) after:border-l'
</script>

<span
  aria-hidden="true"
  class="pointer-events-none absolute inset-0 text-gray-400/70 [--mk-g:0.35rem] [--mk-l:0.8rem] [--mk-s:calc(var(--mk-g)+var(--mk-l))]"
>
  <span class={[CORNER, '-top-(--mk-s) -left-(--mk-s)']}></span>
  <span class={[CORNER, '-bottom-(--mk-s) -left-(--mk-s) -scale-y-100']}></span>
  <span class={[CORNER, '-right-(--mk-s) -bottom-(--mk-s) -scale-100']}></span>
  {#if hasCut}
    <span class={CUT_MARK}></span>
  {/if}
</span>
