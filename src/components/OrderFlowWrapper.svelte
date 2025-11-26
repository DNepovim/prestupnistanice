<script lang="ts">
  import CartSteper from "./CartSteper.svelte";
  import CartContentState from "./order/CartContentState.svelte";
  import DeliveryPaymentState from "./order/DeliveryPaymentState.svelte";
  import PersonalDataState from "./order/PersonalDataState.svelte";
  import SummaryState from "./SummaryState.svelte";
  import {
    orderStore
  } from "@/stores/order";

  type OrderState = "cartContent" | "deliveryPayment" | "personalData" | "summary";

  type BookDetails = {
    slug: string;
    title: string;
    cover?: string;
    authors?: { author?: { firstname?: string; surname?: string }; role?: string }[];
    color?: string;
    price?: number;
  };

  

  // Mocked books data
  const booksData: BookDetails[] = [
    {
      slug: "kniha-1",
      title: "První kniha",
      price: 299,
      cover: "/images/placeholder-1.jpg",
      authors: [{ author: { firstname: "Jan", surname: "Novák" }, role: "author" }]
    },
    {
      slug: "kniha-2",
      title: "Druhá kniha",
      price: 399,
      cover: "/images/placeholder-2.jpg",
      authors: [{ author: { firstname: "Eva", surname: "Svobodová" }, role: "author" }]
    },
    {
      slug: "kniha-3",
      title: "Třetí kniha",
      price: 249,
      cover: "/images/placeholder-3.jpg",
      authors: [{ author: { firstname: "Petr", surname: "Dvořák" }, role: "author" }]
    }
  ];

  // Smooth scroll on order step change
  let prevState: OrderState = 'cartContent';
  $: if ($orderStore.currentState !== prevState) {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevState = $orderStore.currentState;
  }

  // Access store as Svelte store via $orderStore
</script>

<div class="max-w-6xl mx-auto">
  <CartSteper />

  {#if $orderStore.currentState === "cartContent"}
    <CartContentState {booksData} />
  {:else if $orderStore.currentState === "deliveryPayment"}
    <DeliveryPaymentState />
  {:else if $orderStore.currentState === "personalData"}
    <PersonalDataState />
  {:else if $orderStore.currentState === "summary"}
    <SummaryState {booksData} />
  {/if}
</div>
