<script lang="ts">
  import { DELIVERY_OPTIONS, PICKUP_LOCATIONS } from '@/configs/shipping'
  import { order, updateCustomer, type Customer } from '@/stores/order'
  import { requiresAddress, type FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import { FIELD_ERROR, FIELD_INPUT, FIELD_LABEL } from './styles'
  import TextField from './TextField.svelte'

  type Props = {
    errorOf: (key: FieldKey) => string | undefined
    touch: (key: FieldKey) => void
  }

  const { errorOf, touch }: Props = $props()

  const CHECKBOX_ROW =
    'font-alt flex cursor-pointer items-start gap-3 text-[0.95rem] leading-snug text-gray-900'
  const CHECKBOX = 'accent-brand-first-700 mt-0.5 size-4 shrink-0'
  const CONSENT_LINK =
    'text-brand-first-700 hover:text-black underline underline-offset-2 transition-colors'

  const needsAddress = $derived(requiresAddress($order))
  const deliveryOption = $derived(
    $order.delivery === null ? undefined : DELIVERY_OPTIONS[$order.delivery],
  )
  const handoverNote = $derived(
    $order.delivery === 'osobni-prevzeti' && $order.pickupLocation !== null
      ? `Osobní převzetí: ${PICKUP_LOCATIONS[$order.pickupLocation]}`
      : $order.balikovnaPoint
        ? `Výdejna Balíkovny: ${$order.balikovnaPoint.name}`
        : undefined,
  )

  const textProps = (
    key: Exclude<
      keyof Customer,
      'isCompany' | 'consentTerms' | 'consentPrivacy' | 'note'
    > &
      FieldKey,
  ) => ({
    name: key,
    value: $order.customer[key],
    error: errorOf(key),
    oninput: (value: string) => {
      updateCustomer({ [key]: value })
    },
    onblur: () => {
      touch(key)
    },
  })
</script>

<div class="flex flex-col gap-8">
  <div class="grid gap-x-4 gap-y-5 min-sm:grid-cols-2">
    <TextField {...textProps('firstname')} label="Jméno" autocomplete="given-name" />
    <TextField {...textProps('surname')} label="Příjmení" autocomplete="family-name" />
    <TextField
      {...textProps('email')}
      label="E-mail"
      type="email"
      autocomplete="email"
      inputmode="email"
    />
    <TextField
      {...textProps('phone')}
      label="Telefon"
      type="tel"
      autocomplete="tel"
      inputmode="tel"
    />
  </div>

  {#if needsAddress}
    <fieldset class="grid gap-x-4 gap-y-5 min-sm:grid-cols-2">
      <legend class={[FIELD_LABEL, 'mb-4']}>{tp('Adresa')}</legend>
      <TextField
        {...textProps('street')}
        label="Ulice a číslo"
        autocomplete="street-address"
        class="min-sm:col-span-2"
      />
      <TextField {...textProps('city')} label="Obec" autocomplete="address-level2" />
      <TextField
        {...textProps('postcode')}
        label="PSČ"
        autocomplete="postal-code"
        inputmode="numeric"
      />
    </fieldset>
  {:else if handoverNote !== undefined && deliveryOption !== undefined}
    <p
      class="font-alt border-brand-first-300/60 border-t border-dashed pt-4 text-[0.9rem] leading-snug text-gray-800"
    >
      {tp(handoverNote)}. {tp('Adresu k doručení nepotřebujeme.')}
    </p>
  {/if}

  <div class="flex flex-col gap-5">
    <label class={CHECKBOX_ROW}>
      <input
        type="checkbox"
        class={CHECKBOX}
        checked={$order.customer.isCompany}
        onchange={(event) => {
          updateCustomer({ isCompany: event.currentTarget.checked })
        }}
      />
      {tp('Nakupuji na firmu')}
    </label>
    {#if $order.customer.isCompany}
      <div class="grid gap-x-4 gap-y-5 min-sm:grid-cols-2">
        <TextField
          {...textProps('companyName')}
          label="Název firmy"
          autocomplete="organization"
          class="min-sm:col-span-2"
        />
        <TextField {...textProps('ico')} label="IČO" inputmode="numeric" />
        <TextField {...textProps('dic')} label="DIČ" optional />
      </div>
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <label class={FIELD_LABEL} for="f-note">
      {tp('Poznámka k objednávce')}
      <span class="text-gray-600 normal-case">({tp('nepovinné')})</span>
    </label>
    <textarea
      id="f-note"
      name="note"
      rows="3"
      class={FIELD_INPUT}
      value={$order.customer.note}
      oninput={(event) => {
        updateCustomer({ note: event.currentTarget.value })
      }}
    ></textarea>
  </div>

  <div class="border-brand-first-300/60 flex flex-col gap-4 border-t border-dashed pt-6">
    <div class="flex flex-col gap-1">
      <label class={CHECKBOX_ROW}>
        <input
          id="f-consentTerms"
          type="checkbox"
          class={CHECKBOX}
          checked={$order.customer.consentTerms}
          aria-invalid={errorOf('consentTerms') === undefined ? undefined : 'true'}
          aria-describedby={errorOf('consentTerms') === undefined
            ? undefined
            : 'e-consentTerms'}
          onchange={(event) => {
            updateCustomer({ consentTerms: event.currentTarget.checked })
            touch('consentTerms')
          }}
        />
        <span
          >{tp('Souhlasím s')}
          <a href="#obchodni-podminky" class={CONSENT_LINK}
            >{tp('obchodními podmínkami')}</a
          ></span
        >
      </label>
      {#if errorOf('consentTerms') !== undefined}
        <p id="e-consentTerms" class={[FIELD_ERROR, 'pl-7']}>
          {tp(errorOf('consentTerms') ?? '')}
        </p>
      {/if}
    </div>
    <div class="flex flex-col gap-1">
      <label class={CHECKBOX_ROW}>
        <input
          id="f-consentPrivacy"
          type="checkbox"
          class={CHECKBOX}
          checked={$order.customer.consentPrivacy}
          aria-invalid={errorOf('consentPrivacy') === undefined ? undefined : 'true'}
          aria-describedby={errorOf('consentPrivacy') === undefined
            ? undefined
            : 'e-consentPrivacy'}
          onchange={(event) => {
            updateCustomer({ consentPrivacy: event.currentTarget.checked })
            touch('consentPrivacy')
          }}
        />
        <span
          >{tp('Souhlasím se')}
          <a href="#zpracovani-udaju" class={CONSENT_LINK}
            >{tp('zpracováním osobních údajů')}</a
          ></span
        >
      </label>
      {#if errorOf('consentPrivacy') !== undefined}
        <p id="e-consentPrivacy" class={[FIELD_ERROR, 'pl-7']}>
          {tp(errorOf('consentPrivacy') ?? '')}
        </p>
      {/if}
    </div>
  </div>
</div>
