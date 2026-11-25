<script lang="ts">
  import { updateQuantity } from '@/stores/cart'
  import { tp } from '@/utils/tp'

  type Props = {
    slug: string
    title: string
    count: number
  }

  const { slug, title, count }: Props = $props()

  const MIN_COUNT = 1
  const MAX_COUNT = 99

  let draft = $derived(String(count))

  const clamp = (value: number) => Math.min(MAX_COUNT, Math.max(MIN_COUNT, value))

  const commit = () => {
    const parsed = Number.parseInt(draft, 10)
    const next = Number.isNaN(parsed) ? count : clamp(parsed)
    draft = String(next)
    updateQuantity(slug, next)
  }

  const BUTTON =
    'border-(--step) text-(--step-ink) hover:bg-[color-mix(in_srgb,var(--step),white_90%)] flex size-6 items-center justify-center border bg-white text-sm leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--step) disabled:cursor-not-allowed disabled:border-(--step)/40 disabled:text-gray-500 disabled:hover:bg-white motion-reduce:transition-none'
</script>

<div role="group" aria-label={tp('Počet kusů')} class="flex items-center">
  <button
    type="button"
    class={BUTTON}
    aria-label={tp('Ubrat kus')}
    disabled={count <= MIN_COUNT}
    onclick={() => {
      updateQuantity(slug, count - 1)
    }}>−</button
  >
  <input
    type="text"
    inputmode="numeric"
    autocomplete="off"
    maxlength="2"
    aria-label={`${tp('Počet kusů')}: ${title}`}
    class="mx-1 w-8 bg-transparent text-right text-sm text-black lining-nums focus-visible:outline-2 focus-visible:outline-(--step)"
    value={draft}
    oninput={(event) => {
      draft = event.currentTarget.value.replace(/\D/g, '')
    }}
    onblur={commit}
    onkeydown={(event) => {
      if (event.key === 'Enter') {
        commit()
      }
      if (event.key === 'Escape') {
        draft = String(count)
      }
    }}
  />
  <span class="mr-2 text-[0.75rem] text-gray-700">{tp('ks')}</span>
  <button
    type="button"
    class={BUTTON}
    aria-label={tp('Přidat kus')}
    disabled={count >= MAX_COUNT}
    onclick={() => {
      updateQuantity(slug, count + 1)
    }}>+</button
  >
</div>
