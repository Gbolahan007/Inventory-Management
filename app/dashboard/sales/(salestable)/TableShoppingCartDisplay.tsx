/* eslint-disable @typescript-eslint/no-explicit-any */

import { Expense } from "@/app/(store)/useExpensesStore";
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
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
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
}: TableShoppingCartDisplayProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "payment">("items");

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
              /* CART ITEMS TAB */
              <div className="p-4">
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
                        className={`mb-4 p-3 rounded-lg border ${
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
                                className={`w-5 h-5 ${
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
                                className={`w-5 h-5 ${
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
                                className={`w-5 h-5 ${
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
                  </>
                )}
              </div>
            ) : (
              /* PAYMENT TAB */
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
          />
        </div>
      </div>
    </div>
  );
}
