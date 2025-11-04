/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useMemo } from "react";
import {
  Loader2,
  RefreshCw,
  Wine,
  UtensilsCrossed,
  Cigarette,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useAllRoomExpenses } from "@/app/components/queryhooks/useAllRoomExpenses";

function RoomDrinkSales() {
  const { allExpenses, isLoading, refetch, isFetching } = useAllRoomExpenses();

  const [filters, setFilters] = useState({
    expenseType: "all",
    dateRange: "today",
    searchTerm: "",
  });
  const [sortBy, setSortBy] = useState<"time" | "type" | "amount">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const filteredExpenses = (allExpenses || []).filter((expense: any) => {
    const matchesType =
      filters.expenseType === "all" ||
      expense.expense_type === filters.expenseType;

    const matchesSearch = filters.searchTerm
      ? expense.expense_type
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        expense.booking_id?.toString().includes(filters.searchTerm)
      : true;

    let matchesDate = true;
    if (filters.dateRange) {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange) {
        const expenseDate = expense.created_at?.split("T")[0];
        if (expenseDate) {
          matchesDate =
            expenseDate >= dateRange.start && expenseDate <= dateRange.end;
        }
      }
    }

    return matchesType && matchesDate && matchesSearch;
  });

  // Group expenses by type (filtered by date, search, and type)
  const expensesByType = useMemo(() => {
    if (!filteredExpenses || filteredExpenses.length === 0) return {};

    return filteredExpenses.reduce((acc: any, expense: any) => {
      const type = expense.expense_type || "Other";
      if (!acc[type]) {
        acc[type] = {
          items: [],
          total: 0,
          count: 0,
        };
      }
      acc[type].items.push(expense);
      acc[type].total += expense.amount || 0;
      acc[type].count += 1;
      return acc;
    }, {});
  }, [filteredExpenses]);

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "time":
        comparison =
          new Date(a.created_at || "").getTime() -
          new Date(b.created_at || "").getTime();
        break;
      case "type":
        comparison = (a.expense_type || "").localeCompare(b.expense_type || "");
        break;
      case "amount":
        comparison = (a.amount || 0) - (b.amount || 0);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum: number, expense: any) => sum + (expense.amount || 0),
    0
  );

  const expenseTypes = ["all", ...Object.keys(expensesByType).sort()];

  const getExpenseIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "kitchen":
        return <UtensilsCrossed className="w-5 h-5" />;
      case "drinks":
        return <Wine className="w-5 h-5" />;
      case "cigar":
        return <Cigarette className="w-5 h-5" />;
      case "asun":
        return <UtensilsCrossed className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getExpenseColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "kitchen":
        return {
          bg: "bg-orange-50 dark:bg-orange-900/30",
          text: "text-orange-600 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800",
        };
      case "drinks":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "cigar":
        return {
          bg: "bg-purple-50 dark:bg-purple-900/30",
          text: "text-purple-600 dark:text-purple-400",
          border: "border-purple-200 dark:border-purple-800",
        };
      case "asun":
        return {
          bg: "bg-red-50 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-900/30",
          text: "text-slate-600 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-800",
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setFilters({ expenseType: "all", dateRange: "today", searchTerm: "" });
  };

  const hasActiveFilters =
    filters.expenseType !== "all" || filters.dateRange || filters.searchTerm;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading expenses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Updating data...</span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(expensesByType).map(([type, data]: [string, any]) => {
            const colors = getExpenseColor(type);
            return (
              <div
                key={type}
                className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <span className={colors.text}>{getExpenseIcon(type)}</span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
                  >
                    {data.count} items
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                  {type}
                </h3>
                <p className={`text-2xl font-bold ${colors.text}`}>
                  {formatCurrency(data.total)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Total Summary */}
        <div className="bg-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-blue-100 text-sm mt-1">
                {filteredExpenses.length} transactions
              </p>
            </div>
            <DollarSign className="w-16 h-16 opacity-20" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expense Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Expense Type
              </label>
              <select
                value={filters.expenseType}
                onChange={(e) =>
                  setFilters({ ...filters, expenseType: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {expenseTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="">All Time</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Type or Booking ID..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Expense Details
            </h2>
          </div>

          {/* Sort Controls */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
            <button
              onClick={() => handleSort("time")}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                sortBy === "time"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Time {sortBy === "time" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("type")}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                sortBy === "type"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Type {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("amount")}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                sortBy === "amount"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense: any) => {
                const colors = getExpenseColor(expense.expense_type);
                return (
                  <div
                    key={expense.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${colors.bg}`}>
                          <span className={colors.text}>
                            {getExpenseIcon(expense.expense_type)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                              {expense.expense_type}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                              Booking #{expense.booking_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(expense.created_at)}
                            </span>
                            <span>•</span>
                            <span>{formatTime(expense.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
                  No expenses found
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Clear filters to see all expenses
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDrinkSales;
