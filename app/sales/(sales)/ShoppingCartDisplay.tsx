"use client";
import { useState } from "react";
import { Trash2, Plus, Minus, X } from "lucide-react";
import type { SaleItem, Product } from "./types";

interface ShoppingCartDisplayProps {
  cartItems: SaleItem[];
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, newQuantity: number) => void;
  cartTotal: number;
  cartTotalProfit: number;
  isDarkMode: boolean;
  products: Product[] | undefined;
  isOpen?: boolean;
  onClose?: () => void; // Made optional again
}

export default function ShoppingCartDisplay({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  cartTotal,
  isDarkMode,
  isOpen = true,
  onClose,
}: ShoppingCartDisplayProps) {
  // Internal state for mobile modal
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(isOpen);

  // Handle mobile modal close
  const handleMobileClose = () => {
    setIsMobileModalOpen(false);
    if (onClose) onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleMobileClose();
    }
  };

  return (
    <>
      {/* Mobile: Full-screen overlay */}
      <div
        className={`
        md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out
        ${isMobileModalOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 ${
            isDarkMode ? "bg-black/50" : "bg-black/30"
          }`}
          onClick={handleBackdropClick}
        />

        {/* Cart Panel */}
        <div
          className={`
          absolute right-0 top-0 h-full w-full max-w-sm
          ${isDarkMode ? "bg-slate-800" : "bg-white"}
          shadow-xl
        `}
        >
          {/* Header */}
          <div
            className={`
            flex items-center justify-between p-4 border-b
            ${isDarkMode ? "border-slate-700" : "border-gray-200"}
          `}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
            >
              Shopping Cart
            </h3>
            <button
              onClick={handleMobileClose}
              className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}
              type="button"
              aria-label="Close cart"
            >
              <X
                className={`w-5 h-5 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <p
                className={`text-center py-8 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Cart is empty
              </p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className={`font-medium text-sm flex-1 pr-2 ${
                          isDarkMode ? "text-slate-100" : "text-gray-900"
                        }`}
                      >
                        {item.name
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        type="button"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
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
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isDarkMode
                                ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                            type="button"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`w-8 text-center font-medium ${
                              isDarkMode ? "text-slate-100" : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(index, item.quantity + 1)
                            }
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isDarkMode
                                ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                            type="button"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium text-right ${
                          isDarkMode ? "text-slate-100" : "text-gray-900"
                        }`}
                      >
                        Total: ₦{item.total_price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Cart Summary */}
                <div
                  className={`p-3 rounded-lg border-2 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between mb-3">
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      Subtotal:
                    </span>
                    <span
                      className={`font-medium text-sm ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      ₦{cartTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2 mb-4">
                    <label
                      className={`block text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Payment Method
                    </label>
                    <select
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm appearance-none ${
                        isDarkMode
                          ? "bg-slate-600 border-slate-500 text-slate-100 focus:border-slate-400"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        isDarkMode
                          ? "focus:ring-slate-400"
                          : "focus:ring-blue-500"
                      }`}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Checkout Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Sidebar */}
      <div
        className={`
        hidden md:block w-full min-w-0
        ${isDarkMode ? "bg-slate-750" : "bg-gray-50"}
        md:max-w-md md:mx-auto lg:max-w-96
      `}
      >
        <div className="p-3 md:p-4 lg:p-6">
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
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 md:p-3 lg:p-4 rounded-lg border ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4
                      className={`font-medium text-sm sm:text-base flex-1 pr-2 ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {item.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h4>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 transition-colors"
                      type="button"
                      aria-label="Remove item"
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isDarkMode
                            ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        type="button"
                        aria-label="Decrease quantity"
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isDarkMode
                            ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        type="button"
                        aria-label="Increase quantity"
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
                className={`p-2 md:p-3 lg:p-4 rounded-lg border-2 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span
                      className={`text-xs md:text-sm lg:text-base ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      Subtotal:
                    </span>
                    <span
                      className={`font-medium text-xs md:text-sm lg:text-base ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      ₦{cartTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2 pt-2">
                    <label
                      className={`block text-xs md:text-sm font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-700"
                      }`}
                    >
                      Payment Method
                    </label>
                    <select
                      className={`w-full px-2 md:px-3 py-2 rounded-lg border text-xs md:text-sm appearance-none ${
                        isDarkMode
                          ? "bg-slate-600 border-slate-500 text-slate-100 focus:border-slate-400"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                        isDarkMode
                          ? "focus:ring-slate-400"
                          : "focus:ring-blue-500"
                      }`}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Checkout Button */}
                  <button
                    className={`w-full mt-3 md:mt-4 py-2 md:py-3 px-3 md:px-4 rounded-lg font-medium text-xs md:text-sm transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
