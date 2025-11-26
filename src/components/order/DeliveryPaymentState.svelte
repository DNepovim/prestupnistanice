<script lang="ts">
  import {
    orderStore,
    setDelivery,
    setPickupLocation,
    setPayment,
    setCurrentState,
    isDeliveryValid,
    isPaymentValid
  } from "@/stores/order";
  import { cn } from "@/utils/cn";

  type DeliveryOption = "balikovna" | "balikovna-adresa" | "osobni-prevzeti";
  type PaymentOption = "prevodem" | "dobirkou" | "hotovost";
  type PickupLocation = "praha-kralin" | "melnik" | "revnice";

  // derived flags for disabled

  const deliveryOptions: { id: DeliveryOption; name: string; description: string; price: number }[] = [
    { id: "balikovna", name: "Balíkovna", description: "Vyzvednutí na pobočce Balíkovny", price: 50 },
    { id: "balikovna-adresa", name: "Balíkovna na adresu", description: "Doručení na vaši adresu", price: 105 },
    { id: "osobni-prevzeti", name: "Osobní převzetí", description: "Vyzvednutí na pobočce", price: 0 }
  ];

  const pickupLocations: { id: PickupLocation; name: string }[] = [
    { id: "praha-kralin", name: "Praha-Králín" },
    { id: "melnik", name: "Mělník" },
    { id: "revnice", name: "Řevnice" }
  ];

  $: paymentOptions = [
    { id: "prevodem", name: "Převodem", description: "Bankovní převod", price: 0 },
    { id: "dobirkou", name: "Dobírkou", description: "Platba při doručení", price: 19, disabled: $orderStore.delivery === "osobni-prevzeti" },
    { id: "hotovost", name: "V hotovosti při převzetí", description: "Platba při osobním převzetí", price: 0, disabled: $orderStore.delivery !== "osobni-prevzeti" }
  ] as { id: PaymentOption; name: string; description: string; price: number; disabled?: boolean }[];
</script>

<div class="max-w-4xl mx-auto">
  <div class="grid md:grid-cols-2 gap-8">
    <div class="space-y-4">
      <h2 class="text-xl font-alt mb-4">Způsob dopravy</h2>

      {#each deliveryOptions as option (option.id)}
        <div
          class="border rounded-lg p-4 transition-colors border-brand-first-500"
        >
          <label class="flex items-start space-x-3 cursor-pointer">
            <input type="radio" name="delivery" value={option.id}
              checked={$orderStore.delivery === option.id}
              on:change={() => { setDelivery(option.id); }} class="mt-1" />
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{option.name}</div>
                  <div class="text-sm text-gray-600">{option.description}</div>
                </div>
                <div class="font-semibold text-brand-first-500">
                  {option.price === 0 ? "Zdarma" : `${String(option.price)} Kč`}
                </div>
              </div>
            </div>
          </label>
        </div>
      {/each}

      {#if $orderStore.delivery === "osobni-prevzeti"}
        <div class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium mb-3">Místo vyzvednutí</h4>
          <div class="space-y-2">
            {#each pickupLocations as location (location.id)}
              <label class="flex items-center space-x-3 cursor-pointer">
                <input type="radio" name="pickupLocation" value={location.id}
                  checked={$orderStore.pickupLocation === location.id}
                  on:change={() => { setPickupLocation(location.id); }} />
                <span>{location.name}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="space-y-4">
      <h3 class="text-xl font-semibold mb-4">Způsob platby</h3>

      {#each paymentOptions as option (option.id)}
        <div class="border rounded-lg p-4">
          <label class={cn("flex items-start space-x-3 cursor-pointer", option.disabled && "opacity-50") }>
            <input type="radio" name="payment" value={option.id}
              checked={$orderStore.payment === option.id}
              disabled={option.disabled}
              on:change={() => { if (!option.disabled) setPayment(option.id); }} class="mt-1" />
            <div class="flex-1">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-medium">{option.name}</div>
                  <div class="text-sm text-gray-600">{option.description}</div>
                </div>
                <div class="font-semibold">
                  {option.price === 0 ? "Zdarma" : `${String(option.price)} Kč`}
                </div>
              </div>
            </div>
          </label>
        </div>
      {/each}
    </div>
  </div>

  <div class="mt-8 flex justify-between">
    <button on:click={() => { setCurrentState('cartContent'); }}
      class="text-gray-700 transition-colors hover:text-brand-first-500 cursor-pointer hover:underline">
      &lt; Zpět
    </button>
    <button on:click={() => { setCurrentState('personalData'); }} disabled={!isDeliveryValid() || !isPaymentValid()}
      class="text-brand-first-500 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:underline">
      Pokračovat k údajům &gt;
    </button>
  </div>
</div>
