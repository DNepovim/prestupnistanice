<script lang="ts">
  import { createForm } from "felte";
  import { orderStore, updatePersonalData, setCurrentState } from "@/stores/order";
  import { cn } from "@/utils/cn";

  export type FormData = {
    firstname: string;
    surname: string;
    email: string;
    phone?: string;
    street?: string;
    number?: string;
    city?: string;
    postcode?: string;
  };

  const initialValues: FormData = $orderStore.personalData;

  function validate(values: FormData) {
    const errors: Record<string, string[]> = {};
    const add = (k: keyof FormData, msg: string) => {
      if (!errors[k as string]) errors[k as string] = [];
      errors[k as string].push(msg);
    };

    if (!values.firstname || values.firstname.trim().length < 2) add("firstname", "Jméno je povinné a min. 2 znaky");
    if (!values.surname || values.surname.trim().length < 2) add("surname", "Příjmení je povinné a min. 2 znaky");
    if (!values.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) add("email", "Neplatný email");
    if (values.phone && !/^[+]?[0-9\s-()]{9,}$/.test(values.phone)) add("phone", "Neplatný telefon");

    if ($orderStore.delivery === "balikovna-adresa") {
      if (!values.street || values.street.trim().length < 2) add("street", "Ulice je povinná");
      if (!values.number || values.number.trim().length < 1) add("number", "Číslo popisné je povinné");
      if (!values.city || values.city.trim().length < 2) add("city", "Město je povinné");
      if (!values.postcode || !/^\d{5}$/.test(values.postcode)) add("postcode", "PSČ musí mít 5 číslic");
    }

    return errors;
  }

  const { form, errors } = createForm<FormData>({
    initialValues,
    onSubmit: (values) => {
      updatePersonalData(values);
      setCurrentState('summary');
    },
    validate
  });
</script>

<div class="max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold mb-8">Osobní údaje</h2>

  <div class="max-w-xl mx-auto">
    <form use:form class="space-y-6">
      <div>
        <h3 class="text-xl font-semibold mb-4">Kontaktní údaje</h3>
        <div class="space-y-4">
          <div>
            <label for="firstname" class="block text-sm font-medium text-gray-700 mb-1">Jméno *</label>
            <input type="text" id="firstname" name="firstname"
              class={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                $errors.firstname ? "border-red-500" : "border-gray-300",
              )}
              placeholder="Vaše jméno" />
            {#if $errors.firstname}
              <p class="text-red-500 text-sm mt-1">{$errors.firstname[0]}</p>
            {/if}
          </div>

          <div>
            <label for="surname" class="block text-sm font-medium text-gray-700 mb-1">Příjmení *</label>
            <input type="text" id="surname" name="surname"
              class={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                $errors.surname ? "border-red-500" : "border-gray-300",
              )}
              placeholder="Vaše příjmení" />
            {#if $errors.surname}
              <p class="text-red-500 text-sm mt-1">{$errors.surname[0]}</p>
            {/if}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" id="email" name="email"
              class={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                $errors.email ? "border-red-500" : "border-gray-300",
              )}
              placeholder="vas@email.cz" />
            {#if $errors.email}
              <p class="text-red-500 text-sm mt-1">{$errors.email[0]}</p>
            {/if}
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input type="tel" id="phone" name="phone"
              class={cn(
                "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                $errors.phone ? "border-red-500" : "border-gray-300",
              )}
              placeholder="+420 123 456 789" />
            {#if $errors.phone}
              <p class="text-red-500 text-sm mt-1">{$errors.phone[0]}</p>
            {/if}
          </div>
        </div>
      </div>

      {#if $orderStore.delivery === "balikovna-adresa"}
        <div>
          <h3 class="text-xl font-semibold mb-4">Doručovací adresa</h3>
          <div class="space-y-4">
            <div>
              <label for="street" class="block text-sm font-medium text-gray-700 mb-1">Ulice *</label>
              <input type="text" id="street" name="street"
                class={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  $errors.street ? "border-red-500" : "border-gray-300",
                )}
                placeholder="Název ulice" />
              {#if $errors.street}
                <p class="text-red-500 text-sm mt-1">{$errors.street[0]}</p>
              {/if}
            </div>

            <div>
              <label for="number" class="block text-sm font-medium text-gray-700 mb-1">Číslo popisné *</label>
              <input type="text" id="number" name="number"
                class={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  $errors.number ? "border-red-500" : "border-gray-300",
                )}
                placeholder="Číslo popisné" />
              {#if $errors.number}
                <p class="text-red-500 text-sm mt-1">{$errors.number[0]}</p>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Město *</label>
                <input type="text" id="city" name="city"
                  class={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    $errors.city ? "border-red-500" : "border-gray-300",
                  )}
                  placeholder="Město" />
                {#if $errors.city}
                  <p class="text-red-500 text-sm mt-1">{$errors.city[0]}</p>
                {/if}
              </div>

              <div>
                <label for="postcode" class="block text-sm font-medium text-gray-700 mb-1">PSČ *</label>
                <input type="text" id="postcode" name="postcode" maxlength={5}
                  class={cn(
                    "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    $errors.postcode ? "border-red-500" : "border-gray-300",
                  )}
                  placeholder="12345" />
                {#if $errors.postcode}
                  <p class="text-red-500 text-sm mt-1">{$errors.postcode[0]}</p>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div class="mt-8 flex justify-between">
        <button type="button" on:click={() => { setCurrentState('deliveryPayment'); }}
          class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">Zpět</button>
        <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Pokračovat k shrnutí
        </button>
      </div>
    </form>
  </div>
</div>
