import { useDailySalesReport } from "@/app/components/queryhooks/useDailySalesReport";
import React, { useState, useMemo } from "react";
import { Calendar, DollarSign, Filter } from "lucide-react";

// ✅ Define type for each sales record
interface DailySalesRecord {
  date: string;
  drinkSales?: number;
  cigarette?: number;
  totalSales?: number;
}

function DailySalesReports() {
  const { dailySalesReport } = useDailySalesReport() as {
    dailySalesReport: DailySalesRecord[] | undefined;
  };

  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Get current date info
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    .toISOString()
    .split("T")[0];

  // Filter data based on selected filter
  const filteredData = useMemo(() => {
    if (!dailySalesReport) return [];

    let filtered = [...dailySalesReport];

    switch (filterType) {
      case "today":
        filtered = filtered.filter((item) => item.date === today);
        break;
      case "yesterday":
        filtered = filtered.filter((item) => item.date === yesterday);
        break;
      case "weekly":
        filtered = filtered.filter(
          (item) => item.date >= sevenDaysAgo && item.date <= today
        );
        break;
      case "monthly":
        if (selectedMonth) {
          filtered = filtered.filter((item) =>
            item.date.startsWith(selectedMonth)
          );
        }
        break;
      default:
        break;
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [
    dailySalesReport,
    filterType,
    selectedMonth,
    today,
    yesterday,
    sevenDaysAgo,
  ]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredData.length) return { drinks: 0, cigarettes: 0, total: 0 };

    return filteredData.reduce(
      (acc, item) => ({
        drinks: acc.drinks + (item.drinkSales || 0),
        cigarettes: acc.cigarettes + (item.cigarette || 0),
        total: acc.total + (item.totalSales || 0),
      }),
      { drinks: 0, cigarettes: 0, total: 0 }
    );
  }, [filteredData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Daily Sales Report
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your sales performance
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">
              Filters
            </h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Quick Filters */}
            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground block mb-2">
                Quick Filter
              </label>
              <div className="flex flex-wrap gap-2">
                {["all", "today", "yesterday", "weekly"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setFilterType(filter);
                      if (filter !== "monthly") setSelectedMonth("");
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === filter
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {filter === "weekly"
                      ? "Last 7 Days"
                      : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Filter */}
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium text-card-foreground block mb-2">
                Monthly Filter
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setFilterType("monthly");
                }}
                className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Drink Sales
              </h3>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totals.drinks)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Cigarette Sales
              </h3>
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totals.cigarettes)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Sales
              </h3>
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-card-foreground">
              {formatCurrency(totals.total)}
            </p>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Sales Records
              </h2>
              <span className="ml-auto text-sm text-muted-foreground">
                {filteredData.length} records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Drink Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cigarette Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Sales
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.length > 0 ? (
                  filteredData.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-card-foreground">
                        {formatCurrency(record.drinkSales || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-card-foreground">
                        {formatCurrency(record.cigarette || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-card-foreground">
                        {formatCurrency(record.totalSales || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No sales records found for the selected filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailySalesReports;
