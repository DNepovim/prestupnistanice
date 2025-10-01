import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DeliveryOption,
  PaymentOption,
  PickupLocation,
  OrderState,
  PersonalData,
  OrderData,
} from "../types/order";

interface OrderStorage {
  // Current state
  currentState: OrderState;

  // Order data
  orderData: OrderData;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  setCurrentState: (state: OrderState) => void;
  setDelivery: (delivery: DeliveryOption) => void;
  setPickupLocation: (location: PickupLocation) => void;
  setPayment: (payment: PaymentOption) => void;
  updatePersonalData: (data: Partial<PersonalData>) => void;
  resetOrder: () => void;
  setHasHydrated: (state: boolean) => void;

  // Computed values
  getDeliveryPrice: () => number;
  getPaymentPrice: () => number;
  getTotalPrice: () => number;
  isPaymentValid: () => boolean;
  isDeliveryValid: () => boolean;
}

const initialOrderData: OrderData = {
  delivery: null,
  pickupLocation: null,
  payment: null,
  personalData: {
    firstname: "",
    surname: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    city: "",
    postcode: "",
  },
};

export const useOrderStore = create<OrderStorage>()(
  persist(
    (set, get) => ({
      currentState: "cartContent",
      orderData: initialOrderData,
      _hasHydrated: false,

      setCurrentState: (state) => set({ currentState: state }),

      setDelivery: (delivery) => {
        const { orderData } = get();
        const newOrderData = { ...orderData, delivery };

        // Reset dependent fields when delivery changes
        if (delivery !== "osobni-prevzeti") {
          newOrderData.pickupLocation = null;
        }
        if (
          delivery === "osobni-prevzeti" &&
          orderData.payment === "dobirkou"
        ) {
          newOrderData.payment = null;
        }
        if (
          delivery !== "osobni-prevzeti" &&
          orderData.payment === "hotovost"
        ) {
          newOrderData.payment = null;
        }

        set({ orderData: newOrderData });
      },

      setPickupLocation: (location) => {
        set(({ orderData }) => ({
          orderData: { ...orderData, pickupLocation: location },
        }));
      },

      setPayment: (payment) => {
        set(({ orderData }) => ({
          orderData: { ...orderData, payment },
        }));
      },

      updatePersonalData: (data) => {
        set(({ orderData }) => ({
          orderData: {
            ...orderData,
            personalData: { ...orderData.personalData, ...data },
          },
        }));
      },

      resetOrder: () =>
        set({
          currentState: "cartContent",
          orderData: initialOrderData,
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      getDeliveryPrice: () => {
        const { orderData } = get();
        switch (orderData.delivery) {
          case "balikovna":
            return 50;
          case "balikovna-adresa":
            return 105;
          case "osobni-prevzeti":
            return 0;
          default:
            return 0;
        }
      },

      getPaymentPrice: () => {
        const { orderData } = get();
        switch (orderData.payment) {
          case "dobirkou":
            return 19;
          case "prevodem":
            return 0;
          case "hotovost":
            return 0;
          default:
            return 0;
        }
      },

      getTotalPrice: () => {
        const { getDeliveryPrice, getPaymentPrice } = get();
        return getDeliveryPrice() + getPaymentPrice();
      },

      isPaymentValid: () => {
        const { orderData } = get();
        if (!orderData.payment) return false;

        // Check if payment method is compatible with delivery
        if (
          orderData.delivery === "osobni-prevzeti" &&
          orderData.payment === "dobirkou"
        ) {
          return false;
        }
        if (
          orderData.delivery !== "osobni-prevzeti" &&
          orderData.payment === "hotovost"
        ) {
          return false;
        }

        return true;
      },

      isDeliveryValid: () => {
        const { orderData } = get();
        if (!orderData.delivery) return false;

        if (
          orderData.delivery === "osobni-prevzeti" &&
          !orderData.pickupLocation
        ) {
          return false;
        }

        return true;
      },
    }),
    {
      name: "order",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
