import React from "react";
import { useCartStore } from "../../storages/cartStorage";
import { useOrderStore } from "../../storages/orderStorage";

interface BookDetails {
  slug: string;
  title: string;
  cover?: string;
  authors?: Array<{
    author?: {
      firstname?: string;
      surname?: string;
    };
    role?: string;
  }>;
  color?: string;
  price?: number;
}

interface CartContentStateProps {
  booksData: BookDetails[];
}

export const CartContentState = ({ booksData }: CartContentStateProps) => {
  const { items, updateQuantity, removeFromCart, emptyCart, _hasHydrated } =
    useCartStore();
  const { setCurrentState } = useOrderStore();

  // Create a map of slug to book details for quick lookup
  const booksMap = new Map(booksData.map((book) => [book.slug, book]));

  const handleContinue = () => {
    if (items.length > 0) {
      setCurrentState("deliveryPayment");
    }
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!_hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Načítání košíku...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Obsah košíku</h2>
        <button
          onClick={emptyCart}
          className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded border border-red-200 hover:border-red-300"
        >
          Vymazat košík
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Váš košík je prázdný</p>
          <a
            href="/knihy"
            className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Prohlédnout knihy
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map(({ slug, count }) => {
              const book = booksMap.get(slug);

              if (!book) {
                return (
                  <div
                    key={slug}
                    className="border rounded-lg p-4 bg-red-50 border-red-200"
                  >
                    <p className="text-red-600">
                      Kniha "{slug}" nebyla nalezena
                    </p>
                    <button
                      onClick={() => removeFromCart(slug)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Odstranit z košíku
                    </button>
                  </div>
                );
              }

              const mainAuthor = book.authors?.find(
                (a) => a?.role === "author",
              )?.author;
              const authorName = mainAuthor
                ? `${mainAuthor.firstname || ""} ${mainAuthor.surname || ""}`.trim()
                : "Neznámý autor";

              return (
                <div
                  key={slug}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    {book.cover && (
                      <div className="flex-shrink-0">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Book Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{authorName}</p>
                      {book.price && (
                        <p className="text-lg font-bold text-gray-900 mb-1">
                          {book.price} Kč
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">Slug: {slug}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(slug, count - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={count <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {count}
                        </span>
                        <button
                          onClick={() => updateQuantity(slug, count + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(slug)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-200 hover:border-red-300"
                      >
                        Odstranit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-6">
            {/* Total Price */}
            <div className="flex justify-end mb-6">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  Celkem: {items.reduce((total, { slug, count }) => {
                    const book = booksMap.get(slug);
                    return total + (book?.price || 0) * count;
                  }, 0)} Kč
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <a
                  href="/knihy"
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Pokračovat v nakupování
                </a>
                <button
                  onClick={handleContinue}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pokračovat k objednávce
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
