/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  updateFulfillmentStatus,
  processBarModification,
} from "@/app/_lib/actions";
import toast from "react-hot-toast";
import { useBarFulfillments } from "@/app/components/queryhooks/useBarFulfillments";
import { useBarModificationsQuery } from "@/app/components/queryhooks/useBarModifications";

export default function BarmanFulfillmentPage() {
  const [selectedTab, setSelectedTab] = useState<
    "pending" | "history" | "modifications"
  >("pending");
  const [dateFilter, setDateFilter] = useState("today");

  const { fulfillments, isLoading, refetch, isFetching } = useBarFulfillments({
    status: selectedTab === "pending" ? "pending" : undefined,
    dateRange: getDateRange(dateFilter),
  });
  const {
    modifications,
    isLoading: modsLoading,
    refetch: refetchMods,
  } = useBarModificationsQuery({
    status: "pending",
  });

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [editingFulfillment, setEditingFulfillment] = useState<string | null>(
    null
  );
  const [fulfillmentNotes, setFulfillmentNotes] = useState<
    Record<string, string>
  >({});

  // Group fulfillments by table and sales rep
  const groupedFulfillments = fulfillments.reduce((acc: any, item) => {
    const key = `${item.table_id}-${item.sales_rep_id}`;
    if (!acc[key]) {
      acc[key] = {
        table_id: item.table_id,
        sales_rep_name: item.sales_rep_name,
        sales_rep_id: item.sales_rep_id,
        approved_at: item.approved_at,
        items: [],
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedFulfillments);

  const handleMarkFulfilled = async (
    fulfillmentId: string,
    quantityApproved: number
  ) => {
    setProcessingIds((prev) => new Set([...prev, fulfillmentId]));

    try {
      const result = await updateFulfillmentStatus(fulfillmentId, {
        quantity_fulfilled: quantityApproved,
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
        notes: fulfillmentNotes[fulfillmentId] || undefined,
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Item marked as fulfilled!");
      await refetch();
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to update: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fulfillmentId);
        return newSet;
      });
    }
  };

  const handlePartialFulfillment = async (
    fulfillmentId: string,
    quantityFulfilled: number,
    quantityReturned: number
  ) => {
    setProcessingIds((prev) => new Set([...prev, fulfillmentId]));

    try {
      const result = await updateFulfillmentStatus(fulfillmentId, {
        quantity_fulfilled: quantityFulfilled,
        quantity_returned: quantityReturned,
        status: quantityFulfilled > 0 ? "partial" : "returned",
        fulfilled_at: new Date().toISOString(),
        notes: fulfillmentNotes[fulfillmentId] || undefined,
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Fulfillment updated!");
      await refetch();
    } catch (error: any) {
      toast.error(`Failed to update: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fulfillmentId);
        return newSet;
      });
      setEditingFulfillment(null);
    }
  };

  const handleProcessModification = async (
    modificationId: string,
    action: "approve" | "reject",
    barmanName: string
  ) => {
    setProcessingIds((prev) => new Set([...prev, modificationId]));

    try {
      const result = await processBarModification(
        modificationId,
        action,
        barmanName
      );

      if (!result.success) throw new Error(result.error);

      toast.success(`Modification ${action}d successfully!`);
      await refetchMods();
      await refetch();
    } catch (error: any) {
      toast.error(`Failed to process: ${error.message}`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(modificationId);
        return newSet;
      });
    }
  };

  const pendingModsCount = modifications
    ? modifications.filter((m) => m.status === "pending").length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="sticky top-0 z-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                Bar Fulfillment Dashboard
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Track and manage drink preparations
              </p>
            </div>
            <button
              onClick={() => {
                refetch();
                refetchMods();
              }}
              disabled={isFetching}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-white transition-colors text-sm sm:text-base ${
                isFetching
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-[80px] sm:top-[120px] z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            <button
              onClick={() => setSelectedTab("pending")}
              className={`flex-shrink-0 py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                selectedTab === "pending"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setSelectedTab("modifications")}
              className={`flex-shrink-0 py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base whitespace-nowrap relative ${
                selectedTab === "modifications"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              Modifications
              {pendingModsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingModsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab("history")}
              className={`flex-shrink-0 py-2 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                selectedTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Pending Orders Tab */}
        {selectedTab === "pending" && (
          <div className="space-y-3 sm:space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : groupedArray.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
                <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
                  No pending orders to fulfill
                </p>
              </div>
            ) : (
              groupedArray.map((group: any, idx: number) => (
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
                              handlePartialFulfillment(
                                item.id,
                                fulfilled,
                                returned
                              )
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
                                  handleMarkFulfilled(
                                    item.id,
                                    item.quantity_approved
                                  )
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
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modifications Tab */}
        {selectedTab === "modifications" && (
          <ModificationsTab
            modifications={modifications}
            isLoading={modsLoading}
            onProcess={handleProcessModification}
            processingIds={processingIds}
          />
        )}

        {/* History Tab */}
        {selectedTab === "history" && (
          <HistoryTab
            fulfillments={fulfillments}
            isLoading={isLoading}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        )}
      </div>
    </div>
  );
}

// Partial Fulfillment Form Component
function PartialFulfillmentForm({
  quantityApproved,
  onSubmit,
  onCancel,
  isProcessing,
}: any) {
  const [fulfilled, setFulfilled] = useState(quantityApproved);
  const [returned, setReturned] = useState(0);

  const handleSubmit = () => {
    if (fulfilled + returned !== quantityApproved) {
      toast.error("Fulfilled + Returned must equal approved quantity");
      return;
    }
    onSubmit(fulfilled, returned);
  };

  return (
    <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fulfilled
          </label>
          <input
            type="number"
            value={fulfilled}
            onChange={(e) => setFulfilled(Number(e.target.value))}
            max={quantityApproved}
            min={0}
            className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Returned
          </label>
          <input
            type="number"
            value={returned}
            onChange={(e) => setReturned(Number(e.target.value))}
            max={quantityApproved}
            min={0}
            className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Approved: {quantityApproved} | Total: {fulfilled + returned}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex-1 py-2 px-3 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
        >
          {isProcessing ? "Processing..." : "Confirm"}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Modifications Tab Component
function ModificationsTab({
  modifications,
  isLoading,
  onProcess,
  processingIds,
}: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingMods = modifications.filter((m: any) => m.status === "pending");

  if (pendingMods.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
        <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
          No pending modifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {pendingMods.map((mod: any) => (
        <div
          key={mod.id}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-orange-300 dark:border-orange-700"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                  Table {mod.table_id}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-2">
                  {mod.sales_rep_name}
                </span>
              </div>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 flex-shrink-0">
              {mod.modification_type.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Modification Details */}
          <div className="space-y-3 mb-4">
            {mod.modification_type === "exchange" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                    REMOVE
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                    {mod.original_product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Qty: {mod.original_quantity}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                    ADD
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                    {mod.new_product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Qty: {mod.new_quantity}
                  </p>
                </div>
              </div>
            )}

            {mod.modification_type === "quantity_change" && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white mb-2">
                  {mod.original_product_name}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Approved:{" "}
                    <span className="font-bold">{mod.original_quantity}</span>
                  </span>
                  <span className="text-slate-400 hidden sm:inline">→</span>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Actual:{" "}
                    <span className="font-bold">{mod.new_quantity}</span>
                  </span>
                </div>
              </div>
            )}

            {mod.modification_type === "return" && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                  RETURN
                </p>
                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                  {mod.original_product_name}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Qty: {mod.original_quantity}
                </p>
              </div>
            )}

            {mod.reason && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Reason:
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {mod.reason}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onProcess(mod.id, "approve", "Barman")}
              disabled={processingIds.has(mod.id)}
              className="flex-1 py-2 px-3 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
            >
              {processingIds.has(mod.id) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </>
              )}
            </button>
            <button
              onClick={() => onProcess(mod.id, "reject", "Barman")}
              disabled={processingIds.has(mod.id)}
              className="flex-1 py-2 px-3 sm:px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// History Tab Component
function HistoryTab({
  fulfillments,
  isLoading,
  dateFilter,
  setDateFilter,
}: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const completedFulfillments = fulfillments.filter(
    (f: any) => f.status !== "pending"
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Date Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm sm:text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <SummaryCard
          title="Total Fulfilled"
          value={
            completedFulfillments.filter((f: any) => f.status === "fulfilled")
              .length
          }
          icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="green"
        />
        <SummaryCard
          title="Partial Fulfills"
          value={
            completedFulfillments.filter((f: any) => f.status === "partial")
              .length
          }
          icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="yellow"
        />
        <SummaryCard
          title="Returns"
          value={
            completedFulfillments.filter((f: any) => f.status === "returned")
              .length
          }
          icon={<XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="red"
        />
        <SummaryCard
          title="Total Items"
          value={completedFulfillments.reduce(
            (sum: number, f: any) => sum + f.quantity_fulfilled,
            0
          )}
          icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="blue"
        />
      </div>

      {/* History List */}
      <div className="space-y-2 sm:space-y-3">
        {completedFulfillments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400">
              No fulfillment history for selected period
            </p>
          </div>
        ) : (
          completedFulfillments.map((item: any) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
                      Table {item.table_id}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {item.sales_rep_name}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                      ₦{item.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white mb-1">
                    {item.product_name}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <span>Approved: {item.quantity_approved}</span>
                    <span>Fulfilled: {item.quantity_fulfilled}</span>
                    {item.quantity_returned > 0 && (
                      <span className="text-red-600">
                        Returned: {item.quantity_returned}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(
                    item.fulfilled_at || item.created_at
                  ).toLocaleString("en-NG", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon, color }: any) {
  const colorClasses = {
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    yellow:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  };

  return (
    <div
      className={`rounded-lg p-3 sm:p-4 border ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {icon}
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-80 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    fulfilled: {
      label: "Fulfilled",
      class:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    partial: {
      label: "Partial",
      class:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    returned: {
      label: "Returned",
      class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    pending: {
      label: "Pending",
      class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
    >
      {config.label}
    </span>
  );
}

// Helper function
function getDateRange(range: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  switch (range) {
    case "today":
      return {
        start: today.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      };
    case "yesterday":
      return {
        start: yesterday.toISOString().split("T")[0],
        end: yesterday.toISOString().split("T")[0],
      };
    case "week":
      return {
        start: weekAgo.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      };
    default:
      return undefined;
  }
}
