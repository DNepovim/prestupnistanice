<script lang="ts">
  import { order, updateCustomer, type Customer } from '@/stores/order'
  import { formatPostcode } from '@/utils/order/format'
  import { requiresAddress, type FieldKey } from '@/utils/order/validation'
  import { tp } from '@/utils/tp'

  import Reveal from './Reveal.svelte'
  import { FIELD_ERROR, FIELD_INPUT, FIELD_LABEL } from './styles'
  import TextField from './TextField.svelte'

  type Props = {
    errorOf: (key: FieldKey) => string | undefined
    touch: (key: FieldKey) => void
  }

  const { errorOf, touch }: Props = $props()

  const CHECKBOX_ROW =
    'font-alt flex cursor-pointer items-start gap-3 text-[0.95rem] leading-snug text-gray-900'
  const CHECKBOX = 'accent-(--step) mt-0.5 size-4 shrink-0'
  const CONSENT_LINK =
    'text-(--step-ink) hover:text-black underline underline-offset-2 transition-colors'

  const needsAddress = $derived(requiresAddress($order))
  const textProps = (
    key: Exclude<
      keyof Customer,
      'needsInvoice' | 'isCompany' | 'consentTerms' | 'consentPrivacy' | 'note'
    > &
      FieldKey,
  ) => ({
    name: key,
    value:
      key === 'postcode' ? formatPostcode($order.customer[key]) : $order.customer[key],
    error: errorOf(key),
    oninput: (value: string) => {
      updateCustomer({ [key]: key === 'postcode' ? formatPostcode(value) : value })
    },
    onblur: () => {
      touch(key)
    },
  })
</script>

<div class="flex flex-col">
  <div class="grid gap-x-4 gap-y-1 min-sm:grid-cols-2">
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
      optional
      type="tel"
      autocomplete="tel"
      inputmode="tel"
    />
  </div>

  <div class="flex flex-wrap gap-x-8 gap-y-3 pt-4">
    <label class={CHECKBOX_ROW}>
      <input
        type="checkbox"
        class={CHECKBOX}
        checked={$order.customer.needsInvoice}
        onchange={(event) => {
          updateCustomer({
            needsInvoice: event.currentTarget.checked,
            isCompany: event.currentTarget.checked && $order.customer.isCompany,
          })
        }}
      />
      {tp('Potřebuji fakturu')}
    </label>
    <label
      class={[
        CHECKBOX_ROW,
        !$order.customer.needsInvoice && 'cursor-not-allowed opacity-50',
      ]}
    >
      <input
        type="checkbox"
        class={CHECKBOX}
        checked={$order.customer.isCompany}
        disabled={!$order.customer.needsInvoice}
        onchange={(event) => {
          updateCustomer({ isCompany: event.currentTarget.checked })
        }}
      />
      {tp('Nakupuji na firmu')}
    </label>
  </div>

  <Reveal open={needsAddress}>
    <fieldset class="grid gap-x-4 gap-y-1 pt-4 min-sm:grid-cols-2">
      <legend class="sr-only">{tp('Adresa')}</legend>
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
  </Reveal>

  <Reveal open={$order.customer.needsInvoice && $order.customer.isCompany}>
    <div class="grid gap-x-4 gap-y-1 pt-4 min-sm:grid-cols-2">
      <TextField
        {...textProps('companyName')}
        label="Název firmy"
        autocomplete="organization"
        class="min-sm:col-span-2"
      />
      <TextField {...textProps('ico')} label="IČO" inputmode="numeric" />
      <TextField {...textProps('dic')} label="DIČ" optional />
    </div>
  </Reveal>

  <div class="flex flex-col gap-2 pt-4">
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

  <div class="border-(--step)/40 flex flex-col gap-4 mt-8 border-t border-dashed pt-6">
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
