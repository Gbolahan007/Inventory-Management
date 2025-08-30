"use client";

import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import type { BarRequest } from "../(sales)/types";

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

  // Calculate sales rep summaries - refactored to use product_price
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

  console.log(salesRepSummary);
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

        {/* Sales Rep Summary Cards - Updated to show money expected */}
        {Object.keys(salesRepSummary).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(salesRepSummary).map(([rep, summary]) => {
              const s = summary as {
                totalAmount: number;
                totalItems: number;
                orderCount: number;
              };

              return (
                <Card
                  key={rep}
                  className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {rep}
                      </h3>
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Expected Amount:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₦{s.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Orders:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {s.orderCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Items Sold:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {s.totalItems}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filters & Search</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Search className="w-4 h-4" />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Product, rep, or table..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                />
              </div>

              {/* Sales Rep Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4" />
                  Sales Rep
                </label>
                <select
                  value={filters.salesRep}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      salesRep: e.target.value === "all" ? "" : e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option value="all">All Reps</option>
                  {uniqueSalesReps.map((rep) => (
                    <option key={rep} value={rep}>
                      {rep}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4" />
                  Period
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: e.target.value === "all" ? "" : e.target.value,
                    }))
                  }
                  className="w-full rounded-lg px-3 py-2 text-sm
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

              {/* Sort By */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <TrendingUp className="w-4 h-4" />
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split(
                      "-"
                    ) as [typeof sortBy, typeof sortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option value="time-desc">Newest First</option>
                  <option value="time-asc">Oldest First</option>
                  <option value="salesRep-asc">Rep A-Z</option>
                  <option value="salesRep-desc">Rep Z-A</option>
                  <option value="total-desc">Highest Value</option>
                  <option value="total-asc">Lowest Value</option>
                </select>
              </div>
            </div>
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
        ) : sortedRequests.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-400" />
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
          <>
            {/* Desktop Table View - Updated with Total column */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          <button
                            onClick={() => handleSort("time")}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                            Time
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                sortBy === "time" && sortOrder === "desc"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          Table
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          Product
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          Price
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          Qty
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          <button
                            onClick={() => handleSort("total")}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            Total
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                sortBy === "total" && sortOrder === "desc"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">
                          <button
                            onClick={() => handleSort("salesRep")}
                            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Sales Rep
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                sortBy === "salesRep" && sortOrder === "desc"
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRequests.map((req: BarRequest, index) => (
                        <tr
                          key={req.id}
                          className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                            index % 2 === 0
                              ? "bg-white dark:bg-slate-800"
                              : "bg-slate-50/50 dark:bg-slate-900/30"
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {req.created_at
                                  ? new Date(req.created_at).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "N/A"}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {req.created_at
                                  ? new Date(
                                      req.created_at
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-lg">
                              {req.table_id || "?"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {req.product_name || "N/A"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              ₦{(req.product_price || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-md">
                              {req.quantity || 0}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ₦
                              {(
                                (req.quantity || 0) * (req.product_price || 0)
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-900 dark:text-slate-100 font-medium">
                              {req.sales_rep_name || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Card View - Updated with Total */}
            <div className="lg:hidden space-y-3">
              {sortedRequests.map((req: BarRequest) => (
                <Card
                  key={req.id}
                  className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {req.table_id || "?"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                            {req.product_name || "N/A"}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {req.sales_rep_name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            ₦{(req.product_price || 0).toLocaleString()} ×{" "}
                            {req.quantity || 0}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                          ₦
                          {(
                            (req.quantity || 0) * (req.product_price || 0)
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Total Amount
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleString()
                          : "N/A"}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Table {req.table_id || "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
