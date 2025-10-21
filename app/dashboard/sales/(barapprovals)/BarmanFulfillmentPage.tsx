/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  updateFulfillmentStatus,
  processBarModification,
} from "@/app/_lib/actions";
import toast from "react-hot-toast";
import { useBarFulfillments } from "@/app/components/queryhooks/useBarFulfillments";
import { useBarModificationsQuery } from "@/app/components/queryhooks/useBarModifications";
import BarApprovalsPendingOrders from "./BarApprovalsPendingOrders";
import ModificationsTab from "./ModificationsTab";
import HistoryTab from "./BarApprovalHistoryTab";

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
          <BarApprovalsPendingOrders
            groupedArray={groupedArray}
            isLoading={isLoading}
            editingFulfillment={editingFulfillment}
            setEditingFulfillment={setEditingFulfillment}
            fulfillmentNotes={fulfillmentNotes}
            setFulfillmentNotes={setFulfillmentNotes}
            processingIds={processingIds}
            onMarkFulfilled={handleMarkFulfilled}
            onPartialFulfillment={handlePartialFulfillment}
          />
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
