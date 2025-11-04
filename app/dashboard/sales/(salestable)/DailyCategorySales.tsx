/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DollarSign,
  Cigarette,
  UtensilsCrossed,
  ChefHat,
  Filter,
  Search,
  User,
  Calendar,
  Wine,
} from "lucide-react";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useAllRoomExpenses } from "@/app/components/queryhooks/useAllRoomExpenses";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function DailyCategorySales() {
  const { recentSales = [] } = useRecentSales();
  const { allExpenses = [] } = useAllRoomExpenses();

  const [filters, setFilters] = useState({
    salesRep: "",
    dateRange: "today",
    searchTerm: "",
    status: "all",
  });

  const getDateRange = (range: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    switch (range) {
      case "today":
        return {
          start: today.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
      case "yesterday":
        return {
          start: yesterday.toISOString().split("T")[0],
          end: yesterday.toISOString().split("T")[0],
        };
      case "week":
        return {
          start: weekAgo.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
      default:
        return null;
    }
  };

  const filteredRequests = recentSales.filter((sale: any) => {
    const matchesSalesRep = filters.salesRep
      ? sale.sales_rep_name === filters.salesRep
      : true;

    const matchesSearch = filters.searchTerm
      ? sale.sales_rep_name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        sale.table_id?.toString().includes(filters.searchTerm)
      : true;

    let matchesDate = true;
    if (filters.dateRange) {
      const dateRange = getDateRange(filters.dateRange);
      if (dateRange) {
        const saleDate = sale.sale_date?.split("T")[0];
        if (saleDate) {
          matchesDate =
            saleDate >= dateRange.start && saleDate <= dateRange.end;
        }
      }
    }

    return matchesSalesRep && matchesDate && matchesSearch;
  });

  // Filter room expenses by date range
  const filteredRoomExpenses = useMemo(() => {
    return allExpenses.filter((expense: any) => {
      let matchesDate = true;
      if (filters.dateRange) {
        const dateRange = getDateRange(filters.dateRange);
        if (dateRange) {
          const expenseDate = expense.created_at?.split("T")[0];
          if (expenseDate) {
            matchesDate =
              expenseDate >= dateRange.start && expenseDate <= dateRange.end;
          }
        }
      }
      return matchesDate;
    });
  }, [allExpenses, filters.dateRange]);

  // Calculate room drink sales (only drinks from room expenses)
  const roomDrinkSales = useMemo(() => {
    return filteredRoomExpenses
      .filter(
        (expense: any) => expense.expense_type?.toLowerCase() === "drinks"
      )
      .reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
  }, [filteredRoomExpenses]);

  // Get unique sales reps
  const uniqueSalesReps = Array.from(
    new Set(recentSales.map((sale: any) => sale.sales_rep_name).filter(Boolean))
  ).sort();

  // Calculate sales rep summary from filtered requests
  const salesRepSummary = filteredRequests.reduce(
    (acc: any, sale: any) => {
      const rep = sale.sales_rep_name || "Unknown";
      const totalAmount = sale.total_amount || 0;

      const totalExpenses = Array.isArray(sale.expenses)
        ? sale.expenses
            .filter(
              (exp: { category?: string }) =>
                exp.category?.toLowerCase() !== "cigarette"
            )
            .reduce((sum: number, exp: { amount?: number }) => {
              return sum + (exp.amount || 0);
            }, 0)
        : 0;

      const totalItems = Array.isArray(sale.sale_items)
        ? sale.sale_items.reduce(
            (sum: number, item: { quantity?: number }) =>
              sum + (item.quantity || 0),
            0
          )
        : 0;

      if (!acc[rep]) {
        acc[rep] = {
          totalAmount: 0,
          totalExpenses: 0,
          totalItems: 0,
          orderCount: 0,
          expenseDetails: [],
        };
      }

      acc[rep].totalAmount += totalAmount;
      acc[rep].totalExpenses += totalExpenses;
      acc[rep].totalItems += totalItems;
      acc[rep].orderCount += 1;

      if (Array.isArray(sale.expenses)) {
        acc[rep].expenseDetails.push(
          ...sale.expenses.map((exp: any) => ({
            category: exp.category || "Uncategorized",
            amount: exp.amount || 0,
          }))
        );
      }

      return acc;
    },
    {} as Record<
      string,
      {
        totalAmount: number;
        totalExpenses: number;
        totalItems: number;
        orderCount: number;
        expenseDetails: { category: string; amount: number }[];
      }
    >
  );

  // Calculate totals by category
  const calculateCategoryTotals = () => {
    let totalAmount = 0;
    let totalCigarettes = 0;
    let totalAsun = 0;
    let totalKitchen = 0;

    Object.values(salesRepSummary).forEach((rep: any) => {
      // Total amount from sales
      totalAmount += rep.totalAmount;

      // Process expenses for other categories
      rep.expenseDetails.forEach((expense: any) => {
        const category = expense.category.toLowerCase();

        if (category === "cigarette") {
          totalCigarettes += expense.amount;
        } else if (category === "asun") {
          totalAsun += expense.amount;
        } else if (category === "kitchen") {
          totalKitchen += expense.amount;
        }
      });
    });

    // Actual drinks = total amount - cigarettes
    const totalDrinks = totalAmount - totalCigarettes;

    return {
      drinks: totalDrinks,
      cigarettes: totalCigarettes,
      asun: totalAsun,
      kitchen: totalKitchen,
      room: roomDrinkSales, // Add room drink sales
    };
  };

  const totals = calculateCategoryTotals();
  const grandTotal =
    totals.drinks +
    totals.cigarettes +
    totals.asun +
    totals.kitchen +
    totals.room;

  const categories = [
    {
      name: "Drinks",
      amount: totals.drinks,
      icon: DollarSign,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      name: "Cigarettes",
      amount: totals.cigarettes,
      icon: Cigarette,
      color: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-700 dark:text-orange-300",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      name: "Asun",
      amount: totals.asun,
      icon: UtensilsCrossed,
      color: "bg-red-500",
      bgLight: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-700 dark:text-red-300",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      name: "Kitchen",
      amount: totals.kitchen,
      icon: ChefHat,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      name: "Room",
      amount: totals.room,
      icon: Wine,
      color: "bg-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-700 dark:text-purple-300",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (amount: number) => {
    if (grandTotal === 0) return 0;
    return ((amount / grandTotal) * 100).toFixed(1);
  };

  const clearFilters = () => {
    setFilters({
      salesRep: "",
      dateRange: "today",
      searchTerm: "",
      status: "all",
    });
  };

  const hasActiveFilters =
    filters.salesRep ||
    (filters.dateRange && filters.dateRange !== "today") ||
    filters.searchTerm;

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Category Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Search className="w-4 h-4" />
                Search
              </label>
              <input
                type="text"
                placeholder="Rep or table..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                className="w-full rounded-lg px-3 py-2 text-sm
                  bg-slate-50 dark:bg-slate-700 
                  border border-slate-200 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              />
            </div>

            {/* Sales Rep Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
                Sales Rep
              </label>
              <select
                value={filters.salesRep}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    salesRep: e.target.value === "all" ? "" : e.target.value,
                  }))
                }
                className="w-full rounded-lg px-3 py-2 text-sm
                  bg-slate-50 dark:bg-slate-700 
                  border border-slate-200 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="all">All Reps</option>
                {uniqueSalesReps.map((rep) => (
                  <option key={rep} value={rep}>
                    {rep}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4" />
                Period
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: e.target.value === "all" ? "" : e.target.value,
                  }))
                }
                className="w-full rounded-lg px-3 py-2 text-sm
                  bg-slate-50 dark:bg-slate-700 
                  border border-slate-200 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
            Daily Sales Breakdown
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total sales by category for selected period
          </p>
        </div>

        {/* Grand Total Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 mb-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                Grand Total
              </p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const percentage = getPercentage(category.amount);

            return (
              <div
                key={category.name}
                className={`${category.bgLight} rounded-lg p-4 border ${category.borderColor}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`${category.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category.name}
                      </p>
                      <p className={`text-xs ${category.textColor}`}>
                        {percentage}% of total
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={`text-2xl font-bold ${category.textColor}`}>
                    {formatCurrency(category.amount)}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Highest Category
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {
                  categories.reduce((max, cat) =>
                    cat.amount > max.amount ? cat : max
                  ).name
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Categories Active
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {categories.filter((cat) => cat.amount > 0).length} /{" "}
                {categories.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Avg per Category
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {formatCurrency(
                  grandTotal /
                    categories.filter((cat) => cat.amount > 0).length || 0
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Total Sales Reps
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {Object.keys(salesRepSummary).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
