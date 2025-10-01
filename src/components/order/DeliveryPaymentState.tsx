import { useOrderStore } from "../../storages/orderStorage";
import type {
  DeliveryOption,
  PaymentOption,
  PickupLocation,
} from "../../types/order";
import { cn } from "../../utils/cn";

export const DeliveryPaymentState = () => {
  const {
    orderData,
    setDelivery,
    setPickupLocation,
    setPayment,
    setCurrentState,
    getDeliveryPrice,
    getPaymentPrice,
    getTotalPrice,
    isPaymentValid,
    isDeliveryValid,
    _hasHydrated,
  } = useOrderStore();

  const handleBack = () => {
    setCurrentState("cartContent");
  };

  const handleContinue = () => {
    if (isDeliveryValid() && isPaymentValid()) {
      setCurrentState("personalData");
    }
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!_hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Načítání...</p>
        </div>
      </div>
    );
  }

  const deliveryOptions = [
    {
      id: "balikovna",
      name: "Balíkovna",
      description: "Vyzvednutí na pobočce Balíkovny",
      price: 50,
    },
    {
      id: "balikovna-adresa",
      name: "Balíkovna na adresu",
      description: "Doručení na vaši adresu",
      price: 105,
    },
    {
      id: "osobni-prevzeti",
      name: "Osobní převzetí",
      description: "Vyzvednutí na pobočce",
      price: 0,
    },
  ] as const satisfies {
    id: DeliveryOption;
    name: string;
    description: string;
    price: number;
  }[];

  const pickupLocations = [
    { id: "praha-kralin" as PickupLocation, name: "Praha-Králín" },
    { id: "melnik" as PickupLocation, name: "Mělník" },
    { id: "revnice" as PickupLocation, name: "Řevnice" },
  ] as const satisfies { id: PickupLocation; name: string }[];

  const paymentOptions = [
    {
      id: "prevodem" as PaymentOption,
      name: "Převodem",
      description: "Bankovní převod",
      price: 0,
    },
    {
      id: "dobirkou" as PaymentOption,
      name: "Dobírkou",
      description: "Platba při doručení",
      price: 19,
      disabled: orderData.delivery === "osobni-prevzeti",
    },
    {
      id: "hotovost" as PaymentOption,
      name: "V hotovosti při převzetí",
      description: "Platba při osobním převzetí",
      price: 0,
      disabled: orderData.delivery !== "osobni-prevzeti",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-alt mb-4">Způsob dopravy</h2>

          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "border rounded-lg p-4 border-brand-first-400 transition-colors",
                orderData.delivery === option.id && "bg-brand-second-100",
                orderData.delivery !== option.id && " hover:bg-brand-first-100",
              )}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="delivery"
                  value={option.id}
                  checked={orderData.delivery === option.id}
                  onChange={() => {
                    setDelivery(option.id);
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-600">
                        {option.description}
                      </div>
                    </div>
                    <div className="font-semibold text-brand-first">
                      {option.price === 0
                        ? "Zdarma"
                        : `${String(option.price)} Kč`}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          ))}

          {orderData.delivery === "osobni-prevzeti" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Místo vyzvednutí</h4>
              <div className="space-y-2">
                {pickupLocations.map((location) => (
                  <label
                    key={location.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={location.id}
                      checked={orderData.pickupLocation === location.id}
                      onChange={() => {
                        setPickupLocation(location.id);
                      }}
                    />
                    <span>{location.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Způsob platby</h3>

          {paymentOptions.map((option) => (
            <div key={option.id} className="border rounded-lg p-4">
              <label
                className={`flex items-start space-x-3 cursor-pointer ${option.disabled ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={orderData.payment === option.id}
                  onChange={() => !option.disabled && setPayment(option.id)}
                  disabled={option.disabled}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-sm text-gray-600">
                        {option.description}
                      </div>
                    </div>
                    <div className="font-semibold">
                      {option.price === 0
                        ? "Zdarma"
                        : `${String(option.price)} Kč`}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="text-gray-700 transition-colors hover:text-brand-first cursor-pointer hover:underline"
        >
          {"< Zpět"}
        </button>
        <button
          onClick={handleContinue}
          disabled={!isDeliveryValid() || !isPaymentValid()}
          className="text-brand-first font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:underline"
        >
          {"Pokračovat k údajům >"}
        </button>
      </div>
    </div>
  );
};
