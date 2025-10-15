/* eslint-disable @typescript-eslint/no-explicit-any */

import { X } from "lucide-react";
import type React from "react";
import type { Product, SaleItem, TableCart } from "../(sales)/types";
import type {
  QueryObserverResult,
  RefetchOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { CartContent } from "./CartContent";
import { CartFooter } from "./CartFooter";
import { Expense } from "@/app/(store)/useExpensesStore";

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
}: TableShoppingCartDisplayProps) {
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />
        <div
          className={`fixed inset-x-0 bottom-0 rounded-t-xl max-h-[90vh] flex flex-col ${
            isDarkMode
              ? "bg-slate-800 text-slate-100"
              : "bg-white text-gray-900"
          }`}
        >
          {/* Mobile Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold">
              Table {selectedTable} Cart
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${
                isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Cart Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <CartContent
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              updateCartItemQuantity={updateCartItemQuantity}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Mobile Footer */}
          <div
            className={`p-4 border-t ${
              isDarkMode
                ? "border-slate-700 bg-slate-900"
                : "border-gray-200 bg-gray-50"
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
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hidden md:flex md:w-96 border-l flex-col h-full ${
        isDarkMode
          ? "border-slate-700 bg-slate-900"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Desktop Header */}
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

        {/* Desktop Cart Content */}
        <div className="p-6">
          <CartContent
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateCartItemQuantity={updateCartItemQuantity}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Desktop Footer */}
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
          />
        </div>
      </div>
    </div>
  );
}
