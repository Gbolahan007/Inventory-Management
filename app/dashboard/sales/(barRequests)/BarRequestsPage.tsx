/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { BarRequest } from "../(sales)/types";
import { RequestFilters } from "./RequestFilters";
import { RequestsList } from "./RequestList";
import { SalesRepSummary } from "./SalesRepSummary";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";

type SaleItem = {
  id?: string;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  created_at?: string;
  products: {
    name: string;
    category?: string;
  };
};

export default function BarRequestsPage() {
  const {
    barRequests = [],
    isLoading,
    refetch,
    isFetching,
  } = useBarRequestsQuery();
  const { recentSales = [] } = useRecentSales();
  const { topSellingProducts: rawSalesItems } = useTopSellingProducts();

  const salesItems: SaleItem[] = (rawSalesItems ?? []).map((item: any) => ({
    id: item.id,
    sale_id: Number(item.sale_id ?? 0),
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
    unit_price: item.unit_price ? Number(item.unit_price) : undefined,
    unit_cost: item.unit_cost ? Number(item.unit_cost) : undefined,
    total_price: Number(item.total_price),
    total_cost: Number(item.total_cost),
    profit_amount: Number(item.profit_amount),
    created_at: item.created_at || new Date().toISOString(), // ← Provide default
    products:
      Array.isArray(item.products) && item.products.length > 0
        ? {
            name: item.products[0].name,
            category: item.products[0].category,
          }
        : item.products && typeof item.products === "object"
        ? {
            name: item.products.name,
            category: item.products.category,
          }
        : { name: "Unknown", category: "Unknown" }, // ← Provide default
  }));
  const [filters, setFilters] = useState({
    salesRep: "",
    dateRange: "",
    searchTerm: "",
  });
  const [sortBy, setSortBy] = useState<"time" | "salesRep" | "total">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const uniqueSalesReps = Array.from(
    new Set(
      barRequests.map((req: BarRequest) => req.sales_rep_name).filter(Boolean)
    )
  ).sort();

  // Date filter logic
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

  // Apply filters and search
  const filteredRequests = recentSales.filter((sale) => {
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

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "time":
        comparison =
          new Date(a.sale_date || "").getTime() -
          new Date(b.sale_date || "").getTime();
        break;
      case "salesRep":
        comparison = (a.sales_rep_name || "").localeCompare(
          b.sales_rep_name || ""
        );
        break;
      case "total":
        comparison = (a.total_amount || 0) - (b.total_amount || 0);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
  console.log(filteredRequests);

  // ✅ Calculate sales rep summaries (fixed)
  const salesRepSummary = filteredRequests.reduce((acc, sale) => {
    const rep = sale.sales_rep_name || "Unknown";
    const totalAmount = sale.total_amount || 0;

    const totalExpenses = Array.isArray(sale.expenses)
      ? sale.expenses.reduce((sum: number, exp: { amount?: number }) => {
          return sum + (exp.amount || 0);
        }, 0)
      : 0;

    // total items = sum of sale_items quantity
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
      };
    }

    acc[rep].totalAmount += totalAmount;
    acc[rep].totalExpenses += totalExpenses;
    acc[rep].totalItems += totalItems;
    acc[rep].orderCount += 1;

    return acc;
  }, {} as Record<string, { totalAmount: number; totalExpenses: number; totalItems: number; orderCount: number }>);

  console.log(salesRepSummary);

  const clearFilters = () => {
    setFilters({ salesRep: "", dateRange: "", searchTerm: "" });
  };

  const hasActiveFilters =
    filters.salesRep || filters.dateRange || filters.searchTerm;

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const clearOldRequests = async (type: "yesterday" | "week") => {
    console.log(`Clearing ${type} requests...`);
    await handleRefresh();
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-[#5492e1] bg-clip-text text-transparent">
              Bar Service Log
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm lg:text-base">
              Track sales performance and manage requests
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="text-sm text-slate-500 dark:text-slate-400 order-last sm:order-first">
              {filteredRequests.length} of {barRequests.length} requests
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isFetching ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => clearOldRequests("yesterday")}
                  className="px-2 py-2 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Clear Yesterday</span>
                  <span className="sm:hidden">Y</span>
                </button>
                <button
                  onClick={() => clearOldRequests("week")}
                  className="px-2 py-2 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-md transition-colors"
                >
                  <span className="hidden sm:inline">Clear Week+</span>
                  <span className="sm:hidden">W+</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader2 className="animate-spin w-4 h-4" />
              <span className="text-sm">Updating data...</span>
            </div>
          </div>
        )}

        <SalesRepSummary salesRepSummary={salesRepSummary} />

        <RequestFilters
          filters={filters}
          setFilters={setFilters}
          uniqueSalesReps={uniqueSalesReps}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        <RequestsList
          isLoading={isLoading}
          sortedRequests={sortedRequests}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          salesItems={salesItems}
        />
      </div>
    </div>
  );
}
