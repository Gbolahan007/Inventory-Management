/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ModificationsTabProps {
  modifications?: any[];
  isLoading: boolean;
  onProcess: (
    modificationId: string,
    action: "approve" | "reject",
    barmanName: string
  ) => void;
  processingIds: Set<string>;
}

export default function ModificationsTab({
  modifications,
  isLoading,
  onProcess,
  processingIds,
}: ModificationsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pendingMods = (modifications ?? []).filter(
    (m: any) => m.status === "pending"
  );

  if (pendingMods.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 sm:p-12 text-center">
        <CheckCircle className="w-12 sm:w-16 h-12 sm:h-16 text-green-500 mx-auto mb-4" />
        <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
          No pending modifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {pendingMods.map((mod: any) => (
        <div
          key={mod.id}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-orange-300 dark:border-orange-700"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                  Table {mod.table_id}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-2">
                  {mod.sales_rep_name}
                </span>
              </div>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300 flex-shrink-0">
              {mod.modification_type.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {/* Modification Details */}
          <div className="space-y-3 mb-4">
            {mod.modification_type === "exchange" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                    REMOVE
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                    {mod.original_product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Qty: {mod.original_quantity}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                    ADD
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                    {mod.new_product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Qty: {mod.new_quantity}
                  </p>
                </div>
              </div>
            )}

            {mod.modification_type === "quantity_change" && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white mb-2">
                  {mod.original_product_name}
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Approved:{" "}
                    <span className="font-bold">{mod.original_quantity}</span>
                  </span>
                  <span className="text-slate-400 hidden sm:inline">→</span>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Actual:{" "}
                    <span className="font-bold">{mod.new_quantity}</span>
                  </span>
                </div>
              </div>
            )}

            {mod.modification_type === "return" && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                  RETURN
                </p>
                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
                  {mod.original_product_name}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Qty: {mod.original_quantity}
                </p>
              </div>
            )}

            {mod.reason && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Reason:
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {mod.reason}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onProcess(mod.id, "approve", "Barman")}
              disabled={processingIds.has(mod.id)}
              className="flex-1 py-2 px-3 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
            >
              {processingIds.has(mod.id) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </>
              )}
            </button>
            <button
              onClick={() => onProcess(mod.id, "reject", "Barman")}
              disabled={processingIds.has(mod.id)}
              className="flex-1 py-2 px-3 sm:px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
