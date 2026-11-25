<script lang="ts">
  import { tp } from '@/utils/tp'

  type Props = {
    value: string
    label: string
  }

  const { value, label }: Props = $props()

  const RESET_DELAY = 2000

  let isCopied = $state(false)

  const copy = async () => {
    const isSuccess = await window.navigator.clipboard.writeText(value).then(
      () => true,
      () => false,
    )
    isCopied = isSuccess
    if (isSuccess) {
      window.setTimeout(() => {
        isCopied = false
      }, RESET_DELAY)
    }
  }
</script>

<button
  type="button"
  class="font-alt border border-black bg-transparent px-3 py-1.5 text-xs font-semibold tracking-[0.03em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black motion-reduce:transition-none"
  aria-label={tp(`Kopírovat: ${label}`)}
  onclick={() => {
    void copy()
  }}
>
  {tp(isCopied ? 'Zkopírováno' : 'Kopírovat')}
</button>
<span class="sr-only" role="status">{isCopied ? tp(`${label} je zkopírováno`) : ''}</span>
