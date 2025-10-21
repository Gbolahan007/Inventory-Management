/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface PartialFulfillmentFormProps {
  fulfillmentId: string;
  quantityApproved: number;
  onSubmit: (fulfilled: number, returned: number) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function PartialFulfillmentForm({
  quantityApproved,
  onSubmit,
  onCancel,
  isProcessing,
}: PartialFulfillmentFormProps) {
  const [fulfilled, setFulfilled] = useState(quantityApproved);
  const [returned, setReturned] = useState(0);

  const handleSubmit = () => {
    if (fulfilled + returned !== quantityApproved) {
      toast.error("Fulfilled + Returned must equal approved quantity");
      return;
    }
    onSubmit(fulfilled, returned);
  };

  return (
    <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-slate-800 dark:text-white">
          Partial Fulfillment
        </h3>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fulfilled
          </label>
          <input
            type="number"
            value={fulfilled}
            onChange={(e) => setFulfilled(Number(e.target.value))}
            max={quantityApproved}
            min={0}
            className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Returned
          </label>
          <input
            type="number"
            value={returned}
            onChange={(e) => setReturned(Number(e.target.value))}
            max={quantityApproved}
            min={0}
            className="w-full px-2 sm:px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400">
        Approved: {quantityApproved} | Total: {fulfilled + returned}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="flex-1 py-2 px-3 sm:px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
        >
          {isProcessing ? "Processing..." : "Confirm"}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm sm:text-base min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
