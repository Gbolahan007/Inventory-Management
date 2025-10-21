/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import BarApprovalSummaryCard from "./BarApprovalSummaryCard";
import BarApprovalStatusBadge from "./BarApprovalStatusBadge";

interface HistoryTabProps {
  fulfillments: any[];
  isLoading: boolean;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}

export default function HistoryTab({
  fulfillments,
  isLoading,
  dateFilter,
  setDateFilter,
}: HistoryTabProps) {
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
        <BarApprovalSummaryCard
          title="Total Fulfilled"
          value={
            completedFulfillments.filter((f: any) => f.status === "fulfilled")
              .length
          }
          icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="green"
        />
        <BarApprovalSummaryCard
          title="Partial Fulfills"
          value={
            completedFulfillments.filter((f: any) => f.status === "partial")
              .length
          }
          icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="yellow"
        />
        <BarApprovalSummaryCard
          title="Returns"
          value={
            completedFulfillments.filter((f: any) => f.status === "returned")
              .length
          }
          icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
          color="red"
        />
        <BarApprovalSummaryCard
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
                    <BarApprovalStatusBadge status={item.status} />
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
