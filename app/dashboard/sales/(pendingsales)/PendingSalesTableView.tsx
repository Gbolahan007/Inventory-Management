"use client";

import { User, CreditCard, CheckCircle } from "lucide-react";
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

interface SalesTableViewProps {
  sales: Sale[];
  paymentInputs: Record<string, string>;
  onPaymentInputChange: (saleId: string, value: string) => void;
  onPartialPayment: (saleId: string, totalAmount: number) => void;
  onMarkAsPaid: (saleId: string) => void;
  isAddingPayment: boolean;
  isMarkingPaid: boolean;
}

export function PendingSalesTableView({
  sales,
  paymentInputs,
  onPaymentInputChange,
  onPartialPayment,
  onMarkAsPaid,
  isAddingPayment,
  isMarkingPaid,
}: SalesTableViewProps) {
  const getRemainingBalance = (sale: Sale) => {
    const amountPaid = sale.amount_paid || 0;
    return sale.total_amount - amountPaid;
  };

  return (
    <Card className="border-0 shadow-lg hidden lg:block">
      <CardContent className="p-0">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 text-left font-semibold">Customer</th>
              <th className="p-4 text-left font-semibold">Sales Rep</th>
              <th className="p-4 text-left font-semibold">Table</th>
              <th className="p-4 text-left font-semibold">Payment Status</th>
              <th className="p-4 text-left font-semibold">Date</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, idx) => {
              const remainingBalance = getRemainingBalance(sale);
              const amountPaid = sale.amount_paid || 0;

              return (
                <tr
                  key={sale.id}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-slate-50/50 dark:bg-slate-900/30"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      {sale.pending_customer_name || "Unknown"}
                    </div>
                  </td>
                  <td className="p-4 capitalize">
                    {sale.sales_rep_name || "N/A"}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md text-sm">
                      Table {sale.table_id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Total:{" "}
                        </span>
                        <span className="font-semibold">
                          ₦{sale.total_amount.toLocaleString()}
                        </span>
                      </div>
                      {amountPaid > 0 && (
                        <div className="text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Paid:{" "}
                          </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₦{amountPaid.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Balance:{" "}
                        </span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          ₦{remainingBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={`Max: ₦${remainingBalance.toLocaleString()}`}
                          value={paymentInputs[sale.id] || ""}
                          onChange={(e) =>
                            onPaymentInputChange(sale.id, e.target.value)
                          }
                          className="w-24 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500
                            bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600
                            text-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={() =>
                            onPartialPayment(sale.id, sale.total_amount)
                          }
                          disabled={isAddingPayment || !paymentInputs[sale.id]}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          {isAddingPayment ? "..." : "Add"}
                        </button>
                      </div>
                      <button
                        onClick={() => onMarkAsPaid(sale.id)}
                        disabled={isMarkingPaid}
                        className="w-full px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {isMarkingPaid ? "Updating..." : "Mark Paid"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
