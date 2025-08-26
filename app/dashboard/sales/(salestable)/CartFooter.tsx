/* eslint-disable @typescript-eslint/no-explicit-any */

import { CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import type { SaleItem } from "../(sales)/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface CartFooterProps {
  cartTotal: number;
  cartTotalProfit: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleFinalizeSale: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  isDarkMode: boolean;
  cartItems: SaleItem[];
}

export function CartFooter({
  cartTotal,
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  createSaleMutation,
  isDarkMode,
  cartItems,
}: CartFooterProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const canFinalizeSale = cartItems.length > 0;

  // Simple retry logic with timeout
  const handleSaleWithTimeout = async () => {
    try {
      setIsRetrying(false);

      // Create a timeout promise
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 15000) // 15 second timeout
      );

      // Race the sale against timeout
      await Promise.race([handleFinalizeSale(), timeoutPromise]);
    } catch (error) {
      console.log(`Sale failed, retrying once... ${error}`);
      setIsRetrying(true);

      setTimeout(async () => {
        try {
          await handleFinalizeSale();
          setIsRetrying(false);
        } catch (retryError) {
          setIsRetrying(false);
          alert(
            `Sale failed. Please check your connection and try again.${retryError}`
          );
        }
      }, 2000);
    }
  };

  const isProcessing = createSaleMutation.isPending || isRetrying;

  return (
    <div className="space-y-4">
      {/* Totals */}
      <div
        className={`p-4 rounded-lg border ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
            }).format(cartTotal)}
          </span>
        </div>
      </div>

      {/* Payment Method */}
      {cartItems.length > 0 && (
        <div className="space-y-3">
          <label
            className={`block text-sm font-medium ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "transfer", label: "Transfer", icon: CreditCard },
              { value: "cash", label: "Cash", icon: Banknote },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all ${
                  paymentMethod === value
                    ? isDarkMode
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-blue-500 bg-blue-50 text-blue-600"
                    : isDarkMode
                    ? "border-slate-600 hover:border-slate-500 text-slate-300"
                    : "border-gray-300 hover:border-gray-400 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complete Sale Button */}
      <button
        onClick={handleSaleWithTimeout}
        disabled={!canFinalizeSale || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
          !canFinalizeSale || isProcessing
            ? isDarkMode
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isDarkMode
            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
            : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{isRetrying ? "Retrying..." : "Processing..."}</span>
          </div>
        ) : (
          "Complete Sale"
        )}
      </button>

      {cartItems.length > 0 && (
        <p
          className={`text-xs text-center ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          Sale will be recorded immediately. Barman will receive notification
          for inventory tracking.
        </p>
      )}
    </div>
  );
}
