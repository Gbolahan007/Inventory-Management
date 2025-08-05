/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { FormatCurrency } from "@/app/hooks/useFormatCurrency";
import { type UseMutationResult } from "@tanstack/react-query";
import { Minus, Plus, Trash2, X } from "lucide-react";
import type { Product, SaleItem } from "./types";

interface ShoppingCartDisplayProps {
  cartItems: SaleItem[];
  removeFromCart: (index: number) => void;
  updateCartItemQuantity: (index: number, newQuantity: number) => void;
  cartTotal: number;
  cartTotalProfit: number;
  isDarkMode: boolean;
  products: Product[] | undefined;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleFinalizeSale: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCartDisplay({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  cartTotal,
  isDarkMode,
  products, // Used for stock checking inside updateCartItemQuantity
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  createSaleMutation,
  isOpen,
  onClose,
}: ShoppingCartDisplayProps) {
  const isFinalizing = createSaleMutation.isPending;

  // Helper function to update quantity with stock check
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    const item = cartItems[index];
    const product = products?.find((p) => p.id === item.product_id);

    if (product) {
      // Calculate current stock available after considering other items in cart
      const currentProductInCartQuantity = cartItems
        .filter(
          (cartItem, i) => i !== index && cartItem.product_id === product.id
        )
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      if (currentProductInCartQuantity + newQuantity > product.current_stock) {
        // Use a custom modal or toast for error, as alert() is not allowed
        // For now, using toast as per previous implementation
        console.error("Not enough stock available for this update.");
        return;
      }
    }
    updateCartItemQuantity(index, newQuantity);
  };

  return (
    <>
      {/* Mobile View: Full-screen slide-in cart */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isDarkMode ? "bg-black/50" : "bg-black/30"
          }`}
          onClick={onClose}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-sm ${
            isDarkMode ? "bg-slate-800" : "bg-white"
          } shadow-xl flex flex-col`}
        >
          {/* Header for Mobile Cart */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-slate-100" : "text-gray-900"
              }`}
            >
              Shopping Cart
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            >
              <X
                className={`w-5 h-5 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              />
            </button>
          </div>
          {/* Content for Mobile Cart */}
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
                          {FormatCurrency(item.unit_price)} each
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(index, item.quantity - 1)
                            }
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isDarkMode
                                ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
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
                              handleUpdateQuantity(index, item.quantity + 1)
                            }
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
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
                        className={`text-sm font-medium text-right ${
                          isDarkMode ? "text-slate-100" : "text-gray-900"
                        }`}
                      >
                        Total: {FormatCurrency(item.total_price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Summary and Actions for Mobile Cart */}
          <div
            className={`p-4 border-t ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
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
                {FormatCurrency(cartTotal)}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <label
                htmlFor="payment-method-mobile"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Payment Method
              </label>
              <select
                id="payment-method-mobile"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm appearance-none ${
                  isDarkMode
                    ? "bg-slate-600 border-slate-500 text-slate-100 focus:border-slate-400"
                    : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isDarkMode ? "focus:ring-slate-400" : "focus:ring-blue-500"
                }`}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <button
              onClick={handleFinalizeSale}
              disabled={cartItems.length === 0 || isFinalizing}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isFinalizing ? "Finalizing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View: Integrated into the main modal's right column */}
      <div
        className={`hidden md:flex flex-col w-full md:w-1/2 p-6 md:p-8 border-l ${
          isDarkMode
            ? "bg-slate-750 border-slate-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
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
          <>
            <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 lg:space-y-4 pr-2">
              {" "}
              {/* Added pr-2 for scrollbar */}
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
                      {FormatCurrency(item.unit_price)} each
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(index, item.quantity - 1)
                        }
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
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
                          handleUpdateQuantity(index, item.quantity + 1)
                        }
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
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
                    Total: {FormatCurrency(item.total_price)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
