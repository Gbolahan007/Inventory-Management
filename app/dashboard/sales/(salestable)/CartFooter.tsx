/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreditCard, Banknote, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SaleItem } from "../(sales)/types";
import type { UseMutationResult } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface Expense {
  category: string;
  amount: number;
  id: string;
}

interface CartFooterProps {
  cartTotal: number;
  cartTotalProfit: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleFinalizeSale: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  isDarkMode: boolean;
  cartItems: SaleItem[];
  currentExpenses: Expense[];

  isPending: boolean;
  setIsPending: (pending: boolean) => void;
  pendingCustomer: string;
  setPendingCustomer: (customer: string) => void;

  currentExpensesTotal: number;
  finalTotal: number;

  handleAddExpense: (category: string, amount: number) => void;
  handleRemoveExpense: (id: string) => void;
}

export function CartFooter({
  cartTotal,
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  createSaleMutation,
  isDarkMode,
  cartItems,
  isPending,
  setIsPending,
  pendingCustomer,
  setPendingCustomer,
  currentExpenses,
  currentExpensesTotal,
  finalTotal,
  handleAddExpense,
  handleRemoveExpense,
}: CartFooterProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const categories = ["Kitchen", "Cigarette"];

  const addExpense = () => {
    if (!selectedCategory || !expenseAmount) {
      toast.error("Please select a category and enter an amount");
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    handleAddExpense(selectedCategory, amount);
    setSelectedCategory("");
    setExpenseAmount("");
  };

  const removeExpense = (expenseId: string) => {
    handleRemoveExpense(expenseId);
  };

  const handleSaleWithTimeout = async () => {
    try {
      setIsRetrying(false);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      // Wait for the sale to complete
      await Promise.race([handleFinalizeSale(), timeoutPromise]);
    } catch (error) {
      console.log(error);
      setIsRetrying(true);
      setTimeout(async () => {
        try {
          await handleFinalizeSale();
          setIsRetrying(false);
        } catch {
          setIsRetrying(false);
          toast.error(
            "Sale failed. Please check your connection and try again."
          );
        }
      }, 2000);
    }
  };

  const isProcessing = createSaleMutation.isPending || isRetrying;
  const canFinalizeSale = cartItems.length > 0 || currentExpenses.length > 0;

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
          <span className="font-semibold">Cart Total</span>
          <span className="text-lg font-bold">
            {" "}
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
            }).format(cartTotal)}
          </span>
        </div>

        {/* 🔹 Show Extra Expenses */}
        {currentExpenses.length > 0 && (
          <div className="space-y-1 mb-2">
            <div className="text-xs text-gray-500 mb-1">Extra Expenses:</div>
            {currentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center text-sm"
              >
                <span>{expense.category}</span>

                <div className="flex items-center space-x-2">
                  <span>
                    {" "}
                    {new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 2,
                    }).format(expense.amount)}
                  </span>
                  <button
                    onClick={() => removeExpense(expense.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Expenses subtotal */}
            <div className="flex justify-between items-center text-sm font-medium border-t pt-1">
              <span>Expenses Total</span>
              <span>
                {" "}
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 2,
                }).format(currentExpensesTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between items-center border-t pt-2">
          <span className="font-semibold">Final Total</span>
          <span className="text-xl font-bold">
            {" "}
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
            }).format(finalTotal)}
          </span>
        </div>
      </div>

      {/* Expense Input */}
      <div className="flex items-center space-x-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`p-2 rounded-md border flex-1 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-300"
          }`}
        >
          <option value="">Select Expense</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          placeholder="Amount"
          className={`p-2 rounded-md border w-28 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-300"
          }`}
        />
        <button
          onClick={addExpense}
          disabled={!selectedCategory || !expenseAmount}
          className={`p-2 rounded-md text-white ${
            !selectedCategory || !expenseAmount
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
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

      {/* Pending Sale */}
      {(cartItems.length > 0 || currentExpenses.length > 0) && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPending}
              onChange={(e) => setIsPending(e.target.checked)}
            />
            <span className="text-sm">Mark as Pending</span>
          </label>

          {isPending && (
            <select
              value={pendingCustomer}
              onChange={(e) => setPendingCustomer(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <option value="">Select Customer</option>
              {[
                "daddy yo",
                "kola",
                "customer",
                "canada",
                "baba cocky",
                "dammy",
                "attitude",
                "bro deji",
                "wole",
              ].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
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
    </div>
  );
}
