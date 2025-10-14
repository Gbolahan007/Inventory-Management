import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface SalesRepSummaryProps {
  salesRepSummary: Record<
    string,
    {
      totalAmount: number; // total sales
      totalExpenses: number; // expenses
      totalItems: number;
      orderCount: number;
    }
  >;
}

export function SalesRepSummary({ salesRepSummary }: SalesRepSummaryProps) {
  if (!salesRepSummary || Object.keys(salesRepSummary).length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(salesRepSummary).map(([rep, summary]) => {
        const expectedAmount = summary.totalAmount + summary.totalExpenses;

        return (
          <Card
            key={rep}
            className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                  {rep}
                </h3>
                <User className="w-5 h-5 text-blue-500" />
              </div>

              {/* Amounts */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Total Sales:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ₦{summary.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Expenses:
                  </span>
                  <span className="font-bold text-red-500 dark:text-red-400">
                    ₦{summary.totalExpenses.toLocaleString()}
                  </span>
                </div>

                {/* ✅ NEW Expected Amount row */}
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-semibold">
                    Expected Amount:
                  </span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    ₦{expectedAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Orders:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {summary.orderCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
