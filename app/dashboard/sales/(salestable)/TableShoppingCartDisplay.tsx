import { X } from "lucide-react";
import type React from "react";
import type { Product, SaleItem, TableCart } from "../(sales)/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { StatusIndicator } from "./StatusIndicator";
import { CartContent } from "./CartContent";
import { CartFooter } from "./CartFooter";

interface TableShoppingCartDisplayProps {
  cartItems: SaleItem[];
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
  handleSendToBar: () => void;
  createSaleMutation: UseMutationResult<any, Error, any, unknown>;
  createBarRequestMutation: UseMutationResult<any, Error, any, unknown>;
  isOpen: boolean;
  onClose: () => void;
  selectedTable: number;
  activeTables: number[];
  tableBarRequestStatus: "none" | "pending" | "given";
  getAllTableCarts: () => TableCart[];
}

export default function TableShoppingCartDisplay({
  cartItems,
  removeFromCart,
  updateCartItemQuantity,
  cartTotal,
  cartTotalProfit,
  isDarkMode,
  products,
  paymentMethod,
  setPaymentMethod,
  handleFinalizeSale,
  handleSendToBar,
  createSaleMutation,
  createBarRequestMutation,
  isOpen,
  onClose,
  selectedTable,
  activeTables,
  tableBarRequestStatus,
  getAllTableCarts,
}: TableShoppingCartDisplayProps) {
  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />
        <div
          className={`fixed  inset-x-0 bottom-0 rounded-t-xl max-h-[90vh] flex flex-col ${
            isDarkMode
              ? "bg-slate-800 text-slate-100"
              : "bg-white text-gray-900"
          }`}
        >
          {/* Mobile Header */}
          <div
            className={`p-4 border-b flex items-center justify-between  ${
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

          {/* Mobile Status */}
          <div className="p-4">
            <StatusIndicator
              status={tableBarRequestStatus}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Mobile Cart Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <CartContent
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              updateCartItemQuantity={updateCartItemQuantity}
              isDarkMode={isDarkMode}
              tableBarRequestStatus={tableBarRequestStatus}
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
              handleSendToBar={handleSendToBar}
              handleFinalizeSale={handleFinalizeSale}
              createSaleMutation={createSaleMutation}
              createBarRequestMutation={createBarRequestMutation}
              isDarkMode={isDarkMode}
              tableBarRequestStatus={tableBarRequestStatus}
              cartItems={cartItems}
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
          <StatusIndicator
            status={tableBarRequestStatus}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Desktop Cart Content */}
        <div className="p-6">
          <CartContent
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateCartItemQuantity={updateCartItemQuantity}
            isDarkMode={isDarkMode}
            tableBarRequestStatus={tableBarRequestStatus}
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
            handleSendToBar={handleSendToBar}
            handleFinalizeSale={handleFinalizeSale}
            createSaleMutation={createSaleMutation}
            createBarRequestMutation={createBarRequestMutation}
            isDarkMode={isDarkMode}
            tableBarRequestStatus={tableBarRequestStatus}
            cartItems={cartItems}
          />
        </div>
      </div>
    </div>
  );
}
