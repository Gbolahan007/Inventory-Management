import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

interface SalesRepSummaryProps {
  salesRepSummary: Record<
    string,
    {
      totalAmount: number;
      totalExpenses: number;
      totalItems: number;
      orderCount: number;
      expenseDetails: { category: string; amount: number }[];
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
        // Calculate cigarette amount from expense details
        const cigaretteAmount = summary.expenseDetails
          .filter((exp) => exp.category.toLowerCase() === "cigarette")
          .reduce((sum, exp) => sum + exp.amount, 0);

        // Filter out cigarette from expenses
        const nonCigaretteExpenses = summary.expenseDetails.filter(
          (exp) => exp.category.toLowerCase() !== "cigarette"
        );

        const totalNonCigaretteExpenses = nonCigaretteExpenses.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );

        const expectedAmount = summary.totalAmount + totalNonCigaretteExpenses;

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

              {/* Amounts Section */}
              <div className="space-y-3">
                {/* Total Sales */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Total Sales:
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₦{summary.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {cigaretteAmount > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic text-right">
                      (incl. cigarette: ₦{cigaretteAmount.toLocaleString()})
                    </div>
                  )}
                </div>

                {/* Expenses with details (excluding cigarette) */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Expenses:
                    </span>
                    <span className="font-bold text-red-500 dark:text-red-400">
                      ₦{totalNonCigaretteExpenses.toLocaleString()}
                    </span>
                  </div>

                  {/* Expense breakdown list (excluding cigarette) */}
                  {nonCigaretteExpenses.length > 0 && (
                    <ul className="pl-2 mt-1 text-xs space-y-1 border-l border-slate-200 dark:border-slate-700">
                      {nonCigaretteExpenses.map((exp, idx) => (
                        <li
                          key={idx}
                          className="flex justify-between text-slate-600 dark:text-slate-300"
                        >
                          <span>{exp.category}</span>
                          <span className="font-medium">
                            ₦{exp.amount.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Expected Amount */}
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-semibold">
                    Expected Amount:
                  </span>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    ₦{expectedAmount.toLocaleString()}
                  </span>
                </div>

                {/* Orders */}
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
