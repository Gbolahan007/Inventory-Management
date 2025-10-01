"use client";

import { Search, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SalesFiltersProps {
  filters: {
    searchTerm: string;
    dateRange: string;
  };
  sortBy: "time" | "amount";
  sortOrder: "asc" | "desc";
  onFiltersChange: (filters: { searchTerm: string; dateRange: string }) => void;
  onSortChange: (sortBy: "time" | "amount", sortOrder: "asc" | "desc") => void;
}

export function PendingSalesFilters({
  filters,
  sortBy,
  sortOrder,
  onFiltersChange,
  onSortChange,
}: SalesFiltersProps) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardContent className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Search className="w-4 h-4" /> Search
            </label>
            <input
              type="text"
              placeholder="Customer name or sales rep..."
              value={filters.searchTerm}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  searchTerm: e.target.value,
                })
              }
              className="w-full rounded-lg px-3 py-2 text-sm
                bg-slate-50 dark:bg-slate-700 
                border border-slate-200 dark:border-slate-600
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4" /> Period
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: e.target.value === "all" ? "" : e.target.value,
                })
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
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <DollarSign className="w-4 h-4" /> Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                  typeof sortBy,
                  typeof sortOrder
                ];
                onSortChange(newSortBy, newSortOrder);
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
              <option value="amount-desc">Highest Balance</option>
              <option value="amount-asc">Lowest Balance</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
