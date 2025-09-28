/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { supabase } from "@/app/_lib/supabase";
import { usePendingSales } from "@/app/components/queryhooks/usePendingSales";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  DollarSign,
  Loader2,
  Package,
  RefreshCw,
  Search,
  User,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function PendingSalesTable() {
  const {
    pendingSales = [],
    isLoading,
    refetch,
    isFetching,
  } = usePendingSales();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    searchTerm: "",
    dateRange: "",
  });
  const [sortBy, setSortBy] = useState<"time" | "amount">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>(
    {}
  );
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );

  // Add partial payment mutation
  const addPartialPayment = useMutation({
    mutationFn: async ({
      saleId,
      paymentAmount,
    }: {
      saleId: string;
      paymentAmount: number;
    }) => {
      // First, get the current sale data
      const { data: saleData, error: fetchError } = await supabase
        .from("sales")
        .select("total_amount, amount_paid")
        .eq("id", saleId)
        .single();

      if (fetchError) throw fetchError;

      const currentAmountPaid = saleData.amount_paid || 0;
      const newAmountPaid = currentAmountPaid + paymentAmount;
      const remainingBalance = saleData.total_amount - newAmountPaid;

      const { error } = await supabase
        .from("sales")
        .update({
          amount_paid: newAmountPaid,
          is_pending: remainingBalance > 0,
        })
        .eq("id", saleId);

      if (error) throw error;

      return { newAmountPaid, remainingBalance };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "recent"] });

      // Clear the payment input for this sale
      setPaymentInputs((prev) => ({ ...prev, [variables.saleId]: "" }));

      // Show success message
      const { remainingBalance } = data;
      if (remainingBalance <= 0) {
        toast("Payment completed! Sale has been marked as fully paid.");
      } else {
        toast(
          `Payment added successfully! Remaining balance: ₦${remainingBalance.toLocaleString()}`
        );
      }
    },
    onError: (error) => {
      toast("Failed to add payment: " + error.message);
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (saleId: string) => {
      // Get the sale data first
      const { data: saleData, error: fetchError } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("id", saleId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("sales")
        .update({
          is_pending: false,
          amount_paid: saleData.total_amount, // Mark as fully paid
        })
        .eq("id", saleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "recent"] });
    },
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

  // Helper function to calculate remaining balance
  const getRemainingBalance = (sale: any) => {
    const amountPaid = sale.amount_paid || 0;
    return sale.total_amount - amountPaid;
  };

  const handlePartialPayment = (saleId: string, totalAmount: number) => {
    const paymentAmount = parseFloat(paymentInputs[saleId] || "0");
    const remainingBalance = getRemainingBalance(
      pendingSales.find((s: any) => s.id === saleId)
    );
    console.log(totalAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast("Please enter a valid payment amount");
      return;
    }

    if (paymentAmount > remainingBalance) {
      toast(
        `Payment amount cannot exceed remaining balance of ₦${remainingBalance.toLocaleString()}`
      );
      return;
    }

    addPartialPayment.mutate({ saleId, paymentAmount });
  };

  const toggleExpandCard = (saleId: string) => {
    setExpandedCards((prev) => ({ ...prev, [saleId]: !prev[saleId] }));
  };

  // Filtering
  const filteredSales = pendingSales.filter((sale: any) => {
    const matchesSearch = filters.searchTerm
      ? sale.pending_customer_name
          ?.toString()
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        sale.sales_rep_name
          ?.toString()
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      : true;

    let matchesDate = true;
    if (filters.dateRange) {
      const range = getDateRange(filters.dateRange);
      if (range) {
        const saleDate = sale.sale_date?.split("T")[0];
        if (saleDate) {
          matchesDate = saleDate >= range.start && saleDate <= range.end;
        }
      }
    }

    return matchesSearch && matchesDate;
  });

  // Sorting
  const sortedSales = [...filteredSales].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "time":
        comparison =
          new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime();
        break;
      case "amount":
        comparison = getRemainingBalance(a) - getRemainingBalance(b);
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-[#5492e1] bg-clip-text text-transparent">
              Pending Sales
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm lg:text-base">
              Review and process pending sales payments
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Search className="w-4 h-4" /> Search
                </label>
                <input
                  type="text"
                  placeholder="Customer name or sales rep..."
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

              {/* Date Range */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4" /> Period
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

              {/* Sort By */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <DollarSign className="w-4 h-4" /> Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split(
                      "-"
                    ) as [typeof sortBy, typeof sortOrder];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-sm
                    bg-slate-50 dark:bg-slate-700 
                    border border-slate-200 dark:border-slate-600
                    text-slate-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-all duration-200"
                >
                  <option value="time-desc">Newest First</option>
                  <option value="time-asc">Oldest First</option>
                  <option value="amount-desc">Highest Balance</option>
                  <option value="amount-asc">Lowest Balance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading & Empty states */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading sales...
            </p>
          </div>
        ) : sortedSales.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No pending sales 🎉
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                {filters.searchTerm || filters.dateRange
                  ? "Try adjusting your filters."
                  : "All sales are confirmed!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left font-semibold">Customer</th>
                      <th className="p-4 text-left font-semibold">Sales Rep</th>
                      <th className="p-4 text-left font-semibold">Table</th>
                      <th className="p-4 text-left font-semibold">
                        Payment Status
                      </th>
                      <th className="p-4 text-left font-semibold">Date</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSales.map((sale: any, idx) => {
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
                                    setPaymentInputs((prev) => ({
                                      ...prev,
                                      [sale.id]: e.target.value,
                                    }))
                                  }
                                  className="w-24 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500
                                    bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600
                                    text-slate-900 dark:text-slate-100"
                                />
                                <button
                                  onClick={() =>
                                    handlePartialPayment(
                                      sale.id,
                                      sale.total_amount
                                    )
                                  }
                                  disabled={
                                    addPartialPayment.isPending ||
                                    !paymentInputs[sale.id]
                                  }
                                  className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  {addPartialPayment.isPending ? "..." : "Add"}
                                </button>
                              </div>
                              <button
                                onClick={() => markAsPaid.mutate(sale.id)}
                                disabled={markAsPaid.isPending}
                                className="w-full px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {markAsPaid.isPending
                                  ? "Updating..."
                                  : "Mark Paid"}
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {sortedSales.map((sale: any) => {
                const remainingBalance = getRemainingBalance(sale);
                const amountPaid = sale.amount_paid || 0;
                const isExpanded = expandedCards[sale.id];

                return (
                  <Card
                    key={sale.id}
                    className="border-0 shadow-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                  >
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
                          onClick={() => toggleExpandCard(sale.id)}
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
                          <span className="text-slate-600 dark:text-slate-400">
                            Balance:
                          </span>
                          <span className="text-red-600 dark:text-red-400">
                            ₦{remainingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Payment Actions */}
                      {isExpanded && (
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Partial Payment
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder={`Max: ₦${remainingBalance.toLocaleString()}`}
                                value={paymentInputs[sale.id] || ""}
                                onChange={(e) =>
                                  setPaymentInputs((prev) => ({
                                    ...prev,
                                    [sale.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500
                                  bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600
                                  text-slate-900 dark:text-slate-100"
                              />
                              <button
                                onClick={() =>
                                  handlePartialPayment(
                                    sale.id,
                                    sale.total_amount
                                  )
                                }
                                disabled={
                                  addPartialPayment.isPending ||
                                  !paymentInputs[sale.id]
                                }
                                className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                <CreditCard className="w-4 h-4" />
                                {addPartialPayment.isPending ? "..." : "Add"}
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => markAsPaid.mutate(sale.id)}
                            disabled={markAsPaid.isPending}
                            className="w-full px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {markAsPaid.isPending
                              ? "Updating..."
                              : "Mark as Fully Paid"}
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
