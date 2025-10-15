"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Filter, Search, TrendingUp, User } from "lucide-react";

interface RequestFiltersProps {
  filters: {
    salesRep: string;
    dateRange: string;
    searchTerm: string;
    status: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      salesRep: string;
      dateRange: string;
      searchTerm: string;
      status: string;
    }>
  >;
  uniqueSalesReps: string[];
  sortBy: "time" | "salesRep" | "total";
  sortOrder: "asc" | "desc";
  setSortBy: React.Dispatch<
    React.SetStateAction<"time" | "salesRep" | "total">
  >;
  setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  hasActiveFilters: string;
  clearFilters: () => void;
}

export function RequestFilters({
  filters,
  setFilters,
  uniqueSalesReps,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  hasActiveFilters,
  clearFilters,
}: RequestFiltersProps) {
  return (
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
                const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                  "time" | "salesRep" | "total",
                  "asc" | "desc"
                ];
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
  );
}
