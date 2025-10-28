"use client";

import { User, CreditCard, CheckCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Sale {
  id: string;
  pending_customer_name: string;
  sales_rep_name: string;
  table_id: number;
  total_amount: number;
  amount_paid: number;
  sale_date: string;
}

interface SalesMobileCardProps {
  sale: Sale;
  isExpanded: boolean;
  paymentInput: string;
  onToggleExpand: () => void;
  onPaymentInputChange: (value: string) => void;
  onPartialPayment: () => void;
  onMarkAsPaid: () => void;
  onViewProducts: () => void;
  isAddingPayment: boolean;
  isMarkingPaid: boolean;
}

export function PendingSalesMobileCard({
  sale,
  isExpanded,
  paymentInput,
  onToggleExpand,
  onPaymentInputChange,
  onViewProducts,
  isAddingPayment,
  isMarkingPaid,
}: SalesMobileCardProps) {
  const getRemainingBalance = () => {
    const amountPaid = sale.amount_paid || 0;
    return sale.total_amount - amountPaid;
  };

  const remainingBalance = getRemainingBalance();
  const amountPaid = sale.amount_paid || 0;

  return (
    <Card className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {sale.pending_customer_name || "Unknown"}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
              Rep: {sale.sales_rep_name || "N/A"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md text-xs">
                Table {sale.table_id}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {new Date(sale.sale_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onToggleExpand}
            className="text-blue-600 dark:text-blue-400 text-sm underline"
          >
            {isExpanded ? "Less" : "Payment"}
          </button>
        </div>

        {/* Payment Summary */}
        <div className="space-y-1 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              Total Amount:
            </span>
            <span className="font-semibold">
              ₦{sale.total_amount.toLocaleString()}
            </span>
          </div>
          {amountPaid > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Amount Paid:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                ₦{amountPaid.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span className="text-slate-600 dark:text-slate-400">Balance:</span>
            <span className="text-red-600 dark:text-red-400">
              ₦{remainingBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Actions */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onViewProducts}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-700 text-sm flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              View Products
            </button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Partial Payment</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={`Max: ₦${remainingBalance.toLocaleString()}`}
                  value={paymentInput}
                  onChange={(e) => onPaymentInputChange(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500
                    bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100"
                />
                <button
                  disabled={isAddingPayment || !paymentInput}
                  className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <CreditCard className="w-4 h-4" />
                  {isAddingPayment ? "..." : "Add"}
                </button>
              </div>
            </div>

            <button
              disabled={isMarkingPaid}
              className="w-full px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isMarkingPaid ? "Updating..." : "Mark as Fully Paid"}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
