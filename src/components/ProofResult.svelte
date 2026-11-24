<script lang="ts">
  import { getVerdict, pluralize, type Evaluation } from '@/utils/proofGame/evaluate'
  import { PROOF_ERRORS } from '@/utils/proofGame/text'
  import { tp } from '@/utils/tp'

  type Props = {
    result: Evaluation
  }

  const { result }: Props = $props()

  const total = PROOF_ERRORS.length
  const missedGroups = $derived([...Map.groupBy(result.missed, (record) => record.tag)])

  const SUMMARY_CLASS =
    'font-alt text-[1.1rem] leading-[1.35] font-semibold text-gray-900 @min-[30rem]:text-[1.25rem]'
  const GROUP_CLASS = 'font-alt text-base leading-[1.4] font-semibold text-gray-900'
  const NOTE_CLASS = 'font-medium text-gray-700'
  const LIST_CLASS = 'grid list-none gap-2 p-0'
  const ITEM_CLASS =
    'font-alt border-l-2 pl-[0.8rem] text-[0.88rem] leading-[1.45] font-medium text-gray-700'
  const TAG_CLASS = 'font-alt mr-[0.2em] font-semibold italic'
</script>

<p class={[SUMMARY_CLASS, '[overflow-wrap:anywhere]']}>
  {tp(`Našli jste ${String(result.found.length)} z ${String(total)} chyb.`)}
  <span class={NOTE_CLASS}>{getVerdict(result.found.length, total)}</span>
</p>

{#if result.missed.length > 0}
  <p class={[GROUP_CLASS, '[overflow-wrap:anywhere]']}>
    {tp(
      `Přehlédli jste ${String(result.missed.length)} ${pluralize(result.missed.length, ['chybu', 'chyby', 'chyb'])}.`,
    )}
    <span class={NOTE_CLASS}>{tp('V textu jsou označené korektorským inkoustem.')}</span>
  </p>
  <ul class={LIST_CLASS}>
    {#each missedGroups as [tag, records] (tag)}
      <li class={[ITEM_CLASS, 'border-brand-second-700']}>
        <b class={[TAG_CLASS, 'text-brand-second-700']}>
          {tag}{records.length > 1 ? ` (${String(records.length)}×)` : ''}
        </b>
        {records[0]?.description}
      </li>
    {/each}
  </ul>
{:else}
  <p class={GROUP_CLASS}>{tp('Nic jste nepřehlédli.')}</p>
{/if}

{#if result.falsePositives > 0}
  <p class={[GROUP_CLASS, '[overflow-wrap:anywhere]']}>
    {tp(
      `Označili jste ${String(result.falsePositives)} ${pluralize(result.falsePositives, ['místo', 'místa', 'míst'])}, kde chyba nebyla.`,
    )}
    <span class={NOTE_CLASS}>{tp('Jsou přeškrtnutá.')}</span>
  </p>
  <ul class={LIST_CLASS}>
    {#each result.decoys as decoy (decoy.id)}
      <li class={[ITEM_CLASS, 'border-gray-300']}>
        <b class={[TAG_CLASS, 'text-gray-700']}>{decoy.tag}</b>
        {decoy.description}
      </li>
    {/each}
    {#if result.hasLooseWords}
      <li class={[ITEM_CLASS, 'border-gray-300']}>
        <b class={[TAG_CLASS, 'text-gray-700']}>{tp('běžný text')}</b>
        {tp('Zbytek označených míst byla bezvadná sazba.')}
      </li>
    {/if}
  </ul>
{:else}
  <p class={GROUP_CLASS}>{tp('Nic navíc jste neoznačili.')}</p>
{/if}
