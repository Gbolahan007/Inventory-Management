"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  QueryObserverResult,
  RefetchOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Product, SaleItem } from "../(sales)/types";

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

  handleAddExpense: (category: string, amount: number) => void;
  handleRemoveExpense: (id: string) => void;

  tableBarRequestStatus: "none" | "pending" | "approved";
  handleSendToBar: () => void;
  isSendingToBar: boolean;

  refetch?: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any[], Error>>;
  isRefetching: boolean;
  checkBarRequestStatus: () => Promise<void>;
  hasBarApprovalItems: boolean;
  canFinalizeSale: boolean;

  // Split payment props
  isSplitPayment: boolean;
  setIsSplitPayment: (split: boolean) => void;
  cashAmount: number;
  setCashAmount: (amount: number) => void;
  transferAmount: number;
  setTransferAmount: (amount: number) => void;

  selectedTable: number | null;
  currentUserId?: string;
  currentUser?: {
    name: string;
  };
  currentCart?: any;
  onModificationRequested?: () => void;

  products?: Product[];
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
  handleAddExpense,
  handleRemoveExpense,
  tableBarRequestStatus,
  handleSendToBar,
  isSendingToBar,
  refetch,
  isRefetching,
  checkBarRequestStatus,
  hasBarApprovalItems,
  canFinalizeSale,
  isSplitPayment,
  setIsSplitPayment,
  cashAmount,
  setCashAmount,
  transferAmount,
  setTransferAmount,
}: CartFooterProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const categories = ["Kitchen", "Cigarette", "Asun", "Suya"];

  const finalTotal = cartTotal + currentExpensesTotal;

  const addExpense = () => {
    if (!selectedCategory || !expenseAmount) {
      toast.error("Please select a category and enter an amount");
      return;
    }

    const amount = Number.parseFloat(expenseAmount);
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
    if (createSaleMutation.isPending) {
      toast.error("Sale is already being processed");
      return;
    }

    // Validate split payment amounts
    if (isSplitPayment) {
      const totalPaid = cashAmount + transferAmount;
      if (Math.abs(totalPaid - finalTotal) > 0.01) {
        toast.error(
          `Split payment must equal total: ₦${finalTotal.toFixed(2)}`
        );
        return;
      }
      if (cashAmount <= 0 && transferAmount <= 0) {
        toast.error("Please enter valid payment amounts");
        return;
      }
    }

    try {
      setIsRetrying(false);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000)
      );

      await Promise.race([handleFinalizeSale(), timeoutPromise]);
    } catch (error: any) {
      if (error.message === "Request timeout") {
        console.log("⏱️ Timeout detected, retrying once...");
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
      } else {
        toast.error(`Failed to complete sale: ${error.message}`);
      }
    }
  };
  const isProcessing = createSaleMutation.isPending || isRetrying;
  const canSendToBar = hasBarApprovalItems && tableBarRequestStatus === "none";

  // Auto-calculate remaining amount when split payment is enabled
  const handleCashAmountChange = (value: number) => {
    setCashAmount(value);
    const remaining = finalTotal - value;
    setTransferAmount(Math.max(0, remaining));
  };

  const handleTransferAmountChange = (value: number) => {
    setTransferAmount(value);
    const remaining = finalTotal - value;
    setCashAmount(Math.max(0, remaining));
  };

  const splitPaymentBalance = cashAmount + transferAmount - finalTotal;
  const isBalanced = Math.abs(splitPaymentBalance) < 0.01;

  return (
    <div className="space-y-4">
      {refetch && (
        <button
          onClick={async () => {
            await refetch();
            await checkBarRequestStatus();
          }}
          className={`p-2 rounded-full transition ${
            isDarkMode
              ? "hover:bg-slate-700 text-blue-400"
              : "hover:bg-blue-50 text-blue-600"
          }`}
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      )}

      {/* Bar Status Banner */}
      {hasBarApprovalItems && (
        <div
          className={`p-3 rounded-lg border ${
            tableBarRequestStatus === "pending"
              ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700"
              : tableBarRequestStatus === "approved"
              ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
              : "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {tableBarRequestStatus === "pending" ? (
              <>
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    Waiting for Bar Approval
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Drinks/cigarettes sent to bar
                  </p>
                </div>
              </>
            ) : tableBarRequestStatus === "approved" ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Approved by Bar
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    You can now complete the sale
                  </p>
                </div>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Ready to Send
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Send drinks/cigarettes to bar for approval
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
            }).format(cartTotal)}
          </span>
        </div>

        {/* Extra Expenses */}
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
            <div className="flex justify-between items-center text-sm font-medium border-t pt-1">
              <span>Expenses Total</span>
              <span>
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
      {(cartItems.length > 0 || currentExpenses.length > 0) &&
        (!hasBarApprovalItems || tableBarRequestStatus === "approved") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Payment Method
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSplitPayment}
                  onChange={(e) => {
                    setIsSplitPayment(e.target.checked);
                    if (e.target.checked) {
                      // Initialize with half-half split
                      const half = finalTotal / 2;
                      setCashAmount(half);
                      setTransferAmount(half);
                    } else {
                      setCashAmount(0);
                      setTransferAmount(0);
                    }
                  }}
                  className="rounded"
                />
                <span
                  className={isDarkMode ? "text-slate-300" : "text-gray-700"}
                >
                  Split Payment
                </span>
              </label>
            </div>

            {!isSplitPayment ? (
              // Single payment method selection
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
            ) : (
              // Split payment input
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4" />
                        <label className="text-sm font-medium">Cash</label>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={finalTotal}
                        value={cashAmount || ""}
                        onChange={(e) =>
                          handleCashAmountChange(Number(e.target.value))
                        }
                        placeholder="0.00"
                        className={`w-32 p-2 rounded-md border text-right ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4" />
                        <label className="text-sm font-medium">Transfer</label>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={finalTotal}
                        value={transferAmount || ""}
                        onChange={(e) =>
                          handleTransferAmountChange(Number(e.target.value))
                        }
                        placeholder="0.00"
                        className={`w-32 p-2 rounded-md border text-right ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    </div>

                    <div
                      className={`flex items-center justify-between text-sm font-medium pt-2 border-t ${
                        isDarkMode ? "border-slate-600" : "border-gray-300"
                      }`}
                    >
                      <span>Total Paid</span>
                      <span
                        className={
                          isBalanced
                            ? "text-green-600"
                            : splitPaymentBalance > 0
                            ? "text-red-600"
                            : "text-yellow-600"
                        }
                      >
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 2,
                        }).format(cashAmount + transferAmount)}
                        {!isBalanced && (
                          <span className="text-xs ml-1">
                            ({splitPaymentBalance > 0 ? "+" : ""}
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 2,
                            }).format(splitPaymentBalance)}
                            )
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Pending Sale */}
      {(cartItems.length > 0 || currentExpenses.length > 0) &&
        (!hasBarApprovalItems || tableBarRequestStatus === "approved") && (
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
              <input
                type="text"
                value={pendingCustomer}
                onChange={(e) => setPendingCustomer(e.target.value)}
                placeholder="Enter customer name"
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-200"
                    : "bg-gray-50 border-gray-200 text-gray-800"
                }`}
              />
            )}
          </div>
        )}

      {/* Send to Bar Button */}
      {canSendToBar && (
        <button
          onClick={handleSendToBar}
          disabled={isSendingToBar}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            isSendingToBar
              ? isDarkMode
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isDarkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          }`}
        >
          {isSendingToBar ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending to Bar...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send Drinks/Cigarettes to Bar</span>
            </div>
          )}
        </button>
      )}

      {/* Complete Sale Button */}
      <button
        onClick={handleSaleWithTimeout}
        disabled={
          !canFinalizeSale ||
          isProcessing ||
          (isSplitPayment && !isBalanced) ||
          createSaleMutation.isPending
        }
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
          !canFinalizeSale || isProcessing || (isSplitPayment && !isBalanced)
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
