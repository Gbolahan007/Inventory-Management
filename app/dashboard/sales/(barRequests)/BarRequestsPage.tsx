/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useBarRequestsQuery } from "@/app/components/queryhooks/useBarRequestsQuery";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import type { BarRequest } from "../(sales)/types";
import { RequestFilters } from "./RequestFilters";
import { RequestsList } from "./RequestList";
import { SalesRepSummary } from "./SalesRepSummary";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";
import { supabase } from "@/app/_lib/supabase";
import toast from "react-hot-toast";

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

  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set()
  );

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
    created_at: item.created_at || new Date().toISOString(),
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
        : { name: "Unknown", category: "Unknown" },
  }));

  const [filters, setFilters] = useState({
    salesRep: "",
    dateRange: "today",
    searchTerm: "",
    status: "all",
  });
  const [sortBy, setSortBy] = useState<"time" | "salesRep" | "total">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const uniqueSalesReps = Array.from(
    new Set(
      barRequests.map((req: BarRequest) => req.sales_rep_name).filter(Boolean)
    )
  ).sort();

  // Group pending requests by table and sales rep
  const pendingRequests = barRequests
    .filter((req: BarRequest) => req.status === "pending")
    .reduce((acc: any, req: BarRequest) => {
      const key = `${req.table_id}-${req.sales_rep_id}`;
      if (!acc[key]) {
        acc[key] = {
          table_id: req.table_id,
          sales_rep_name: req.sales_rep_name,
          sales_rep_id: req.sales_rep_id,
          created_at: req.created_at,
          items: [],
          totalAmount: 0,
        };
      }
      acc[key].items.push(req);
      acc[key].totalAmount += (req.product_price || 0) * (req.quantity || 0);
      return acc;
    }, {});

  const pendingRequestsArray = Object.values(pendingRequests);

  // Handle approve request
  const handleApprove = async (
    tableId: number,
    salesRepId: string,
    items: BarRequest[]
  ) => {
    const requestIds = items.map((item) => item.id);
    const key = `${tableId}-${salesRepId}`;

    setProcessingRequests((prev) => new Set([...prev, key]));

    try {
      const { error } = await supabase
        .from("bar_requests")
        .update({ status: "accepted" })
        .in("id", requestIds);

      if (error) throw error;

      toast.success(`Request for Table ${tableId} approved!`);
      await refetch();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // Handle reject request
  const handleReject = async (
    tableId: number,
    salesRepId: string,
    items: BarRequest[]
  ) => {
    const requestIds = items.map((item) => item.id);
    const key = `${tableId}-${salesRepId}`;

    setProcessingRequests((prev) => new Set([...prev, key]));

    try {
      const { error } = await supabase
        .from("bar_requests")
        .update({ status: "rejected" })
        .in("id", requestIds);

      if (error) throw error;

      toast.success(`Request for Table ${tableId} rejected`);
      await refetch();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error(`Failed to reject: ${error.message}`);
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

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
  // Build the salesRepSummary for each sales rep
  const salesRepSummary = filteredRequests.reduce(
    (acc, sale) => {
      const rep = sale.sales_rep_name || "Unknown";
      const totalAmount = sale.total_amount || 0;

      // Exclude cigarette from totalExpenses
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

      // Collect ALL expense details (including cigarette for display)
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

  // Calculate the total expected amount across all sales reps
  const totalExpectedForDay = Object.values(
    salesRepSummary as Record<
      string,
      {
        totalAmount: number;
        totalExpenses: number;
        totalItems: number;
        orderCount: number;
        expenseDetails: { category: string; amount: number }[];
      }
    >
  ).reduce((sum: number, summary) => {
    const totalNonCigaretteExpenses = summary.expenseDetails
      .filter(
        (exp: { category: string }) =>
          exp.category.toLowerCase() !== "cigarette"
      )
      .reduce(
        (subSum: number, exp: { amount: number }) => subSum + exp.amount,
        0
      );

    const expectedAmount = summary.totalAmount + totalNonCigaretteExpenses;

    return sum + expectedAmount;
  }, 0);

  const clearFilters = () => {
    setFilters({ salesRep: "", dateRange: "", searchTerm: "", status: "all" });
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

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

        {/* 🔔 PENDING REQUESTS SECTION */}
        {pendingRequestsArray.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-yellow-300 dark:border-yellow-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Pending Approvals ({pendingRequestsArray.length})
              </h2>
            </div>

            <div className="space-y-4">
              {pendingRequestsArray.map((request: any, index: number) => {
                const key = `${request.table_id}-${request.sales_rep_id}`;
                const isProcessing = processingRequests.has(key);

                return (
                  <div
                    key={`${key}-${index}`}
                    className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            Table {request.table_id}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {request.sales_rep_name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatTime(request.created_at)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                      {request.items.map((item: BarRequest) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-white">
                            ₦
                            {(
                              (item.product_price || 0) * (item.quantity || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t border-slate-300 dark:border-slate-700 pt-3 mb-3">
                      <span className="font-semibold text-slate-800 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-bold text-slate-800 dark:text-white">
                        {new Intl.NumberFormat("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 2,
                        }).format(request.totalAmount)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleApprove(
                            request.table_id,
                            request.sales_rep_id,
                            request.items
                          )
                        }
                        disabled={isProcessing}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleReject(
                            request.table_id,
                            request.sales_rep_id,
                            request.items
                          )
                        }
                        disabled={isProcessing}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SalesRepSummary
          totalExpectedForDay={totalExpectedForDay}
          salesRepSummary={salesRepSummary}
        />

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
