"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  Clock,
  DollarSign,
  Loader2,
  Package,
  User,
} from "lucide-react";
import { BarRequest } from "../(sales)/types";

interface RequestsListProps {
  isLoading: boolean;
  sortedRequests: BarRequest[];
  hasActiveFilters: string;
  clearFilters: () => void;
  sortBy: "time" | "salesRep" | "total";
  sortOrder: "asc" | "desc";
  handleSort: (newSortBy: "time" | "salesRep" | "total") => void;
}

export function RequestsList({
  isLoading,
  sortedRequests,
  hasActiveFilters,
  clearFilters,
  sortBy,
  sortOrder,
  handleSort,
}: RequestsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Loading requests...
        </p>
      </div>
    );
  }

  if (sortedRequests.length === 0) {
    return (
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
    );
  }

  return (
    <>
      {/* Desktop Table View */}
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
                            ? new Date(req.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString()
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

      {/* Mobile Card View */}
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
                    {req.quantity || "?"}
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
  );
}
