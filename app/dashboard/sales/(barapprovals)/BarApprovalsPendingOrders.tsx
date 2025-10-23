/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Edit2, Save, X, Plus, Minus, Trash2 } from "lucide-react";
import { modifyBarFulfillment } from "@/app/_lib/actions";
import toast from "react-hot-toast";
import PartialFulfillmentForm from "./BarApprovalsPartialFulfillmentForm";
import { supabase } from "@/app/_lib/supabase";

interface PendingOrdersTabProps {
  groupedArray: any[];
  isLoading: boolean;
  editingFulfillment: string | null;
  setEditingFulfillment: (id: string | null) => void;
  fulfillmentNotes: Record<string, string>;
  setFulfillmentNotes: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  processingIds: Set<string>;
  onMarkFulfilled: (fulfillmentId: string, quantityApproved: number) => void;
  onPartialFulfillment: (
    fulfillmentId: string,
    quantityFulfilled: number,
    quantityReturned: number
  ) => void;
  products?: any[];
  onRefresh?: () => void;
}

export default function BarApprovalsPendingOrders({
  groupedArray,
  isLoading,
  editingFulfillment,
  setEditingFulfillment,
  fulfillmentNotes,
  setFulfillmentNotes,
  processingIds,
  onMarkFulfilled,
  onPartialFulfillment,
  products = [],
  onRefresh,
}: PendingOrdersTabProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 Setup realtime listener for modifications from database
  useEffect(() => {
    console.log("🎧 Setting up bar_fulfillments realtime listener...");

    const channel = supabase
      .channel("bar_fulfillment_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bar_fulfillments",
        },
        (payload) => {
          console.log("🔄 Fulfillment updated (DB event):", payload.new);

          // Refresh the data when database updates occur
          if (onRefresh) {
            onRefresh();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bar_fulfillments",
        },
        (payload) => {
          console.log("🗑️ Fulfillment deleted (DB event):", payload.old);

          // Refresh the data when items are deleted
          if (onRefresh) {
            onRefresh();
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
      });

    return () => {
      console.log("🧹 Cleaning up bar_fulfillments listener");
      supabase.removeChannel(channel);
    };
  }, [onRefresh]);

  const startEditingItem = (item: any) => {
    console.log("✏️ Starting edit for item:", item.product_name);
    setEditingItemId(item.id);
    setEditedItem({
      ...item,
      original_product_id: item.product_id, // Store original for comparison
      original_quantity: item.quantity_approved, // Store original quantity
    });
  };

  const cancelEditingItem = () => {
    console.log("❌ Cancelling edit");
    setEditingItemId(null);
    setEditedItem(null);
  };

  const updateItemQuantity = (newQuantity: number) => {
    if (editedItem) {
      const clampedQuantity = Math.max(0, newQuantity);
      console.log(
        `🔢 Updating quantity: ${editedItem.quantity_approved} → ${clampedQuantity}`
      );
      setEditedItem({
        ...editedItem,
        quantity_approved: clampedQuantity,
      });
    }
  };

  const exchangeProduct = (newProductId: string) => {
    const newProduct = products.find((p) => p.id === newProductId);
    if (newProduct && editedItem) {
      console.log(
        `🔄 Exchanging product: ${editedItem.product_name} → ${newProduct.name}`
      );
      setEditedItem({
        ...editedItem,
        product_id: newProduct.id,
        product_name: newProduct.name,
        unit_price: newProduct.selling_price,
      });
    }
  };

  const saveItemModification = async (group: any) => {
    if (!editedItem) return;

    setIsSaving(true);

    try {
      let modificationType: "exchange" | "quantity_change" | "remove" =
        "quantity_change";

      // 🔍 Detect modification type
      if (editedItem.quantity_approved === 0) {
        modificationType = "remove";
        console.log("🗑️ Modification type: REMOVE");
      } else if (editedItem.product_id !== editedItem.original_product_id) {
        modificationType = "exchange";
        console.log("🔄 Modification type: EXCHANGE");
      } else if (
        editedItem.quantity_approved !== editedItem.original_quantity
      ) {
        modificationType = "quantity_change";
        console.log("🔢 Modification type: QUANTITY CHANGE");
      } else {
        console.log("⚠️ No changes detected");
        cancelEditingItem();
        setIsSaving(false);
        return;
      }

      // 🧾 Build modification payload
      const modification = {
        tableId: editedItem.table_id,
        salesRepId: group.sales_rep_id,
        salesRepName: group.sales_rep_name,
        fulfillmentId: editedItem.id,
        modificationType,
        originalProductId:
          editedItem.original_product_id || editedItem.product_id,
        originalProductName:
          editedItem.original_product_name || editedItem.product_name,
        originalQuantity:
          editedItem.original_quantity || editedItem.quantity_approved,
        newProductId: editedItem.product_id,
        newProductName: editedItem.product_name,
        newQuantity: editedItem.quantity_approved,
        unitPrice: editedItem.unit_price,
      };

      console.log("📤 Sending modification:", modification);

      // 🚀 Send modification to backend
      const result = await modifyBarFulfillment(modification);

      if (!result.success) {
        throw new Error(result.error);
      }

      // ✅ Handle bar approval logic
      if (result.requiresApproval) {
        toast.success(
          `Modification requested: ${
            result.data?.changesSummary || "Awaiting bar approval"
          }`,
          { duration: 5000, icon: "⏳" }
        );
      } else {
        toast.success(
          `Item modified: ${
            result.data?.changesSummary || "Successfully updated"
          }`
        );
      }

      cancelEditingItem();

      // 🔄 Refresh local data
      if (onRefresh) {
        console.log("🔄 Refreshing data...");
        onRefresh();
      }
    } catch (error: any) {
      console.error("❌ Error saving modification:", error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (groupedArray.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
        <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
          All caught up!
        </p>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
          No pending orders to fulfill
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {groupedArray.map((group: any, idx: number) => (
        <div
          key={`${group.sales_rep_id}-${idx}`}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-300 dark:border-yellow-700"
        >
          {/* Group Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                  Tables {group.tables?.join(", ") || "N/A"}
                </span>
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                {group.sales_rep_name}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {group.items.map((item: any) => {
              const isEditingThisItem = editingItemId === item.id;
              const displayItem = isEditingThisItem ? editedItem : item;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 sm:p-4 border ${
                    isEditingThisItem
                      ? "border-orange-400 dark:border-orange-600 border-2"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isEditingThisItem ? (
                    // ✅ EDIT MODE
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          EDITING MODE
                        </span>
                        <span className="text-xs text-slate-500">
                          Table {item.table_id}
                        </span>
                      </div>

                      {/* Product Exchange Dropdown */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Product
                        </label>
                        <select
                          value={displayItem.product_id}
                          onChange={(e) => exchangeProduct(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                        >
                          <option value={displayItem.product_id}>
                            {displayItem.product_name} - ₦
                            {displayItem.unit_price?.toLocaleString()}
                          </option>
                          <optgroup label="Exchange with:">
                            {products
                              .filter((p) => p.id !== displayItem.product_id)
                              .map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - ₦
                                  {product.selling_price?.toLocaleString()}
                                </option>
                              ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Quantity Controls */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Quantity
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                displayItem.quantity_approved - 1
                              )
                            }
                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            disabled={displayItem.quantity_approved <= 0}
                          >
                            <Minus className="w-4 h-4 text-red-600" />
                          </button>
                          <input
                            type="number"
                            value={displayItem.quantity_approved}
                            onChange={(e) =>
                              updateItemQuantity(parseInt(e.target.value) || 0)
                            }
                            className="flex-1 px-3 py-2 text-center text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                            min="0"
                          />
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                displayItem.quantity_approved + 1
                              )
                            }
                            className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => updateItemQuantity(0)}
                            className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors ml-2"
                            title="Remove item (set to 0)"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          Total
                        </span>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">
                          ₦
                          {(
                            displayItem.quantity_approved *
                            displayItem.unit_price
                          ).toLocaleString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={cancelEditingItem}
                          disabled={isSaving}
                          className="flex-1 py-2 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={() => saveItemModification(group)}
                          disabled={isSaving}
                          className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ✅ VIEW MODE
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 gap-2">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                                {item.product_name}
                              </h3>
                              <p className="text-xs text-slate-500">
                                Table {item.table_id}
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Quantity:{" "}
                                <span className="font-bold">
                                  {item.quantity_approved}
                                </span>
                              </p>
                              {item.modification_count > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-xs text-purple-700 dark:text-purple-300">
                                  Modified {item.modification_count}x
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => startEditingItem(item)}
                              className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors flex-shrink-0"
                              title="Edit this item"
                            >
                              <Edit2 className="w-4 h-4 text-orange-600" />
                            </button>
                          </div>
                        </div>
                        <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex-shrink-0">
                          ₦
                          {(
                            item.quantity_approved * item.unit_price
                          ).toLocaleString()}
                        </span>
                      </div>

                      {editingFulfillment === item.id ? (
                        <PartialFulfillmentForm
                          fulfillmentId={item.id}
                          quantityApproved={item.quantity_approved}
                          onSubmit={(fulfilled: number, returned: number) =>
                            onPartialFulfillment(item.id, fulfilled, returned)
                          }
                          onCancel={() => setEditingFulfillment(null)}
                          isProcessing={processingIds.has(item.id)}
                        />
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Add notes (optional)..."
                            value={fulfillmentNotes[item.id] || ""}
                            onChange={(e) =>
                              setFulfillmentNotes((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            rows={2}
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() =>
                                onMarkFulfilled(item.id, item.quantity_approved)
                              }
                              disabled={processingIds.has(item.id)}
                              className="flex-1 py-2 px-3 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
                            >
                              {processingIds.has(item.id) ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span className="hidden sm:inline">
                                    Processing...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Mark Fulfilled</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingFulfillment(item.id)}
                              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
                            >
                              Partial/Return
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
