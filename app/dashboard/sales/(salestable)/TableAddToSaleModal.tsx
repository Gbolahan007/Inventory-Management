/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import { useState } from "react";

import SaleForm from "../(sales)/SaleForm";
import TableShoppingCartDisplay from "./TableShoppingCartDisplay";

import type { Product } from "../(sales)/types";
import ModalHeader from "./ModalHeader";
import TableSelector from "./TableSelector";
import { useTableCartLogic } from "./useTableCart";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

interface TableAddToSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  currentUser?: {
    name: string;
  };
  currentUserId?: string;
  refetch?: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<any[], Error>>;

  isRefetching: boolean;
}

export default function TableAddToSaleModal({
  isOpen,
  onClose,
  isDarkMode = false,
  currentUser,
  refetch,
  isRefetching,
  currentUserId,
}: TableAddToSaleModalProps) {
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const { products } = useProducts();

  // Table cart store methods
  const {
    selectedTable,
    setSelectedTable,
    getTableCart,
    getTableTotal,
    getActiveTables,
  } = useTableCartStore();

  // Custom hook for cart logic
  const {
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    currentTotalProfit,
    unitPrice,
    totalPrice,
    isPending,
    setIsPending,
    pendingCustomer,
    setPendingCustomer,
    setPaymentMethod,
    handleProductChange,
    handleQuantityChange,
    handleSellingPriceChange,
    handleAddToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleFinalizeSale,
    createSaleMutation,
    currentExpenses,
    currentExpensesTotal,
    finalTotal,
    handleAddExpense,
    handleRemoveExpense,
    tableBarRequestStatus,
    handleSendToBar,
    isSendingToBar,
  } = useTableCartLogic({ products, currentUser, currentUserId });

  const activeTables = getActiveTables();
  const filteredProducts = products?.filter((item) => item.current_stock !== 0);

  const groupedProducts = filteredProducts?.reduce((groups, product) => {
    const category = product.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  // Category display names and emojis
  const categoryDisplayNames: Record<string, { label: string; emoji: string }> =
    {
      beverages: { label: "Beverages", emoji: "🥤" },
      beer: { label: "Beers", emoji: "🍺" },
      premium: { label: "Alcoholic Drinks", emoji: "🍸" },
      energy: { label: "Energy Drinks", emoji: "⚡" },
      alcoholic: { label: "Alcoholic Drinks", emoji: "🍸" },
      other: { label: "Other", emoji: "📦" },
    };

  const handleCloseModal = () => {
    onClose();
    setIsCartOpenMobile(false);
  };

  const handleFinalizeSaleWithClose = async () => {
    await handleFinalizeSale();
    handleCloseModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleCloseModal}
      />
      <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div
          className={`relative w-full max-w-7xl flex flex-col min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:my-8 sm:rounded-lg shadow-2xl transition-all border ${
            isDarkMode
              ? "bg-slate-800 text-slate-100 border-slate-700"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          {/* Modal Header */}
          <ModalHeader
            isDarkMode={isDarkMode}
            onClose={handleCloseModal}
            activeTables={activeTables}
            selectedTable={selectedTable}
            currentCart={currentCart}
            onOpenMobileCart={() => setIsCartOpenMobile(true)}
          />

          {/* Table Selection Bar */}
          <TableSelector
            isDarkMode={isDarkMode}
            selectedTable={selectedTable}
            onTableSelect={setSelectedTable}
            activeTables={activeTables}
            getTableCart={getTableCart}
          />

          {/* Modal Content - Sidebar Style Layout */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Main Content: Sale Form */}
            <div
              className={`flex-1 ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              } overflow-y-auto`}
            >
              <div className="p-6 lg:p-8">
                {/* Header Section */}
                <div
                  className={`mb-8 pb-6 border-b ${
                    isDarkMode ? "border-slate-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                        Table {selectedTable}
                      </h1>
                      <p
                        className={`${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        Select items to add to this table&lsquo;s order
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <SaleForm
                  products={products}
                  selectedProduct={selectedProduct}
                  quantity={quantity}
                  customSellingPrice={customSellingPrice}
                  selectedProductData={selectedProductData}
                  unitPrice={unitPrice}
                  totalPrice={totalPrice}
                  handleProductChange={handleProductChange}
                  handleQuantityChange={handleQuantityChange}
                  handleSellingPriceChange={handleSellingPriceChange}
                  handleAddToCart={handleAddToCart}
                  groupedProducts={groupedProducts}
                  categoryDisplayNames={categoryDisplayNames}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Sidebar: Shopping Cart */}
            <div
              className={`w-full md:w-[420px] border-l ${
                isDarkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-gray-200 bg-gray-50"
              } shadow-xl`}
            >
              <TableShoppingCartDisplay
                cartItems={currentCart}
                removeFromCart={removeFromCart}
                updateCartItemQuantity={updateCartItemQuantity}
                cartTotal={currentTotal}
                cartTotalProfit={currentTotalProfit}
                isDarkMode={isDarkMode}
                products={products}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                handleFinalizeSale={handleFinalizeSaleWithClose}
                createSaleMutation={createSaleMutation}
                isOpen={isCartOpenMobile}
                onClose={() => setIsCartOpenMobile(false)}
                selectedTable={selectedTable}
                activeTables={activeTables}
                getAllTableCarts={() =>
                  activeTables.map((id) => ({
                    id,
                    items: getTableCart(id),
                    total: getTableTotal(id),
                  }))
                }
                isPending={isPending}
                setIsPending={setIsPending}
                pendingCustomer={pendingCustomer}
                setPendingCustomer={setPendingCustomer}
                currentExpenses={currentExpenses}
                currentExpensesTotal={currentExpensesTotal}
                finalTotal={finalTotal}
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
      </div>
    </div>
  );
}
