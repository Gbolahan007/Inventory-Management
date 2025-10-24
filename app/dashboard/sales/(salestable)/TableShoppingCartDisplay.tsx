"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Expense } from "@/app/(store)/useExpensesStore";
import type {
  QueryObserverResult,
  RefetchOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Send,
  ShoppingCart,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Product, SaleItem, TableCart } from "../(sales)/types";
import { CartContent } from "./CartContent";
import { CartFooter } from "./CartFooter";

interface TableShoppingCartDisplayProps {
  cartItems: SaleItem[];
  currentExpenses: Expense[];
  currentExpensesTotal: number;
  finalTotal: number;

  removeFromCart: (productId: string, unitPrice: number) => void;
  updateCartItemQuantity: (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => void;
  cartTotal: number;
  cartTotalProfit: number;
  isDarkMode: boolean;
  products?: Product[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  handleFinalizeSale: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  isOpen: boolean;
  onClose: () => void;
  selectedTable: number;
  activeTables: number[];
  getAllTableCarts: () => TableCart[];

  isPending: boolean;
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
  pendingCustomer: string;
  setPendingCustomer: React.Dispatch<React.SetStateAction<string>>;

  handleAddExpense: (category: string, amount: number) => void;
  handleRemoveExpense: (id: string) => void;

  tableBarRequestStatus: "pending" | "approved" | "none";
  handleSendToBar: () => Promise<void> | void;
  isSendingToBar: boolean;

  refetch?: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any[], Error>>;

  isRefetching: boolean;

  checkBarRequestStatus: () => Promise<void>;

  hasBarApprovalItems: boolean;
  canFinalizeSale: boolean;

  isSplitPayment: boolean;
  setIsSplitPayment: (split: boolean) => void;
  cashAmount: number;
  setCashAmount: (amount: number) => void;
  transferAmount: number;
  setTransferAmount: (amount: number) => void;

  currentUserId?: string;
  currentUser?: {
    name: string;
  };
}

export default function TableShoppingCartDisplay({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  cartTotal,
  cartTotalProfit,
  isDarkMode,
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  createSaleMutation,
  isOpen,
  onClose,
  selectedTable,
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
  currentUserId,
  currentUser,
  products,
}: TableShoppingCartDisplayProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "payment">("items");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const categories = ["Kitchen", "Cigarette", "Asun", "Suya"];

  useEffect(() => {
    if (isOpen) {
      setIsSliding(true);
      setActiveTab("items");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsSliding(false);
    setTimeout(onClose, 300);
  };

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

  const canSendToBar = hasBarApprovalItems && tableBarRequestStatus === "none";

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isSliding ? "opacity-60" : "opacity-0"
          }`}
          onClick={handleClose}
        />

        {/* Main Cart Container */}
        <div
          className={`fixed inset-0 flex flex-col transition-transform duration-300 ease-out ${
            isSliding ? "translate-y-0" : "translate-y-full"
          } ${
            isDarkMode
              ? "bg-slate-900 text-slate-100"
              : "bg-white text-gray-900"
          }`}
        >
          {/* Fixed Header */}
          <div
            className={`px-4 py-3 border-b ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    isDarkMode ? "bg-blue-600" : "bg-blue-500"
                  } text-white`}
                >
                  {selectedTable}
                </div>
                <div>
                  <h3 className="text-base font-bold">Table {selectedTable}</h3>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {refetch && (
                  <button
                    onClick={async () => {
                      await refetch();
                      await checkBarRequestStatus();
                    }}
                    className={`p-2 rounded-lg transition ${
                      isDarkMode
                        ? "hover:bg-slate-800 text-blue-400"
                        : "hover:bg-blue-50 text-blue-600"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefetching ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-slate-800 active:bg-slate-700"
                      : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div
              className={`flex gap-2 p-1 rounded-lg ${
                isDarkMode ? "bg-slate-800" : "bg-gray-100"
              }`}
            >
              <button
                onClick={() => setActiveTab("items")}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === "items"
                    ? isDarkMode
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : isDarkMode
                    ? "text-slate-400"
                    : "text-gray-600"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart Items</span>
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === "payment"
                    ? isDarkMode
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-white text-gray-900 shadow-sm"
                    : isDarkMode
                    ? "text-slate-400"
                    : "text-gray-600"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Payment</span>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "items" ? (
              /* CART ITEMS TAB - WITH EXPENSES AND SEND TO BAR */
              <div className="p-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        isDarkMode ? "bg-slate-800" : "bg-gray-100"
                      }`}
                    >
                      <ShoppingCart
                        className={`w-10 h-10 ${
                          isDarkMode ? "text-slate-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-base font-medium ${
                        isDarkMode ? "text-slate-300" : "text-gray-600"
                      }`}
                    >
                      Cart is empty
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      Add items to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Bar Approval Status */}
                    {hasBarApprovalItems && (
                      <div
                        className={`p-3 rounded-lg border ${
                          tableBarRequestStatus === "approved"
                            ? isDarkMode
                              ? "bg-green-900/20 border-green-700"
                              : "bg-green-50 border-green-200"
                            : tableBarRequestStatus === "pending"
                            ? isDarkMode
                              ? "bg-yellow-900/20 border-yellow-700"
                              : "bg-yellow-50 border-yellow-200"
                            : isDarkMode
                            ? "bg-blue-900/20 border-blue-700"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tableBarRequestStatus === "pending" ? (
                            <>
                              <Clock
                                className={`w-5 h-5 flex-shrink-0 ${
                                  isDarkMode
                                    ? "text-yellow-400"
                                    : "text-yellow-600"
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isDarkMode
                                      ? "text-yellow-300"
                                      : "text-yellow-800"
                                  }`}
                                >
                                  Waiting for Bar Approval
                                </p>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-yellow-400"
                                      : "text-yellow-600"
                                  }`}
                                >
                                  Drinks/cigarettes sent to bar
                                </p>
                              </div>
                            </>
                          ) : tableBarRequestStatus === "approved" ? (
                            <>
                              <CheckCircle
                                className={`w-5 h-5 flex-shrink-0 ${
                                  isDarkMode
                                    ? "text-green-400"
                                    : "text-green-600"
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isDarkMode
                                      ? "text-green-300"
                                      : "text-green-800"
                                  }`}
                                >
                                  Approved by Bar
                                </p>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                >
                                  Ready to complete the sale
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Send
                                className={`w-5 h-5 flex-shrink-0 ${
                                  isDarkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                              />
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isDarkMode
                                      ? "text-blue-300"
                                      : "text-blue-800"
                                  }`}
                                >
                                  Ready to Send
                                </p>
                                <p
                                  className={`text-xs ${
                                    isDarkMode
                                      ? "text-blue-400"
                                      : "text-blue-600"
                                  }`}
                                >
                                  Send to bar for approval
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cart Items */}
                    <CartContent
                      cartItems={cartItems}
                      removeFromCart={removeFromCart}
                      updateCartItemQuantity={updateCartItemQuantity}
                      isDarkMode={isDarkMode}
                    />

                    <div
                      className={`p-4 rounded-lg border-2 ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 ${
                          isDarkMode ? "text-slate-200" : "text-gray-700"
                        }`}
                      >
                        Add Extra Expenses
                      </h4>

                      {/* Expense Input Form */}
                      <div className="space-y-2 mb-3">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={`w-full p-2.5 rounded-lg border text-sm ${
                            isDarkMode
                              ? "bg-slate-700 border-slate-600 text-slate-100"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="">Select Expense Type</option>
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="Amount (₦)"
                            className={`flex-1 p-2.5 rounded-lg border text-sm ${
                              isDarkMode
                                ? "bg-slate-700 border-slate-600 text-slate-100"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                          <button
                            onClick={addExpense}
                            disabled={!selectedCategory || !expenseAmount}
                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                              !selectedCategory || !expenseAmount
                                ? isDarkMode
                                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : isDarkMode
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Expenses List */}
                      {currentExpenses.length > 0 && (
                        <div
                          className={`space-y-2 pt-3 border-t ${
                            isDarkMode ? "border-slate-700" : "border-gray-200"
                          }`}
                        >
                          <p
                            className={`text-xs font-medium ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            Added Expenses:
                          </p>
                          {currentExpenses.map((expense) => (
                            <div
                              key={expense.id}
                              className={`flex items-center justify-between p-2 rounded-md ${
                                isDarkMode ? "bg-slate-700" : "bg-white"
                              }`}
                            >
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    isDarkMode
                                      ? "text-slate-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {expense.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-semibold ${
                                    isDarkMode
                                      ? "text-blue-400"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {new Intl.NumberFormat("en-NG", {
                                    style: "currency",
                                    currency: "NGN",
                                    minimumFractionDigits: 2,
                                  }).format(expense.amount)}
                                </span>
                                <button
                                  onClick={() => removeExpense(expense.id)}
                                  className={`p-1.5 rounded-md transition ${
                                    isDarkMode
                                      ? "hover:bg-red-900/30 text-red-400"
                                      : "hover:bg-red-50 text-red-600"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {canSendToBar && (
                      <button
                        onClick={handleSendToBar}
                        disabled={isSendingToBar}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
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
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending to Bar...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Drinks/Cigarettes to Bar</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* PAYMENT TAB - ONLY TOTALS AND COMPLETE SALE */
              <div className="p-4">
                <CartFooter
                  cartTotal={cartTotal}
                  cartTotalProfit={cartTotalProfit}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  handleFinalizeSale={handleFinalizeSale}
                  createSaleMutation={createSaleMutation}
                  isDarkMode={isDarkMode}
                  cartItems={cartItems}
                  isPending={isPending}
                  setIsPending={setIsPending}
                  pendingCustomer={pendingCustomer}
                  setPendingCustomer={setPendingCustomer}
                  currentExpenses={currentExpenses}
                  currentExpensesTotal={currentExpensesTotal}
                  handleAddExpense={handleAddExpense}
                  handleRemoveExpense={handleRemoveExpense}
                  tableBarRequestStatus={tableBarRequestStatus}
                  handleSendToBar={handleSendToBar}
                  isSendingToBar={isSendingToBar}
                  refetch={refetch}
                  isRefetching={isRefetching}
                  checkBarRequestStatus={checkBarRequestStatus}
                  hasBarApprovalItems={hasBarApprovalItems}
                  canFinalizeSale={canFinalizeSale}
                  isSplitPayment={isSplitPayment}
                  setIsSplitPayment={setIsSplitPayment}
                  cashAmount={cashAmount}
                  setCashAmount={setCashAmount}
                  transferAmount={transferAmount}
                  setTransferAmount={setTransferAmount}
                  selectedTable={selectedTable}
                  currentUserId={currentUserId}
                  currentUser={currentUser}
                  products={products}
                  onModificationRequested={() => checkBarRequestStatus()}
                  isMobilePaymentTab={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view remains the same
  return (
    <div
      className={`hidden md:flex md:w-96 border-l flex-col h-full ${
        isDarkMode
          ? "border-slate-700 bg-slate-900"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        <div
          className={`p-6 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold tracking-tight">
              Table {selectedTable}
            </h3>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </div>
          </div>

          {cartItems.length > 0 && (
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                isDarkMode
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-green-100 text-green-800 border-green-300"
              }`}
            >
              Ready for Payment
            </div>
          )}
        </div>

        <div className="p-6">
          <CartContent
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateCartItemQuantity={updateCartItemQuantity}
            isDarkMode={isDarkMode}
          />
        </div>

        <div
          className={`p-6 border-t ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <CartFooter
            cartTotal={cartTotal}
            cartTotalProfit={cartTotalProfit}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleFinalizeSale={handleFinalizeSale}
            createSaleMutation={createSaleMutation}
            isDarkMode={isDarkMode}
            cartItems={cartItems}
            isPending={isPending}
            setIsPending={setIsPending}
            pendingCustomer={pendingCustomer}
            setPendingCustomer={setPendingCustomer}
            currentExpenses={currentExpenses}
            currentExpensesTotal={currentExpensesTotal}
            handleAddExpense={handleAddExpense}
            handleRemoveExpense={handleRemoveExpense}
            tableBarRequestStatus={tableBarRequestStatus}
            handleSendToBar={handleSendToBar}
            isSendingToBar={isSendingToBar}
            refetch={refetch}
            isRefetching={isRefetching}
            checkBarRequestStatus={checkBarRequestStatus}
            hasBarApprovalItems={hasBarApprovalItems}
            canFinalizeSale={canFinalizeSale}
            isSplitPayment={isSplitPayment}
            setIsSplitPayment={setIsSplitPayment}
            cashAmount={cashAmount}
            setCashAmount={setCashAmount}
            transferAmount={transferAmount}
            setTransferAmount={setTransferAmount}
            selectedTable={selectedTable}
            currentUserId={currentUserId}
            currentUser={currentUser}
            products={products}
          />
        </div>
      </div>
    </div>
  );
}
