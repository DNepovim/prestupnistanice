<script lang="ts">
  import { DELIVERY_OPTIONS, PAYMENT_OPTIONS, PICKUP_LOCATIONS } from '@/configs/shipping'
  import { order, type OrderStep } from '@/stores/order'
  import type { FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { FIELD_LABELS } from './fieldLabels'
  import { FIELD_LABEL, TEXT_BUTTON } from './styles'

  type Props = {
    errors: Partial<Record<FieldKey, string>>
    ongoto: (step: OrderStep) => void
  }

  const { errors, ongoto }: Props = $props()

  const customer = $derived($order.customer)
  const deliveryName = $derived(
    $order.delivery === null ? undefined : DELIVERY_OPTIONS[$order.delivery].name,
  )
  const paymentName = $derived(
    $order.payment === null ? undefined : PAYMENT_OPTIONS[$order.payment].name,
  )
  const handover = $derived(
    $order.pickupLocation === null
      ? $order.balikovnaPoint?.name
      : PICKUP_LOCATIONS[$order.pickupLocation],
  )
  const address = $derived(
    [customer.street, `${customer.postcode} ${customer.city}`.trim()]
      .filter((part) => part.trim() !== '')
      .join(', '),
  )
  const company = $derived(
    customer.isCompany
      ? [
          customer.companyName,
          `IČO ${customer.ico}`,
          customer.dic === '' ? '' : `DIČ ${customer.dic}`,
        ]
          .filter((part) => part.trim() !== '' && part !== 'IČO ')
          .join(' · ')
      : '',
  )

  const rows = $derived([
    {
      label: 'Doprava',
      step: 2 as const,
      value: [deliveryName, handover].filter((part) => part !== undefined).join(' · '),
      problem: errors.delivery ?? errors.point ?? errors.pickupLocation,
    },
    {
      label: 'Platba',
      step: 2 as const,
      value: paymentName ?? '',
      problem: errors.payment,
    },
    {
      label: 'Odběratel',
      step: 3 as const,
      value: [
        `${customer.firstname} ${customer.surname}`.trim(),
        customer.email,
        customer.phone,
      ]
        .filter((part) => part !== '')
        .join(' · '),
      problem: errors.firstname ?? errors.surname ?? errors.email ?? errors.phone,
    },
    {
      label: 'Adresa',
      step: 3 as const,
      value: address,
      problem: errors.street ?? errors.city ?? errors.postcode,
    },
    ...(customer.isCompany
      ? [
          {
            label: 'Firma',
            step: 3 as const,
            value: company,
            problem: errors.companyName ?? errors.ico ?? errors.dic,
          },
        ]
      : []),
    ...(customer.note.trim() === ''
      ? []
      : [
          {
            label: 'Poznámka',
            step: 3 as const,
            value: customer.note,
            problem: undefined,
          },
        ]),
    {
      label: 'Souhlasy',
      step: 3 as const,
      value: [
        customer.consentTerms ? FIELD_LABELS.consentTerms : '',
        customer.consentPrivacy ? FIELD_LABELS.consentPrivacy : '',
      ]
        .filter((part) => part !== '')
        .join(' · '),
      problem: errors.consentTerms ?? errors.consentPrivacy,
    },
  ])
</script>

<dl class="flex flex-col">
  {#each rows as row (row.label)}
    <div
      class="border-brand-first-300/60 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-dashed py-4 first:border-t-0"
    >
      <dt class={[FIELD_LABEL, 'col-span-2']}>{tp(row.label)}</dt>
      <dd class="font-alt text-base leading-snug text-gray-900">
        {#if row.value !== ''}
          {tp(row.value)}
        {:else}
          <span class="text-error">{tp(row.problem ?? 'Nevyplněno')}</span>
        {/if}
        {#if row.value !== '' && row.problem !== undefined}
          <span class="text-error block text-[0.8rem]">{tp(row.problem)}</span>
        {/if}
      </dd>
      <dd>
        <button
          type="button"
          class={TEXT_BUTTON}
          onclick={() => {
            ongoto(row.step)
          }}
        >
          {tp('Upravit')}<span class="sr-only"> {tp(row.label.toLowerCase())}</span>
        </button>
      </dd>
    </div>
  {/each}
</dl>
