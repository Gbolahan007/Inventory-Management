"use client";

import type React from "react";
import type { Product } from "./types";

interface SaleFormProps {
  products: Product[] | undefined;
  selectedProduct: string;
  quantity: number;
  customSellingPrice: number;
  selectedProductData: Product | undefined;
  unitPrice: number;
  totalPrice: number;
  handleProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSellingPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddToCart: () => void;
  groupedProducts: Record<string, Product[]> | undefined;
  categoryDisplayNames: Record<string, { label: string; emoji: string }>;
  isDarkMode: boolean;
  disabled?: boolean;
}

export default function SaleForm({
  selectedProduct,
  quantity,
  customSellingPrice,
  selectedProductData,
  unitPrice,
  totalPrice,
  handleProductChange,
  handleQuantityChange,
  handleSellingPriceChange,
  handleAddToCart,
  groupedProducts,
  categoryDisplayNames,
  isDarkMode,
}: SaleFormProps) {
  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Name */}
        <div className="space-y-3">
          <label
            htmlFor="productName"
            className={`block text-sm font-semibold ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            Product Name *
          </label>
          <select
            id="productName"
            value={selectedProduct}
            onChange={handleProductChange}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Select a product</option>
            {groupedProducts &&
              Object.entries(groupedProducts).map(
                ([category, categoryProducts]) => {
                  const categoryInfo =
                    categoryDisplayNames[category.toLowerCase()] ||
                    categoryDisplayNames.other;
                  return (
                    <optgroup
                      key={category}
                      label={`${categoryInfo.emoji} ${categoryInfo.label}`}
                    >
                      {categoryProducts.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          {" - ₦"}
                          {product.selling_price}
                        </option>
                      ))}
                    </optgroup>
                  );
                }
              )}
          </select>
        </div>
        {/* Selling Price */}
        <div className="space-y-3">
          <label
            htmlFor="sellingPrice"
            className={`block text-sm font-semibold ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            Selling Price (₦) *
          </label>
          <div className="relative">
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              ₦
            </span>
            <input
              type="number"
              id="sellingPrice"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={customSellingPrice || ""}
              onChange={handleSellingPriceChange}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            />
          </div>
          {selectedProductData &&
            customSellingPrice !== selectedProductData.selling_price && (
              <p
                className={`text-sm ${
                  isDarkMode ? "text-amber-400" : "text-amber-600"
                }`}
              >
                Default: ₦{selectedProductData.selling_price}
              </p>
            )}
        </div>
        {/* Quantity */}
        <div className="space-y-3">
          <label
            htmlFor="quantity"
            className={`block text-sm font-semibold ${
              isDarkMode ? "text-slate-300" : "text-gray-700"
            }`}
          >
            Quantity *
          </label>
          <input
            id="quantity"
            min="1"
            max={selectedProductData?.current_stock || 999}
            value={quantity}
            onChange={handleQuantityChange}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-gray-50 border-gray-300 text-gray-900"
            }`}
          />
          {selectedProductData && (
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Available stock: {selectedProductData.current_stock}
            </p>
          )}
        </div>
      </div>
      {/* Price Information Display */}
      {selectedProductData && quantity > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-slate-300" : "text-gray-700"
              }`}
            >
              Unit Price
            </label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                ₦
              </span>
              <input
                type="text"
                value={unitPrice.toFixed(2)}
                readOnly
                className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 cursor-not-allowed ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div className="space-y-3">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-slate-300" : "text-gray-700"
              }`}
            >
              Total Price
            </label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                ₦
              </span>
              <input
                type="text"
                value={totalPrice.toFixed(2)}
                readOnly
                className={`w-full pl-8 pr-4 py-3 rounded-lg border-2 cursor-not-allowed ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>
      )}
      {/* Add to Cart Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedProductData || quantity <= 0}
          className={`px-6 py-3 rounded-lg font-medium ${
            !selectedProductData || quantity <= 0
              ? isDarkMode
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isDarkMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
