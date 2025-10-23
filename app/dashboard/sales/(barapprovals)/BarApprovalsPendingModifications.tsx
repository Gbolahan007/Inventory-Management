/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { approveModification, rejectModification } from "@/app/_lib/actions";
import toast from "react-hot-toast";

interface PendingModificationsTabProps {
  pendingModifications: any[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export default function BarApprovalsPendingModifications({
  pendingModifications,
  isLoading,
  onRefresh,
}: PendingModificationsTabProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Group by table and sales rep
  const groupedModifications = pendingModifications.reduce(
    (acc: any, item: any) => {
      const key = `${item.table_id}-${item.sales_rep_id}`;
      if (!acc[key]) {
        acc[key] = {
          table_id: item.table_id,
          sales_rep_name: item.sales_rep_name,
          sales_rep_id: item.sales_rep_id,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    },
    {}
  );

  const groupedArray = Object.values(groupedModifications);

  const handleApprove = async (fulfillmentId: string, itemName: string) => {
    setProcessingIds((prev) => new Set([...prev, fulfillmentId]));

    try {
      const result = await approveModification(fulfillmentId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(`✅ Modification approved for ${itemName}`);

      if (onRefresh) {
        setTimeout(() => onRefresh(), 500);
      }
    } catch (error: any) {
      console.error("Error approving modification:", error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fulfillmentId);
        return newSet;
      });
    }
  };

  const handleReject = async (fulfillmentId: string, itemName: string) => {
    setProcessingIds((prev) => new Set([...prev, fulfillmentId]));

    try {
      const result = await rejectModification(fulfillmentId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(`❌ Modification rejected for ${itemName}`);

      if (onRefresh) {
        setTimeout(() => onRefresh(), 500);
      }
    } catch (error: any) {
      console.error("Error rejecting modification:", error);
      toast.error(`Failed to reject: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fulfillmentId);
        return newSet;
      });
    }
  };

  const getModificationType = (item: any) => {
    if (item.pending_quantity === 0) {
      return "removal";
    }
    if (
      item.pending_product_id &&
      item.pending_product_id !== item.product_id
    ) {
      return "exchange";
    }
    if (
      item.pending_quantity !== null &&
      item.pending_quantity !== item.quantity_approved
    ) {
      return "quantity_change";
    }
    return "unknown";
  };

  const renderModificationDetails = (item: any) => {
    const modificationType = getModificationType(item);

    if (modificationType === "removal") {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
            🗑️ REQUEST TO REMOVE ITEM
          </p>
          <div className="space-y-1">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Current Item:</span>{" "}
              {item.product_name}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Current Quantity:</span>{" "}
              {item.quantity_approved}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium">Current Price:</span> ₦
              {item.unit_price?.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }

    if (modificationType === "exchange") {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            🔄 REQUEST TO EXCHANGE PRODUCT
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Current
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">Product:</span>{" "}
                {item.product_name}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">Quantity:</span>{" "}
                {item.quantity_approved}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">Price:</span> ₦
                {item.unit_price?.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                Requested Change
              </p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                <span className="font-medium">Product:</span>{" "}
                {item.pending_product_name}
              </p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                <span className="font-medium">Quantity:</span>{" "}
                {item.pending_quantity}
              </p>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                <span className="font-medium">Price:</span> ₦
                {item.pending_unit_price?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (modificationType === "quantity_change") {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
            📊 REQUEST TO CHANGE QUANTITY
          </p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Current
              </p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {item.quantity_approved}
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase mb-1">
                Requested
              </p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {item.pending_quantity}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
            <span className="font-medium">Product:</span> {item.product_name} @
            ₦{item.unit_price?.toLocaleString()}
          </p>
        </div>
      );
    }

    return null;
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
          No Pending Modifications
        </p>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
          All modification requests have been processed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {groupedArray.map((group: any, idx: number) => (
        <div
          key={`${group.sales_rep_id}-${idx}`}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-orange-300 dark:border-orange-700"
        >
          {/* Group Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <span className="text-xs sm:text-sm font-bold text-orange-700 dark:text-orange-300">
                  Table {group.table_id}
                </span>
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                {group.sales_rep_name}
              </span>
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {group.items.length} modification
                  {group.items.length !== 1 ? "s" : ""} pending
                </span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {group.items.map((item: any) => {
              const isProcessing = processingIds.has(item.id);
              const modificationType = getModificationType(item);
              const requestedAt = new Date(
                item.modification_requested_at
              ).toLocaleString("en-NG", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base text-slate-800 dark:text-white">
                        Modification Request
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Requested at {requestedAt}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded text-xs font-medium text-orange-700 dark:text-orange-300">
                      Table {item.table_id}
                    </span>
                  </div>

                  {/* Modification Details */}
                  {renderModificationDetails(item)}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <button
                      onClick={() => handleApprove(item.id, item.product_name)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve{" "}
                          {modificationType === "removal"
                            ? "Removal"
                            : "Change"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(item.id, item.product_name)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
