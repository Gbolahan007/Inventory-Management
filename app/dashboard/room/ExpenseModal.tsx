"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";
import { addRoomExpense } from "@/app/_lib/actions";

interface Expense {
  id: string;
  booking_id: string | number;
  expense_type: string;
  amount: number;
  created_at: string;
}

interface Booking {
  id: string | number;
  room_type: string;
  num_nights?: number;
  customer_type?: string;
  discount_sale?: boolean | string;
  price?: number | string;
  total_price?: number;
  category: string;
  created_at?: string;
}

interface ExpenseModalProps {
  selectedBooking: Booking | null;
  bookingExpenses: Record<string | number, Expense[]>;
  onClose: () => void;
  onDeleteExpense: (expenseId: string) => void;
  formatCurrency: (amount: number | string) => string;
  formatDateTime: (dateString?: string) => string;
  onRefresh?: () => void;
}

const EXPENSE_TYPES = ["Kitchen", "Drinks", "Asun", "Cigar", "Other"];

export function ExpenseModal({
  selectedBooking,
  bookingExpenses,
  onClose,
  onDeleteExpense,
  formatCurrency,
  formatDateTime,
  onRefresh,
}: ExpenseModalProps) {
  const [expenseType, setExpenseType] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!selectedBooking) return null;

  const expenses = bookingExpenses[selectedBooking.id] || [];
  const basePrice = Number(selectedBooking.total_price) || 0;
  const expensesTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const grandTotal = basePrice + expensesTotal;

  // ✅ Handle Add Expense (Server Action)
  async function handleAddExpense(formData: FormData) {
    try {
      await addRoomExpense(formData);
      setExpenseType("");
      setExpenseAmount("");
      onRefresh?.();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Booking Details & Expenses
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {selectedBooking.room_type} -{" "}
              {formatDateTime(selectedBooking.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          {/* Booking Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Base Price</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(selectedBooking.total_price || 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">
                  Customer Type
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedBooking.customer_type}
                </p>
              </div>
              {selectedBooking.num_nights && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Nights</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedBooking.num_nights}
                  </p>
                </div>
              )}
              <div>
                <p className="text-slate-600 dark:text-slate-400">Discount</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedBooking.discount_sale === "true" ||
                  selectedBooking.discount_sale === true
                    ? "Yes"
                    : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Add Expense Form (Server Action Form) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Add New Expense
            </h3>

            <form
              action={(formData) =>
                startTransition(() => handleAddExpense(formData))
              }
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="hidden"
                name="booking_id"
                value={selectedBooking.id}
              />

              <select
                name="expense_type"
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select expense type</option>
                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount (₦)"
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                disabled={isPending || !expenseType || !expenseAmount}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Expenses List
            </h3>
            {expenses.length > 0 ? (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {expense.expense_type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(expense.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(expense.amount)}
                      </p>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No expenses added yet
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Grand Total
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Base: {formatCurrency(basePrice)} + Expenses:{" "}
                  {formatCurrency(expensesTotal)}
                </p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
