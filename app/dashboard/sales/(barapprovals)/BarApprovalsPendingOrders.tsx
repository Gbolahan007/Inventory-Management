/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CheckCircle } from "lucide-react";
import PartialFulfillmentForm from "./BarApprovalsPartialFulfillmentForm";

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
}: PendingOrdersTabProps) {
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
          key={`${group.table_id}-${group.sales_rep_id}-${idx}`}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-300 dark:border-yellow-700"
        >
          {/* Group Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                  Table {group.table_id}
                </span>
              </div>
              <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                {group.sales_rep_name}
              </span>
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {new Date(group.approved_at).toLocaleTimeString("en-NG", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {group.items.map((item: any) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-3 gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                      {item.product_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Quantity:{" "}
                      <span className="font-bold">
                        {item.quantity_approved}
                      </span>
                    </p>
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
                      <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
