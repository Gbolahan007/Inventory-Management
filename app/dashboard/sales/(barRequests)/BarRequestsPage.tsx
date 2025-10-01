"use client";

import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { BarRequest } from "../(sales)/types";
import { SalesRepSummary } from "./SalesRepSummary";
import { RequestFilters } from "./RequestFilters";
import { RequestsList } from "./RequestList";

export default function BarRequestsPage() {
  const {
    barRequests = [],
    isLoading,
    refetch,
    isFetching,
  } = useBarRequestsQuery();

  const [filters, setFilters] = useState({
    salesRep: "",
    dateRange: "",
    searchTerm: "",
  });
  const [sortBy, setSortBy] = useState<"time" | "salesRep" | "total">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const uniqueSalesReps = Array.from(
    new Set(
      barRequests.map((req: BarRequest) => req.sales_rep_name).filter(Boolean)
    )
  ).sort();

  // Date filter logic
  const getDateRange = (range: string) => {
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
        return null;
    }
  };

  // Apply filters and search
  const filteredRequests = barRequests.filter((req: BarRequest) => {
    const matchesSalesRep = filters.salesRep
      ? req.sales_rep_name === filters.salesRep
      : true;

    const matchesSearch = filters.searchTerm
      ? req.product_name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        req.sales_rep_name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        req.table_id?.toString().includes(filters.searchTerm)
      : true;

    let matchesDate = true;
    if (filters.dateRange) {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange) {
        const reqDate = req.created_at?.split("T")[0];
        if (reqDate) {
          matchesDate = reqDate >= dateRange.start && reqDate <= dateRange.end;
        }
      }
    }

    return matchesSalesRep && matchesDate && matchesSearch;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "time":
        comparison =
          new Date(a.created_at || "").getTime() -
          new Date(b.created_at || "").getTime();
        break;
      case "salesRep":
        comparison = (a.sales_rep_name || "").localeCompare(
          b.sales_rep_name || ""
        );
        break;
      case "total":
        const aTotal = (a.quantity || 0) * (a.product_price || 0);
        const bTotal = (b.quantity || 0) * (b.product_price || 0);
        comparison = aTotal - bTotal;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate sales rep summaries
  const salesRepSummary = filteredRequests.reduce((acc, req) => {
    const rep = req.sales_rep_name || "Unknown";
    const total = (req.quantity || 0) * (req.product_price || 0);

    if (!acc[rep]) {
      acc[rep] = {
        totalAmount: 0,
        totalItems: 0,
        orderCount: 0,
      };
    }

    acc[rep].totalAmount += total;
    acc[rep].totalItems += req.quantity || 0;
    acc[rep].orderCount += 1;

    return acc;
  }, {} as Record<string, { totalAmount: number; totalItems: number; orderCount: number }>);

  const clearFilters = () => {
    setFilters({ salesRep: "", dateRange: "", searchTerm: "" });
  };

  const hasActiveFilters =
    filters.salesRep || filters.dateRange || filters.searchTerm;

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const clearOldRequests = async (type: "yesterday" | "week") => {
    console.log(`Clearing ${type} requests...`);
    await handleRefresh();
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-[#5492e1] bg-clip-text text-transparent">
              Bar Service Log
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm lg:text-base">
              Track sales performance and manage requests
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="text-sm text-slate-500 dark:text-slate-400 order-last sm:order-first">
              {filteredRequests.length} of {barRequests.length} requests
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isFetching ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => clearOldRequests("yesterday")}
                  className="px-2 py-2 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Clear Yesterday</span>
                  <span className="sm:hidden">Y</span>
                </button>
                <button
                  onClick={() => clearOldRequests("week")}
                  className="px-2 py-2 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Clear Week+</span>
                  <span className="sm:hidden">W+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Updating data...</span>
            </div>
          </div>
        )}

        <SalesRepSummary salesRepSummary={salesRepSummary} />

        <RequestFilters
          filters={filters}
          setFilters={setFilters}
          uniqueSalesReps={uniqueSalesReps}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        <RequestsList
          isLoading={isLoading}
          sortedRequests={sortedRequests}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
        />
      </div>
    </div>
  );
}
