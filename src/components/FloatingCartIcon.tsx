import { useCartStore } from "../storages/cartStorage";
import { FiShoppingCart, FiX, FiPlus, FiMinus } from "react-icons/fi";
import { cn } from "../utils/cn";
import { useBookData } from "../hooks/useBookData";

export const FloatingCartIcon = () => {
  const { getTotalItems, _hasHydrated, items, updateQuantity, removeFromCart } =
    useCartStore();
  const totalItems = getTotalItems();

  const slugs = items.map((item) => item.slug);
  const { books, loading, error } = useBookData(slugs);

  if (!_hasHydrated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 ">
      <div
        className={cn(
          "bg-brand-first overflow-hidden rounded-[1.75rem] shadow-lg border border-transparent duration-200 group w-14 h-14 transition-all druation-700 relative",
          "hover:border-brand-first-300 hover:bg-white hover:w-80 hover:h-100",
        )}
      >
        <div className="aboslute top-0 w-full h-6 group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-transparent" />
        <div className="overflow-y-scroll w-full h-full group-hover:opacity-100 opacity-0 pb-9 transition-opacity">
          <div className="flex flex-col justify-between w-80 p-2">
            <div className="py-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Košík je prázdný
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {items.map(({ slug, count }) => {
                    const book = books[slug];
                    return (
                      <div
                        key={slug}
                        className="flex flex-col items-center p-2 hover:bg-gray-50 rounded border border-gray-100"
                      >
                        {book?.cover && (
                          <div className="w-16 h-20 mb-2">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-full object-cover rounded shadow-sm"
                            />
                          </div>
                        )}

                        <div className="text-center mb-2">
                          <h4 className="font-medium text-xs text-gray-900 leading-tight">
                            {book?.title ?? slug}
                          </h4>
                          {book?.price && (
                            <p className="text-xs text-gray-600 font-semibold">
                              {book.price} Kč
                            </p>
                          )}
                          {loading && (
                            <p className="text-xs text-gray-500">Načítání...</p>
                          )}
                          {error && !book && (
                            <p className="text-xs text-red-500">
                              Chyba při načítání
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 mb-1">
                          <button
                            onClick={() => {
                              updateQuantity(slug, count - 1);
                            }}
                            className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            disabled={count <= 1}
                          >
                            <FiMinus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">
                            {count}
                          </span>
                          <button
                            onClick={() => {
                              updateQuantity(slug, count + 1);
                            }}
                            className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <FiPlus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            removeFromCart(slug);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* {items.length > 0 && ( */}
            {/*   <div className="flex justify-between items-center mb-2 px-2"> */}
            {/*     <span className="text-sm font-medium text-gray-700">Celkem:</span> */}
            {/*     <span className="text-sm font-bold text-gray-900"> */}
            {/*       {items.reduce((total, { slug, count }) => { */}
            {/*         const book = books[slug]; */}
            {/*         return total + (book?.price ?? 0) * count; */}
            {/*       }, 0)} Kč */}
            {/*     </span> */}
            {/*   </div> */}
            {/* )} */}
          </div>
        </div>
        <div
          className={cn(
            "flex justify-end absolute bottom-0 right-0 w-80 h-14 p-1.5",
            "group-hover:bg-linear-to-t group-hover:from-80% group-hover:from-white group-hover:to-transparent",
          )}
        >
          <a
            href="/kosik"
            className={cn(
              "flex font-alt gap-4 text-white text-sm bg-brand-first items-center p-1 pr-2 pl-3 border border-transparent transition-colors rounded-[1.75rem]",
              "hover:bg-brand-first-700 hover:text-white group-hover:bg-white group-hover:border-gray-700 group-hover:text-black",
            )}
          >
            Dokončit nákup
            <FiShoppingCart className="w-6 h-6 " />
          </a>
        </div>
      </div>

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand-second text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </div>
  );
};
