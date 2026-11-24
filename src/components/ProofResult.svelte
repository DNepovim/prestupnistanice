<script lang="ts">
  import { getVerdict, type Evaluation } from '@/utils/proofGame/evaluate'
  import { PROOF_ERRORS } from '@/utils/proofGame/text'
  import { tp } from '@/utils/tp'

  type Props = {
    result: Evaluation
  }

  const { result }: Props = $props()

  const stats = $derived([
    { label: tp('Nalezeno'), value: result.found.length },
    { label: tp('Zbytečně označeno'), value: result.falsePositives },
    { label: tp('Přehlédnuto'), value: result.missed.length },
  ])
</script>

<ul class="grid list-none grid-cols-3 gap-4 p-0">
  {#each stats as stat (stat.label)}
    <li class="grid justify-items-center gap-1 text-center">
      <b class="font-head text-[2.4rem] leading-none font-extrabold text-brand-first-700">
        {stat.value}
      </b>
      <span
        class="font-alt text-[0.7rem] leading-[1.2] font-semibold tracking-[0.06em] text-gray-700 uppercase [overflow-wrap:anywhere]"
      >
        {stat.label}
      </span>
    </li>
  {/each}
</ul>
<p class="font-alt text-center text-base leading-[1.4] font-semibold text-gray-900">
  {getVerdict(result, PROOF_ERRORS.length)}
</p>
