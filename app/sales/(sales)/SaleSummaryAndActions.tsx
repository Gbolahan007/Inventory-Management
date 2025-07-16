"use client";
import type { SaleItem } from "./types";
import type { UseMutationResult } from "@tanstack/react-query";

interface CreateSaleVariables {
  items: SaleItem[];
  total: number;
  paymentMethod: string;
}

interface CreateSaleResponse {
  saleId: string;
  message: string;
}

interface SaleSummaryAndActionsProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleFinalizeSale: () => Promise<void>;
  cartTotal: number;
  cartItems: SaleItem[];
  createSaleMutation: UseMutationResult<
    CreateSaleResponse,
    Error,
    CreateSaleVariables
  >;
  isDarkMode: boolean;
}

export default function SaleSummaryAndActions({
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  cartTotal,
  cartItems,
  createSaleMutation,
  isDarkMode,
}: SaleSummaryAndActionsProps) {
  return (
    <div className="space-y-3">
      <label
        className={`block text-sm font-semibold ${
          isDarkMode ? "text-slate-300" : "text-gray-700"
        }`}
      >
        Payment Method
      </label>
      <div className="flex gap-4">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={`px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isDarkMode
              ? "bg-slate-700 border-slate-600 text-slate-100"
              : "bg-gray-50 border-gray-300 text-gray-900"
          }`}
        >
          <option value="cash">💵 Cash</option>
          <option value="card">💳 Card</option>
          <option value="transfer">🏦 Bank Transfer</option>
        </select>
        <button
          type="button"
          onClick={handleFinalizeSale}
          disabled={cartItems.length === 0 || createSaleMutation.isPending}
          className={`px-6 py-3 rounded-lg font-medium ${
            cartItems.length === 0 || createSaleMutation.isPending
              ? isDarkMode
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isDarkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {createSaleMutation.isPending
            ? "Processing..."
            : `Complete Sale (₦${cartTotal.toFixed(
                2
              )}) - ${paymentMethod.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
