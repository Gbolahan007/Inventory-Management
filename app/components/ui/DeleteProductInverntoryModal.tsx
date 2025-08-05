"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface Product {
  id?: number;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  profit: number;
  current_stock: number;
  low_stock: number;
  created_at: string;
}

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (productId: number) => Promise<void>;
  product: Product | null;
  isDarkMode: boolean;
}
const DeleteProductInverntoryModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  product,
  isDarkMode,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!product?.id) return;

    setIsLoading(true);
    try {
      await onDelete(product.id);
      onClose();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  if (!isOpen || !product) return null;

  const isLowStock = product.current_stock <= product.low_stock;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-red-600 dark:text-red-400">
              Delete Product
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Warning: This action cannot be undone
                </h3>
                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">
                  You are about to permanently delete this product from your
                  inventory.
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div
            className={`rounded-md border p-3 sm:p-4 ${
              isDarkMode
                ? "border-gray-600 bg-gray-700"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h4 className="font-medium mb-3 text-sm sm:text-base">
              Product Details:
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Name:
                </span>
                <span className="text-right truncate ml-2">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Category:
                </span>
                <span className="capitalize">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Current Stock:
                </span>
                <span
                  className={`font-medium ${
                    isLowStock ? "text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {product.current_stock} pcs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Selling Price:
                </span>
                <span>{formatCurrency(product.selling_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Date Added:
                </span>
                <span>{formatDate(product.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Simple confirmation message */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{product.name}</strong>?
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 border rounded-md font-medium transition-colors order-2 sm:order-1 ${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md font-medium transition-colors order-1 sm:order-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductInverntoryModal;
