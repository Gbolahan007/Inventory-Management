"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  Clock,
  DollarSign,
  Loader2,
  Package,
  User,
  TrendingDown,
  Table,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Expense {
  id: number;
  amount: number;
  category: string;
  created_at?: string;
  sales_rep_id: string;
  table_id?: number;
}

interface Sale {
  id: number;
  sale_date: string;
  table_id: number;
  total_amount: number;
  sales_rep_id: string;
  sales_rep_name: string;
  expenses?: Expense[];
}

interface Product {
  name?: string;
  category?: string;
}

interface SalesItem {
  id?: string;
  sale_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  created_at?: string;
  products?: Product;
}

interface RequestsListProps {
  isLoading: boolean;
  sortedRequests: Sale[];
  hasActiveFilters: string;
  clearFilters: () => void;
  sortBy: "time" | "salesRep" | "total";
  sortOrder: "asc" | "desc";
  handleSort: (newSortBy: "time" | "salesRep" | "total") => void;
  salesItems: SalesItem[];
}

export function RequestsList({
  isLoading,
  sortedRequests,
  hasActiveFilters,
  clearFilters,
  sortBy,
  sortOrder,
  handleSort,
  salesItems,
}: RequestsListProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter items belonging to the selected sale
  const selectedSaleItems = selectedSale
    ? salesItems.filter((item) => item.sale_id === selectedSale.id)
    : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Loading sales records...
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
            No sales found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results."
              : "There are no recent sales to display."}
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
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                    <button
                      onClick={() => handleSort("time")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
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
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                    <Table className="w-4 h-4 inline-block mr-1" />
                    Table
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                    <button
                      onClick={() => handleSort("total")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <DollarSign className="w-4 h-4" />
                      Total Sale
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortBy === "total" && sortOrder === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                    <button
                      onClick={() => handleSort("salesRep")}
                      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
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
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      Expenses
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((sale, index) => {
                  const totalExpenses =
                    sale.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

                  const breakdown = (sale.expenses || []).reduce((acc, exp) => {
                    const category = exp.category.toLowerCase();
                    acc[category] = (acc[category] || 0) + exp.amount;
                    return acc;
                  }, {} as Record<string, number>);

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className={`cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/30 transition-colors ${
                        index % 2 === 0
                          ? "bg-white dark:bg-slate-800"
                          : "bg-slate-50/50 dark:bg-slate-900/30"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {new Date(sale.sale_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold rounded-lg">
                          {sale.table_id}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-green-600 dark:text-green-400">
                        ₦{sale.total_amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-900 dark:text-slate-100 font-medium">
                        {sale.sales_rep_name}
                      </td>
                      <td className="p-4">
                        {totalExpenses > 0 ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                              ₦{totalExpenses.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                              {Object.entries(breakdown).map(
                                ([category, amount]) => (
                                  <div key={category} className="capitalize">
                                    {category}:{" "}
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                      ₦{amount.toLocaleString()}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-sm">
                            No expenses
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {sortedRequests.map((sale) => {
          const totalExpenses =
            sale.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
          const breakdown = (sale.expenses || []).reduce((acc, exp) => {
            acc[exp.category.toLowerCase()] =
              (acc[exp.category.toLowerCase()] || 0) + exp.amount;
            return acc;
          }, {} as Record<string, number>);

          return (
            <Card
              key={sale.id}
              onClick={() => setSelectedSale(sale)}
              className="cursor-pointer border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-blue-50/40 dark:hover:bg-blue-900/30 transition"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Table {sale.table_id}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {sale.sales_rep_name}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₦{sale.total_amount.toLocaleString()}
                  </p>
                </div>

                {totalExpenses > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                      Expenses: ₦{totalExpenses.toLocaleString()}
                    </p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(breakdown).map(([cat, amt]) => (
                        <div
                          key={cat}
                          className="flex justify-between text-slate-700 dark:text-slate-300"
                        >
                          <span className="capitalize">{cat}</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            ₦{amt.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>{new Date(sale.sale_date).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal for Sales Items */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Sales Items — Table {selectedSale?.table_id}
            </DialogTitle>
          </DialogHeader>
          {selectedSaleItems.length > 0 ? (
            <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto">
              {selectedSaleItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.products?.name || "Unnamed Product"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {item.products?.category || "N/A"}
                  </p>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    Quantity: <strong>{item.quantity}</strong>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Total: ₦{item.total_price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">
              No items found for this sale.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
