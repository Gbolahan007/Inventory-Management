"use client";
import { Trash2, Plus, Minus } from "lucide-react";
import type { SaleItem, Product } from "./types";

interface ShoppingCartDisplayProps {
  cartItems: SaleItem[];
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, newQuantity: number) => void;
  cartTotal: number;
  cartTotalProfit: number;
  isDarkMode: boolean;
  products: Product[] | undefined; // Needed for stock check
}

export default function ShoppingCartDisplay({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  cartTotal,
  isDarkMode,
  products,
}: ShoppingCartDisplayProps) {
  return (
    <div className={`w-96 ${isDarkMode ? "bg-slate-750" : "bg-gray-50"}`}>
      <div className="p-6">
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}
        >
          Shopping Cart
        </h3>
        {cartItems.length === 0 ? (
          <p
            className={`text-center py-8 ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Cart is empty
          </p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4
                    className={`font-medium ${
                      isDarkMode ? "text-slate-100" : "text-gray-900"
                    }`}
                  >
                    {item.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h4>
                  <button
                    onClick={() => removeFromCart(index)}
                    className={`text-red-500 hover:text-red-700`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    ₦{item.unit_price.toFixed(2)} each
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartItemQuantity(index, item.quantity - 1)
                      }
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDarkMode
                          ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className={`w-8 text-center ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartItemQuantity(index, item.quantity + 1)
                      }
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDarkMode
                          ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-slate-100" : "text-gray-900"
                  }`}
                >
                  Total: ₦{item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
            {/* Cart Summary */}
            <div
              className={`p-4 rounded-lg border-2 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className={`${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    Subtotal:
                  </span>
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-slate-100" : "text-gray-900"
                    }`}
                  >
                    ₦{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
