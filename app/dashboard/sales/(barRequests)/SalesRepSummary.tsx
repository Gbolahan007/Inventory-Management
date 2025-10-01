import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface SalesRepSummaryProps {
  salesRepSummary: Record<
    string,
    { totalAmount: number; totalItems: number; orderCount: number }
  >;
}

export function SalesRepSummary({ salesRepSummary }: SalesRepSummaryProps) {
  if (Object.keys(salesRepSummary).length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(salesRepSummary).map(([rep, summary]) => {
        const s = summary as {
          totalAmount: number;
          totalItems: number;
          orderCount: number;
        };

        return (
          <Card
            key={rep}
            className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {rep}
                </h3>
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Expected Amount:
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ₦{s.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Orders:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {s.orderCount}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Items Sold:
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {s.totalItems}
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
