import { Minus, Plus, Trash2 } from "lucide-react";
import type { SaleItem } from "../(sales)/types";

interface CartContentProps {
  cartItems: SaleItem[];
  removeFromCart: (productId: string, unitPrice: number) => void;
  updateCartItemQuantity: (
    productId: string,
    unitPrice: number,
    quantity: number
  ) => void;
  isDarkMode: boolean;
  tableBarRequestStatus: "none" | "pending" | "given";
}

export function CartContent({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  isDarkMode,
  tableBarRequestStatus,
}: CartContentProps) {
  const isDisabled = tableBarRequestStatus === "pending";

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div
          className={`text-4xl mb-2 ${
            isDarkMode ? "text-slate-400" : "text-gray-400"
          }`}
        >
          🛒
        </div>
        <p
          className={`text-sm ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          No items in cart
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cartItems.map((item, index) => (
        <div
          key={`${item.product_id}-${item.unit_price}-${index}`}
          className={`p-3 rounded-lg border transition-all ${
            isDarkMode
              ? "border-slate-700 bg-slate-800 hover:bg-slate-750"
              : "border-gray-200 bg-white hover:bg-gray-50"
          } ${isDisabled ? "opacity-60" : ""}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                ₦{item.unit_price.toLocaleString()} each
              </p>
            </div>
            <button
              onClick={() => removeFromCart(item.product_id, item.unit_price)}
              disabled={isDisabled}
              className={`p-1 rounded-full transition-colors ${
                isDisabled
                  ? "cursor-not-allowed opacity-50"
                  : isDarkMode
                  ? "hover:bg-slate-700 text-slate-400 hover:text-red-400"
                  : "hover:bg-red-50 text-gray-500 hover:text-red-500"
              }`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateCartItemQuantity(
                    item.product_id,
                    item.unit_price,
                    item.quantity - 1
                  )
                }
                disabled={isDisabled}
                className={`p-1 rounded-full transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : isDarkMode
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-medium text-sm w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateCartItemQuantity(
                    item.product_id,
                    item.unit_price,
                    item.quantity + 1
                  )
                }
                disabled={isDisabled}
                className={`p-1 rounded-full transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : isDarkMode
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">
                ₦{item.total_price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
