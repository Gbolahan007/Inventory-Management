/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, ArrowRight } from "lucide-react";
import { createBarModification } from "@/app/_lib/actions";
import toast from "react-hot-toast";
import { SaleItem } from "@/app/(dashboard)/TopSellingItems";

interface ModificationRequestProps {
  cartItems: SaleItem[];
  selectedTable: number | null;
  currentUserId?: string;
  currentUser?: {
    name: string;
  };
  products?: any[];
  onModificationRequested: () => void;
}

export function ModificationRequest({
  cartItems,
  selectedTable,
  currentUserId,
  currentUser,
  products,
  onModificationRequested,
}: ModificationRequestProps) {
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [modificationType, setModificationType] = useState<
    "exchange" | "return" | "quantity_change"
  >("exchange");
  const [selectedCartItemIndex, setSelectedCartItemIndex] = useState<
    number | null
  >(null);
  const [newProductId, setNewProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCartItem =
    selectedCartItemIndex !== null ? cartItems[selectedCartItemIndex] : null;

  const handleRequestModification = async () => {
    if (!selectedCartItem) {
      toast.error("Please select an item to modify");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the modification");
      return;
    }

    if (modificationType === "exchange" && !newProductId) {
      toast.error("Please select a replacement product");
      return;
    }

    setIsSubmitting(true);

    try {
      const modificationData: any = {
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser?.name,
        modification_type: modificationType,
        original_product_id: selectedCartItem.product_id,
        original_product_name: selectedCartItem.name,
        original_quantity: selectedCartItem.quantity,
        reason: reason.trim(),
      };

      if (modificationType === "exchange") {
        const newProduct = products?.find((p) => p.id === newProductId);
        modificationData.new_product_id = newProductId;
        modificationData.new_product_name = newProduct?.name;
        modificationData.new_quantity = newQuantity;
      } else if (modificationType === "quantity_change") {
        modificationData.new_quantity = newQuantity;
      }

      const result = await createBarModification(modificationData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Modification request sent to bar!");
      setShowModificationModal(false);
      resetForm();
      onModificationRequested();
    } catch (error: any) {
      console.error("Error requesting modification:", error);
      toast.error(`Failed to request modification: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCartItemIndex(null);
    setNewProductId("");
    setNewQuantity(1);
    setReason("");
    setModificationType("exchange");
  };

  const handleCloseModal = () => {
    setShowModificationModal(false);
    resetForm();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModificationModal(true)}
        className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Request Modification
      </button>

      {/* Modal */}
      {showModificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 z-10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Request Modification
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Request changes to approved items from the bar
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Modification Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Modification Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setModificationType("exchange")}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      modificationType === "exchange"
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    Exchange
                  </button>
                  <button
                    onClick={() => setModificationType("quantity_change")}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      modificationType === "quantity_change"
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    Qty Change
                  </button>
                  <button
                    onClick={() => setModificationType("return")}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      modificationType === "return"
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    Return
                  </button>
                </div>
              </div>

              {/* Select Item from Cart */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Item to Modify
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                  {cartItems.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                      No items in cart
                    </p>
                  ) : (
                    cartItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCartItemIndex(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedCartItemIndex === index
                            ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-600"
                            : "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Qty: {item.quantity} × ₦
                              {item.unit_price?.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-slate-800 dark:text-white">
                            ₦{item.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Modification Details */}
              {selectedCartItem && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                    Modification Details
                  </h3>

                  {modificationType === "exchange" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                            REMOVE
                          </p>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {selectedCartItem.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Qty: {selectedCartItem.quantity}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                        <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                            ADD
                          </p>
                          <select
                            value={newProductId}
                            onChange={(e) => setNewProductId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white mb-2"
                          >
                            <option value="">Select product...</option>
                            {products?.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - ₦
                                {product.selling_price?.toLocaleString()}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) =>
                              setNewQuantity(Number(e.target.value))
                            }
                            min={1}
                            placeholder="Quantity"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {modificationType === "quantity_change" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Current Quantity
                          </label>
                          <input
                            type="number"
                            value={selectedCartItem.quantity}
                            disabled
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white"
                          />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 mt-6" />
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            New Quantity
                          </label>
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) =>
                              setNewQuantity(Number(e.target.value))
                            }
                            min={0}
                            max={selectedCartItem.quantity}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Note: New quantity cannot exceed approved quantity
                      </p>
                    </div>
                  )}

                  {modificationType === "return" && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                        You are requesting to return:
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {selectedCartItem.name} × {selectedCartItem.quantity}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Value: ₦{selectedCartItem.total_price?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reason for Modification{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a clear reason for this modification..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Examples: Customer changed mind, wrong item prepared, customer
                  allergic, etc.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestModification}
                disabled={isSubmitting || !selectedCartItem || !reason.trim()}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
