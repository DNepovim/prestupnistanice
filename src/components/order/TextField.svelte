<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  import { tp } from '@/utils/tp'

  import { FIELD_ERROR, FIELD_INPUT, FIELD_LABEL } from './styles'

  type Props = {
    name: string
    label: string
    value: string
    error?: string
    optional?: boolean
    type?: HTMLInputAttributes['type']
    autocomplete?: HTMLInputAttributes['autocomplete']
    inputmode?: HTMLInputAttributes['inputmode']
    class?: string
    oninput: (value: string) => void
    onblur: () => void
  }

  const {
    name,
    label,
    value,
    error,
    optional = false,
    type = 'text',
    autocomplete,
    inputmode,
    class: className,
    oninput,
    onblur,
  }: Props = $props()
</script>

<div class={['flex flex-col gap-2', className]}>
  <label class={FIELD_LABEL} for={`f-${name}`}>
    {tp(label)}
    {#if optional}
      <span class="text-gray-600 normal-case">({tp('nepovinné')})</span>
    {/if}
  </label>
  <input
    id={`f-${name}`}
    {name}
    {type}
    {value}
    {autocomplete}
    {inputmode}
    class={FIELD_INPUT}
    aria-invalid={error === undefined ? undefined : 'true'}
    aria-describedby={error === undefined ? undefined : `e-${name}`}
    oninput={(event) => {
      oninput(event.currentTarget.value)
    }}
    {onblur}
  />
  {#if error !== undefined}
    <p id={`e-${name}`} class={FIELD_ERROR}>{tp(error)}</p>
  {/if}
</div>
