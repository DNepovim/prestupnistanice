import React from "react";
import { useOrderStore } from "../storages/orderStorage";
import { cn } from "../utils/cn";
import type { OrderState } from "../types/order";

const steps = [
  {
    id: "cartContent",
    name: "Košík",
  },
  {
    id: "deliveryPayment",
    name: "Doprava & Platba",
  },
  {
    id: "personalData",
    name: "Údaje",
  },
  { id: "summary", name: "Shrnutí" } as const,
] satisfies { id: OrderState; name: string }[];

export const CartSteper = () => {
  const { currentState, setCurrentState } = useOrderStore();
  const currentStateIndex = steps.reduce<number>(
    (acc, { id }, index) => (id === currentState ? index : acc),
    -1,
  );
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between max-w-xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              className="flex flex-col items-center w-18 cursor-pointer"
              onClick={() => {
                setCurrentState(step.id);
              }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border border-transparent",
                  index < currentStateIndex &&
                    "bg-brand-second-200 text-brand-first",
                  index === currentStateIndex && "bg-brand-first text-white",
                  index > currentStateIndex && "bg-gray-200 text-brand-first border-brand-first-100",
                )}
              >
                {index < currentStateIndex ? "✓" : index + 1}
              </div>
              <span className={cn("text-sm mt-2 font-alt text-brand-first text-center", index === currentStateIndex && "font-bold")}>
                {step.name}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 items-center mt-3.5 -mx-5",
                  index < currentStateIndex - 1 && "bg-brand-second-200",
                  index === currentStateIndex - 1 &&
                    "bg-linear-to-r from-brand-second-500 to-brand-first",
                  index === currentStateIndex &&
                    "bg-linear-to-r from-brand-first to-gray-200",
                  index > currentStateIndex && "bg-gray-200",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
