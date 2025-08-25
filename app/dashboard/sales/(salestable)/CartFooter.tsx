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
  isDarkMode: boolean;
  tableBarRequestStatus: "none" | "pending" | "given";
  cartItems: SaleItem[];
  isSendingToBar?: boolean; // Add this prop to track sending state
}

export function CartFooter({
  cartTotal,
  cartTotalProfit,
  paymentMethod,
  setPaymentMethod,
  handleSendToBar,
  handleFinalizeSale,
  createSaleMutation,
  isDarkMode,
  tableBarRequestStatus,
  cartItems,
  isSendingToBar = false,
}: CartFooterProps) {
  const hasItems = cartItems.length > 0;

  // Group items by approval status
  const approvedItems = cartItems.filter(
    (item) => item.approval_status === "approved"
  );
  const pendingItems = cartItems.filter(
    (item) => !item.approval_status || item.approval_status === "pending"
  );

  const hasPendingItems = pendingItems.length > 0;
  const hasApprovedItems = approvedItems.length > 0;
  const approvedTotal = approvedItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );

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
          <div className="flex justify-between items-center ">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-lg">
              ₦{cartTotal.toLocaleString()}
            </span>
          </div>
          {hasApprovedItems && hasPendingItems && (
            <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">Approved:</span>
                <span className="text-sm font-medium text-green-600">
                  ₦{approvedTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-orange-600">Pending:</span>
                <span className="text-sm font-medium text-orange-600">
                  ₦{(cartTotal - approvedTotal).toLocaleString()}
                </span>
              </div>
            </div>
          )}
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

      {/* Payment Method Selection - Only show when ready for payment and no pending items */}
      {!hasPendingItems && hasApprovedItems && (
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
        {/* Send to Bar - Show when there are pending items */}
        {hasPendingItems && (
          <button
            onClick={handleSendToBar}
            disabled={
              !hasItems || isSendingToBar || tableBarRequestStatus === "pending"
            }
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              !hasItems || tableBarRequestStatus === "pending"
                ? isDarkMode
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDarkMode
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {isSendingToBar ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Sending to Bar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to Bar ({pendingItems.length} items)
              </>
            )}
          </button>
        )}

        {/* Waiting for bartender - Show when request is pending */}
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

        {/* Complete Sale - Show when no pending items and has approved items */}
        {!hasPendingItems && hasApprovedItems && (
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
                Complete Sale (₦{approvedTotal.toLocaleString()})
              </>
            )}
          </button>
        )}

        {/* No items available message */}
        {!hasPendingItems && !hasApprovedItems && hasItems && (
          <div
            className={`w-full py-3 px-4 rounded-lg text-sm text-center ${
              isDarkMode
                ? "bg-slate-700 text-slate-400"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            No items available for processing
          </div>
        )}
      </div>

      {/* Help Text */}
      {hasItems && (
        <div
          className={`text-xs text-center ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {hasPendingItems &&
            "Send pending items to bar for approval before completing sale"}
          {tableBarRequestStatus === "pending" &&
            "Bartender is reviewing your items"}
          {!hasPendingItems &&
            hasApprovedItems &&
            "All items approved! Complete the sale to collect payment"}
        </div>
      )}
    </div>
  );
}
