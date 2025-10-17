/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { supabase } from "@/app/_lib/supabase";
import { usePendingSales } from "@/app/components/queryhooks/usePendingSales";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, RefreshCw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { PendingSalesFilters } from "./PendingSalesFilters";
import { PendingSalesMobileCard } from "./PendingSalesMobileCard";
import { PendingSalesTablePayment } from "./PendingSalesTablePayment";

export function PendingSalesPayment() {
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
    const paymentAmount = Number.parseFloat(paymentInputs[saleId] || "0");
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

  const handleSortChange = (
    newSortBy: "time" | "amount",
    newSortOrder: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

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
        <PendingSalesFilters
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFiltersChange={setFilters}
          onSortChange={handleSortChange}
        />

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
            <PendingSalesTablePayment
              sales={sortedSales}
              paymentInputs={paymentInputs}
              onPaymentInputChange={(saleId, value) =>
                setPaymentInputs((prev) => ({ ...prev, [saleId]: value }))
              }
              onPartialPayment={handlePartialPayment}
              onMarkAsPaid={(saleId) => markAsPaid.mutate(saleId)}
              isAddingPayment={addPartialPayment.isPending}
              isMarkingPaid={markAsPaid.isPending}
            />

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {sortedSales.map((sale: any) => (
                <PendingSalesMobileCard
                  key={sale.id}
                  sale={sale}
                  isExpanded={expandedCards[sale.id]}
                  paymentInput={paymentInputs[sale.id] || ""}
                  onToggleExpand={() => toggleExpandCard(sale.id)}
                  onPaymentInputChange={(value) =>
                    setPaymentInputs((prev) => ({ ...prev, [sale.id]: value }))
                  }
                  onPartialPayment={() =>
                    handlePartialPayment(sale.id, sale.total_amount)
                  }
                  onMarkAsPaid={() => markAsPaid.mutate(sale.id)}
                  isAddingPayment={addPartialPayment.isPending}
                  isMarkingPaid={markAsPaid.isPending}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
