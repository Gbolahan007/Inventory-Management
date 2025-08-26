"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Filter, Calendar, User, RefreshCw } from "lucide-react";
import type { BarRequest } from "../(sales)/types";
import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import BarStatsCards from "./BarStatsCards";

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
  });

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

  // Apply filters
  const filteredRequests = barRequests.filter((req: BarRequest) => {
    const matchesSalesRep = filters.salesRep
      ? req.sales_rep_name === filters.salesRep
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

    return matchesSalesRep && matchesDate;
  });

  const clearFilters = () => {
    setFilters({ salesRep: "", dateRange: "" });
  };

  const hasActiveFilters = filters.salesRep || filters.dateRange;

  // Manual refetch function
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
      // You could add a toast notification here
    }
  };

  // Bulk clear functions (you'll need to implement the actual API calls)
  const clearOldRequests = async (type: "yesterday" | "week") => {
    // TODO: Implement API call to clear old requests
    console.log(`Clearing ${type} requests...`);
    // Example: await clearBarRequests(type);
    // After clearing, refetch the data
    await handleRefresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-[#5492e1] bg-clip-text text-transparent">
              Bar Requests Log
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and manage all bar service requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {filteredRequests.length} of {barRequests.length} requests
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => clearOldRequests("yesterday")}
                className="px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-md transition-colors"
              >
                Clear Yesterday
              </button>
              <button
                onClick={() => clearOldRequests("week")}
                className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-md transition-colors"
              >
                Clear Week+
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator for Background Fetch */}
        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Updating data...</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <BarStatsCards barRequests={filteredRequests} />

        {/* Filters Section */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sales Rep Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="sales-rep-filter"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <User className="w-4 h-4" />
                  Sales Representative
                </label>
                <select
                  id="sales-rep-filter"
                  value={filters.salesRep}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      salesRep: e.target.value === "all" ? "" : e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-4 py-2.5 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option value="all">All Sales Reps</option>
                  {uniqueSalesReps.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="date-range-filter"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <Calendar className="w-4 h-4" />
                  Time Period
                </label>
                <select
                  id="date-range-filter"
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: e.target.value === "all" ? "" : e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-4 py-2.5 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>{filteredRequests.length}</strong> requests match your
                  filters
                  {filters.salesRep && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      Rep: {filters.salesRep}
                    </span>
                  )}
                  {filters.dateRange && (
                    <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                      {filters.dateRange === "today"
                        ? "Today"
                        : filters.dateRange === "yesterday"
                        ? "Yesterday"
                        : "Last 7 Days"}
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No requests found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more results."
                  : "There are no bar requests to display at the moment."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRequests.map((req: BarRequest) => (
              <Card
                key={req.id}
                className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {req.table_id || "?"}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Table {req.table_id || "N/A"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>

                    {/* Product */}
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {req.product_name}
                      </h4>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Quantity
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-sm">
                          {req.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Sales Rep
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                          {req.sales_rep_name}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
