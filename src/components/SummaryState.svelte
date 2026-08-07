<script lang="ts">
  import {
    getDeliveryPrice,
    getPaymentPrice,
    getTotalItems,
    orderStore,
    resetOrder,
    setCurrentState,
  } from '@/stores/order'

  type BookDetails = {
    slug: string
    title: string
    cover?: string
    authors?: { author?: { firstname?: string; surname?: string }; role?: string }[]
    price?: number
  }
  type PickupLocation = 'praha-kralin' | 'melnik' | 'revnice' | null

  export let booksData: BookDetails[] = []
  // pull data from store

  const deliveryOptions = [
    { id: 'balikovna', name: 'Balíkovna', price: 50 },
    { id: 'balikovna-adresa', name: 'Balíkovna na adresu', price: 105 },
    { id: 'osobni-prevzeti', name: 'Osobní převzetí', price: 0 },
  ] as const
  const paymentOptions = [
    { id: 'prevodem', name: 'Převodem', price: 0 },
    { id: 'dobirkou', name: 'Dobírkou', price: 19 },
    { id: 'hotovost', name: 'V hotovosti při převzetí', price: 0 },
  ] as const
  const PICKUPS: Record<Exclude<PickupLocation, null>, string> = {
    'praha-kralin': 'Praha-Králín',
    melnik: 'Mělník',
    revnice: 'Řevnice',
  }

  $: selectedDelivery = deliveryOptions.find((d) => d.id === $orderStore.delivery)
  $: selectedPayment = paymentOptions.find((p) => p.id === $orderStore.payment)

  $: totalBookPrice = $orderStore.cart.reduce((total, { slug, count }) => {
    const book = booksData.find((b) => b.slug === slug)
    return total + (book?.price ?? 0) * count
  }, 0)
  $: deliveryPrice = getDeliveryPrice()
  $: paymentPrice = getPaymentPrice()
  $: totalPrice = totalBookPrice + deliveryPrice + paymentPrice
</script>

<div class="max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold mb-8">Shrnutí objednávky</h2>

  <div class="grid md:grid-cols-2 gap-8">
    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-4">Objednané knihy</h3>
        <div class="space-y-3">
          {#each $orderStore.cart as item (item.slug)}
            {@const book = booksData.find((b) => b.slug === item.slug)}
            {#if book}
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {#if book.cover}
                  <img
                    src={book.cover}
                    alt={book.title}
                    class="w-12 h-16 object-cover rounded"
                  />
                {/if}
                <div class="flex-1">
                  <h4 class="font-medium">{book.title}</h4>
                  {#if book.authors && book.authors.length > 0}
                    <p class="text-sm text-gray-600">
                      {book.authors
                        .map(
                          (a) =>
                            `${a.author?.firstname ?? ''} ${a.author?.surname ?? ''}`,
                        )
                        .join(', ')}
                    </p>
                  {/if}
                </div>
                <div class="text-right">
                  <p class="font-medium">{item.count} ks</p>
                  {#if book.price}
                    <p class="text-sm text-gray-600">
                      {String(book.price * item.count)} Kč
                    </p>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-4">Doprava a platba</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="flex justify-between">
            <span>Doprava:</span><span
              >{selectedDelivery?.name} ({selectedDelivery?.price === 0
                ? 'Zdarma'
                : `${String(selectedDelivery?.price ?? 0)} Kč`})</span
            >
          </div>
          <div class="flex justify-between">
            <span>Platba:</span><span
              >{selectedPayment?.name} ({selectedPayment?.price === 0
                ? 'Zdarma'
                : `${String(selectedPayment?.price ?? 0)} Kč`})</span
            >
          </div>
          {#if $orderStore.delivery === 'osobni-prevzeti' && $orderStore.pickupLocation}
            <div class="flex justify-between">
              <span>Místo vyzvednutí:</span><span
                >{PICKUPS[$orderStore.pickupLocation]}</span
              >
            </div>
          {/if}
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-4">Osobní údaje</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between">
            <span>Jméno:</span><span
              >{$orderStore.personalData.firstname}
              {$orderStore.personalData.surname}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Email:</span><span>{$orderStore.personalData.email}</span>
          </div>
          {#if $orderStore.personalData.phone}
            <div class="flex justify-between">
              <span>Telefon:</span><span>{$orderStore.personalData.phone}</span>
            </div>
          {/if}
          {#if $orderStore.delivery === 'balikovna-adresa'}
            <div class="mt-3 pt-3 border-t">
              <div class="flex justify-between">
                <span>Adresa:</span>
                <span class="text-right">
                  {$orderStore.personalData.street}
                  {$orderStore.personalData.number}<br />
                  {$orderStore.personalData.city}
                  {$orderStore.personalData.postcode}
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-4">Cenové shrnutí</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="flex justify-between">
            <span>Knihy ({getTotalItems()} ks):</span><span
              >{totalBookPrice === 0 ? 'Zdarma' : `${String(totalBookPrice)} Kč`}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Doprava:</span><span
              >{deliveryPrice === 0 ? 'Zdarma' : `${String(deliveryPrice)} Kč`}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Platba:</span><span
              >{paymentPrice === 0 ? 'Zdarma' : `${String(paymentPrice)} Kč`}</span
            >
          </div>
          <div class="border-t pt-3">
            <div class="flex justify-between font-semibold text-lg">
              <span>Celkem:</span><span
                >{totalPrice === 0 ? 'Zdarma' : `${String(totalPrice)} Kč`}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-semibold text-blue-800 mb-2">Potvrzení objednávky</h4>
        <p class="text-blue-700 text-sm">
          Kliknutím na "Odeslat objednávku" potvrzujete, že souhlasíte s podmínkami
          obchodu a že všechny uvedené údaje jsou správné.
        </p>
      </div>
    </div>
  </div>

  <div class="mt-8 flex justify-between">
    <button
      on:click={() => {
        setCurrentState('personalData')
      }}
      class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
      >Zpět</button
    >
    <button
      on:click={() => {
        alert('Objednávka byla úspěšně odeslána!')
        resetOrder()
      }}
      class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
      >Objednávka zavazující k platbě</button
    >
  </div>
</div>
