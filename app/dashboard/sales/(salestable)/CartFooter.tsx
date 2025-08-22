/* eslint-disable @typescript-eslint/no-explicit-any */

import { Send, CreditCard, Clock } from "lucide-react";
import type { SaleItem } from "../(sales)/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface CartFooterProps {
  cartTotal: number;
  cartTotalProfit: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleSendToBar: () => void;
  handleFinalizeSale: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  createBarRequestMutation: UseMutationResult<any, Error, any, unknown>;
  isDarkMode: boolean;
  tableBarRequestStatus: "none" | "pending" | "given";
  cartItems: SaleItem[];
}

export function CartFooter({
  cartTotal,
  cartTotalProfit,
  paymentMethod,
  setPaymentMethod,
  handleSendToBar,
  handleFinalizeSale,
  createSaleMutation,
  createBarRequestMutation,
  isDarkMode,
  tableBarRequestStatus,
  cartItems,
}: CartFooterProps) {
  const hasItems = cartItems.length > 0;
  const paymentMethods = [
    { value: "cash", label: "Cash", icon: "💰" },
    { value: "transfer", label: "Transfer", icon: "💳" },
    { value: "pos", label: "POS", icon: "📱" },
  ];

  return (
    <div className="space-y-4">
      {/* Total Summary */}
      <div
        className={`p-3 rounded-lg border ${
          isDarkMode
            ? "border-slate-700 bg-slate-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-lg">
              ₦{cartTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Profit
            </span>
            <span
              className={`text-sm font-medium ${
                cartTotalProfit > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₦{cartTotalProfit?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection - Only show when ready for payment */}
      {tableBarRequestStatus === "given" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  paymentMethod === method.value
                    ? isDarkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDarkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div>{method.icon}</div>
                <div>{method.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {tableBarRequestStatus === "none" && hasItems && (
          <button
            onClick={handleSendToBar}
            disabled={!hasItems || createBarRequestMutation.isPending}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              !hasItems
                ? isDarkMode
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {createBarRequestMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Sending to Bar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to Bar
              </>
            )}
          </button>
        )}

        {tableBarRequestStatus === "pending" && (
          <div
            className={`w-full py-3 px-4 rounded-lg text-sm text-center ${
              isDarkMode
                ? "bg-yellow-900 text-yellow-200"
                : "bg-yellow-50 text-yellow-800"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Waiting for bartender...
            </div>
          </div>
        )}

        {tableBarRequestStatus === "given" && (
          <button
            onClick={handleFinalizeSale}
            disabled={!hasItems || createSaleMutation.isPending}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              !hasItems
                ? isDarkMode
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {createSaleMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Complete Sale
              </>
            )}
          </button>
        )}
      </div>

      {/* Help Text */}
      {hasItems && (
        <div
          className={`text-xs text-center ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {tableBarRequestStatus === "none" &&
            "Send items to bar first, then complete sale when ready"}
          {tableBarRequestStatus === "pending" &&
            "Bartender is preparing your order"}
          {tableBarRequestStatus === "given" &&
            "Items are ready! Complete the sale to collect payment"}
        </div>
      )}
    </div>
  );
}
