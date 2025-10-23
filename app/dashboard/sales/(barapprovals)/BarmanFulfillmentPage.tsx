/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { updateFulfillmentStatus } from "@/app/_lib/actions";
import toast from "react-hot-toast";
import { useBarFulfillments } from "@/app/components/queryhooks/useBarFulfillments";
import { useBarModificationsQuery } from "@/app/components/queryhooks/useBarModifications";
import BarApprovalsPendingOrders from "./BarApprovalsPendingOrders";
import HistoryTab from "./BarApprovalHistoryTab";
import { useProducts } from "@/app/components/queryhooks/useProducts";
import BarApprovalsPendingModifications from "./BarApprovalsPendingModifications";

export default function BarmanFulfillmentPage() {
  const [selectedTab, setSelectedTab] = useState<
    "pending" | "history" | "modifications"
  >("pending");
  const [dateFilter, setDateFilter] = useState("today");

  const { fulfillments, isLoading, refetch, isFetching } = useBarFulfillments({
    status: selectedTab === "pending" ? "pending" : undefined,
    dateRange: getDateRange(dateFilter),
  });

  const { products, isLoading: productsLoading } = useProducts();

  // ✅ Filter to only drinks/cigarettes/cocktails categories
  const barProducts = products?.filter(
    (p) =>
      p.category === "Drinks" ||
      p.category === "Cigarettes" ||
      p.category === "Cocktails"
  );

  const {
    modifications,
    isLoading: modsLoading,
    refetch: refetchMods,
  } = useBarModificationsQuery({
    status: "pending_modification",
  });

  console.log(modifications);

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [editingFulfillment, setEditingFulfillment] = useState<string | null>(
    null
  );
  const [fulfillmentNotes, setFulfillmentNotes] = useState<
    Record<string, string>
  >({});

  // ✅ Group fulfillments by sales rep only
  const groupedFulfillments = fulfillments.reduce((acc: any, item: any) => {
    const key = item.sales_rep_id;
    if (!acc[key]) {
      acc[key] = {
        sales_rep_name: item.sales_rep_name,
        sales_rep_id: item.sales_rep_id,
        items: [],
        tables: new Set<number>(), // to track unique table IDs
      };
    }
    acc[key].items.push(item);
    acc[key].tables.add(item.table_id);
    return acc;
  }, {});

  // Convert Sets to arrays and limit to 5 reps
  const groupedArray = Object.values(groupedFulfillments)
    .map((group: any) => ({
      ...group,
      tables: Array.from(group.tables),
    }))
    .slice(0, 5);

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

  const pendingModsCount = modifications
    ? modifications.filter((m) => m.status === "pending").length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
              Bar Fulfillment Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track and manage drink preparations
            </p>
          </div>
          <button
            onClick={() => {
              refetch();
              refetchMods();
            }}
            disabled={isFetching}
            className={`flex items-center mt-2 gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
              isFetching
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[80px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {["pending", "modifications", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setSelectedTab(tab as "pending" | "modifications" | "history")
              }
              className={`flex-shrink-0 py-2 px-4 rounded-md font-medium transition-colors ${
                selectedTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab === "pending"
                ? "Pending Orders"
                : tab === "modifications"
                ? `Modifications${
                    pendingModsCount > 0 ? ` (${pendingModsCount})` : ""
                  }`
                : "History"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-6">
        {selectedTab === "pending" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {groupedArray.map((group: any) => {
                // Calculate total drinks approved for this sales rep
                const totalDrinks = group.items.reduce(
                  (sum: number, item: any) => sum + item.quantity_approved,
                  0
                );

                return (
                  <div
                    key={group.sales_rep_id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {group.sales_rep_name}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Tables Served: {group.tables.join(", ")}
                    </p>

                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      Total Drinks Approved:{" "}
                      <span className="text-green-600 dark:text-green-400">
                        {totalDrinks}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ✅ Updated Pending Orders Tab with products + refresh */}
            <BarApprovalsPendingOrders
              groupedArray={groupedArray}
              isLoading={isLoading || productsLoading}
              editingFulfillment={editingFulfillment}
              setEditingFulfillment={setEditingFulfillment}
              fulfillmentNotes={fulfillmentNotes}
              setFulfillmentNotes={setFulfillmentNotes}
              processingIds={processingIds}
              onMarkFulfilled={handleMarkFulfilled}
              onPartialFulfillment={handlePartialFulfillment}
              products={barProducts} // ✅ added
              onRefresh={refetch} // ✅ added
            />
          </>
        )}

        {selectedTab === "modifications" && (
          <BarApprovalsPendingModifications
            pendingModifications={modifications}
            isLoading={modsLoading}
            onRefresh={refetchMods}
          />
        )}

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

// Helper: Date range filter
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
