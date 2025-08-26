import { Minus, Plus, Trash2 } from "lucide-react";
import type { SaleItem } from "../(sales)/types";

interface CartContentProps {
  cartItems: SaleItem[];
  removeFromCart: (productId: string, unitPrice: number) => void;
  updateCartItemQuantity: (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => void;
  isDarkMode: boolean;
}

export function CartContent({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  isDarkMode,
}: CartContentProps) {
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className={`text-6xl mb-4 ${
            isDarkMode ? "text-slate-600" : "text-gray-300"
          }`}
        >
          🛒
        </div>
        <p
          className={`text-sm ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          Your cart is empty.
          <br />
          Add items to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cartItems.map((item, index) => (
        <div
          key={`${item.product_id}-${item.unit_price}-${index}`}
          className={`p-4 rounded-lg border transition-colors ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight mb-1">
                {item.name
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </h4>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                ₦{item.unit_price.toFixed(2)} each
              </p>
            </div>
            <button
              onClick={() => removeFromCart(item.product_id, item.unit_price)}
              className={`p-1 rounded ${
                isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
              } text-red-500 hover:text-red-600 transition-colors`}
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  updateCartItemQuantity(
                    item.product_id,
                    item.unit_price,
                    item.quantity - 1
                  )
                }
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="font-medium text-lg px-3 min-w-[3rem] text-center">
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
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                    : "border-gray-300 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(item.total_price)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
