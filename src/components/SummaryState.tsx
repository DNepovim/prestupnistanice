import { useOrderStore } from "../storages/orderStorage";
import { useCartStore } from "../storages/cartStorage";
import { PICKUPS } from "../types/order";

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

interface SummaryStateProps {
  booksData: BookDetails[];
}

export const SummaryState = ({ booksData }: SummaryStateProps) => {
  const {
    orderData,
    getDeliveryPrice,
    getPaymentPrice,
    resetOrder,
    setCurrentState,
    _hasHydrated,
  } = useOrderStore();

  const { items, getTotalItems } = useCartStore();

  const handleBack = () => {
    setCurrentState("personalData");
  };

  const handleSubmitOrder = () => {
    // Here you would typically send the order to your backend
    alert("Objednávka byla úspěšně odeslána!");

    // Reset everything and go back to cart
    resetOrder();
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!_hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Načítání shrnutí...</p>
        </div>
      </div>
    );
  }

  const deliveryOptions = [
    { id: "balikovna", name: "Balíkovna", price: 50 },
    { id: "balikovna-adresa", name: "Balíkovna na adresu", price: 105 },
    { id: "osobni-prevzeti", name: "Osobní převzetí", price: 0 },
  ];

  const paymentOptions = [
    { id: "prevodem", name: "Převodem", price: 0 },
    { id: "dobirkou", name: "Dobírkou", price: 19 },
    { id: "hotovost", name: "V hotovosti při převzetí", price: 0 },
  ];

  const selectedDelivery = deliveryOptions.find(
    (d) => d.id === orderData.delivery,
  );
  const selectedPayment = paymentOptions.find(
    (p) => p.id === orderData.payment,
  );

  const totalBookPrice = items.reduce((total, { slug, count }) => {
    const book = booksData.find((b) => b.slug === slug);
    return total + (book?.price ?? 0) * count;
  }, 0);
  const deliveryPrice = getDeliveryPrice();
  const paymentPrice = getPaymentPrice();
  const totalPrice = totalBookPrice + deliveryPrice + paymentPrice;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Shrnutí objednávky</h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Objednané knihy</h3>
            <div className="space-y-3">
              {items.map((item) => {
                const book = booksData.find((b) => b.slug === item.slug);
                if (!book) return null;

                return (
                  <div
                    key={item.slug}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {book.cover && (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{book.title}</h4>
                      {book.authors && book.authors.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {book.authors
                            .map(
                              (a) =>
                                `${a.author?.firstname ?? ""} ${a.author?.surname ?? ""}`,
                            )
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.count} ks</p>
                      {book.price && (
                        <p className="text-sm text-gray-600">
                          {(book.price * item.count)} Kč
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Doprava a platba</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Doprava:</span>
                <span>
                  {selectedDelivery?.name} ({" "}
                  {selectedDelivery?.price === 0
                    ? "Zdarma"
                    : `${String(selectedDelivery?.price ?? 0)} Kč`}
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platba:</span>
                <span>
                  {selectedPayment?.name} (
                  {selectedPayment?.price === 0
                    ? "Zdarma"
                    : `${String(selectedPayment?.price ?? 0)} Kč`}
                  )
                </span>
              </div>
              {orderData.delivery === "osobni-prevzeti" &&
                orderData.pickupLocation && (
                  <div className="flex justify-between">
                    <span>Místo vyzvednutí:</span>
                    <span>
                    {PICKUPS[orderData.pickupLocation]}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Osobní údaje</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Jméno:</span>
                <span>
                  {orderData.personalData.firstname}{" "}
                  {orderData.personalData.surname}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{orderData.personalData.email}</span>
              </div>
              {orderData.personalData.phone && (
                <div className="flex justify-between">
                  <span>Telefon:</span>
                  <span>{orderData.personalData.phone}</span>
                </div>
              )}
              {orderData.delivery === "balikovna-adresa" && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between">
                    <span>Adresa:</span>
                    <span className="text-right">
                      {orderData.personalData.street}{" "}
                      {orderData.personalData.number}
                      <br />
                      {orderData.personalData.city}{" "}
                      {orderData.personalData.postcode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Cenové shrnutí</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Knihy ({getTotalItems()} ks):</span>
                <span>
                  {totalBookPrice === 0 ? "Zdarma" : `${String(totalBookPrice)} Kč`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Doprava:</span>
                <span>
                  {deliveryPrice === 0 ? "Zdarma" : `${String(deliveryPrice)} Kč`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platba:</span>
                <span>
                  {paymentPrice === 0 ? "Zdarma" : `${String(paymentPrice)} Kč`}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Celkem:</span>
                  <span>
                    {totalPrice === 0 ? "Zdarma" : `${String(totalPrice)} Kč`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Potvrzení objednávky
            </h4>
            <p className="text-blue-700 text-sm">
              Kliknutím na "Odeslat objednávku" potvrzujete, že souhlasíte s
              podmínkami obchodu a že všechny uvedené údaje jsou správné.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Zpět
        </button>
        <button
          onClick={handleSubmitOrder}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Odeslat objednávku
        </button>
      </div>
    </div>
  );
};
