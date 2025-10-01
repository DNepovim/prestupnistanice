import { useCartStore } from "../storages/cartStorage";
import { useState } from "react";

interface AddToCartButtonProps {
  slug: string;
  className?: string;
}

export const AddToCartButton = ({
  slug,
  className = "",
}: AddToCartButtonProps) => {
  const { addToCart, getItemCount, _hasHydrated } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);

  const itemCount = getItemCount(slug);

  // Don't render until hydrated to prevent hydration mismatch
  if (!_hasHydrated) {
    return null;
  }

  const handleAddToCart = () => {
    addToCart(slug);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`uppercase text-sm font-alt relative group transition-all duration-200 ${className}`}
    >
      {isAdded ? (
        <span className="flex items-center space-x-2">
          <span>✓ Přidáno do košíku</span>
          {itemCount > 0 && <span>({itemCount})</span>}
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          <span>Přidat do košíku</span>
          {itemCount > 0 && <span>({itemCount})</span>}
        </span>
      )}
    </button>
  );
};
