import React, { useEffect } from "react";
import { useOrderStore } from "../storages/orderStorage";
import { CartContentState } from "./order/CartContentState";
import { DeliveryPaymentState } from "./order/DeliveryPaymentState";
import { PersonalDataState } from "./order/PersonalDataState";
import { SummaryState } from "./SummaryState";
import { CartSteper } from "./CartSteper";

interface BookDetails {
  slug: string;
  title: string;
  cover?: string;
  authors?: {
    author?: {
      firstname?: string;
      surname?: string;
    };
    role?: string;
  }[];
  color?: string;
  price?: number;
}

interface OrderFlowWrapperProps {
  booksData: BookDetails[];
}

export const OrderFlowWrapper = ({ booksData }: OrderFlowWrapperProps) => {
  const { currentState } = useOrderStore();

  const prevStateRef = React.useRef(currentState);
  useEffect(() => {
    if (prevStateRef.current !== currentState) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    prevStateRef.current = currentState;
  }, [currentState]);

  return (
    <div className="max-w-6xl mx-auto">
      <CartSteper />
      {currentState === "cartContent" && (
        <CartContentState booksData={booksData} />
      )}
      {currentState === "deliveryPayment" && <DeliveryPaymentState />}
      {currentState === "personalData" && <PersonalDataState />}
      {currentState === "summary" && <SummaryState booksData={booksData} />}
    </div>
  );
};
