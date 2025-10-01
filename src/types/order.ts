export type DeliveryOption =
  | "balikovna"
  | "balikovna-adresa"
  | "osobni-prevzeti";
export type PaymentOption = "prevodem" | "dobirkou" | "hotovost";

export const PICKUPS = {
  melnik: "Mělník",
  revnice:"Řevnice",
  praha: "Praha"
} as const

export type PickupLocation = keyof typeof PICKUPS

export type OrderState =
  | "cartContent"
  | "deliveryPayment"
  | "personalData"
  | "summary";

export interface PersonalData {
  firstname: string;
  surname: string;
  email: string;
  phone?: string;
  street?: string;
  number?: string;
  city?: string;
  postcode?: string;
}

export interface OrderData {
  delivery: DeliveryOption | null;
  pickupLocation: PickupLocation | null;
  payment: PaymentOption | null;
  personalData: PersonalData;
}
