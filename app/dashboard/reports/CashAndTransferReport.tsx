"use client";

import React, { useMemo, useState } from "react";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { Calendar, Loader2 } from "lucide-react";
import { isSameDay, subDays, isAfter, parseISO, format } from "date-fns";

type FilterType = "today" | "yesterday" | "week";

interface Sale {
  id: number;
  sale_date: string;
  sales_rep_name?: string;
  payment_method?: string;
  total_amount?: number;
  payment_details?: {
    cash_amount?: number;
    transfer_amount?: number;
    total_amount?: number;
  };
}

interface GroupedByRep {
  date: string;
  sales_rep_name: string;
  cash: number;
  transfer: number;
  total: number;
}

interface GroupedByDate {
  date: string;
  sales_reps: string;
  cash: number;
  transfer: number;
  total: number;
}

export default function CashAndTransferReport() {
  const { recentSales = [], isLoading } = useRecentSales();
  const [filter, setFilter] = useState<FilterType>("today");

  // ✅ Filter sales by date
  const filteredSales = useMemo(() => {
    const today = new Date();
    return recentSales.filter((sale: Sale) => {
      const saleDate = parseISO(sale.sale_date);

      if (filter === "today") return isSameDay(saleDate, today);
      if (filter === "yesterday") return isSameDay(saleDate, subDays(today, 1));
      if (filter === "week") return isAfter(saleDate, subDays(today, 7));

      return true;
    });
  }, [recentSales, filter]);

  // ✅ Group by (date + sales rep)
  const groupedByRep = useMemo(() => {
    const groups: Record<string, GroupedByRep> = {};

    filteredSales.forEach((sale) => {
      const date = format(parseISO(sale.sale_date), "yyyy-MM-dd");
      const rep = sale.sales_rep_name || "Unknown Rep";
      const key = `${date}_${rep}`;

      if (!groups[key]) {
        groups[key] = {
          date,
          sales_rep_name: rep,
          cash: 0,
          transfer: 0,
          total: 0,
        };
      }

      const method = sale.payment_method?.toLowerCase() || "unknown";
      const saleTotal = sale.total_amount || 0;

      if (method === "cash") {
        groups[key].cash += saleTotal;
      } else if (method === "transfer") {
        groups[key].transfer += saleTotal;
      } else if (method === "split" && sale.payment_details) {
        const { transfer_amount = 0 } = sale.payment_details;

        let cash_amount = 0;
        let transfer = 0;

        if (transfer_amount <= saleTotal) {
          cash_amount = saleTotal - transfer_amount;
          transfer = transfer_amount;
        } else {
          // 🚨 Handle mismatch: if transfer is greater than total, assume all transfer
          cash_amount = 0;
          transfer = saleTotal;
        }

        groups[key].cash += cash_amount;
        groups[key].transfer += transfer;
      }

      groups[key].total += saleTotal;
    });

    return Object.values(groups);
  }, [filteredSales]);

  // ✅ Group by date only (combine reps)
  const groupedByDate = useMemo(() => {
    const dateGroups: Record<string, GroupedByDate> = {};

    groupedByRep.forEach((entry) => {
      const { date, sales_rep_name, cash, transfer, total } = entry;

      if (!dateGroups[date]) {
        dateGroups[date] = {
          date,
          sales_reps: sales_rep_name,
          cash,
          transfer,
          total,
        };
      } else {
        const existingNames = dateGroups[date].sales_reps.split(", ");
        if (!existingNames.includes(sales_rep_name)) {
          dateGroups[date].sales_reps += `, ${sales_rep_name}`;
        }

        dateGroups[date].cash += cash;
        dateGroups[date].transfer += transfer;
        dateGroups[date].total += total;
      }
    });

    return Object.values(dateGroups).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [groupedByRep]);

  // ✅ Overall totals
  const totals = useMemo(() => {
    return groupedByDate.reduce(
      (acc, item) => {
        acc.cash += item.cash;
        acc.transfer += item.transfer;
        acc.total += item.total;
        return acc;
      },
      { cash: 0, transfer: 0, total: 0 }
    );
  }, [groupedByDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-lg font-medium">
        <Loader2 className="animate-spin h-5 w-5 mr-2 text-primary" />
        Loading report...
      </div>
    );
  }

  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-6">
      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Cash & Transfer Report
        </h2>
        <div className="flex gap-2">
          {(["today", "yesterday", "week"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted text-center">
          <h3 className="text-sm text-muted-foreground">Total Cash Sales</h3>
          <p className="text-2xl font-semibold">
            ₦{totals.cash.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted text-center">
          <h3 className="text-sm text-muted-foreground">
            Total Transfer Sales
          </h3>
          <p className="text-2xl font-semibold">
            ₦{totals.transfer.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-muted text-center">
          <h3 className="text-sm text-muted-foreground">Overall Total</h3>
          <p className="text-2xl font-semibold">
            ₦{totals.total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Grouped Table */}
      <div className="overflow-x-auto border-t pt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b">
              <th className="py-2">Date</th>
              <th>Sales Reps</th>
              <th>Cash (₦)</th>
              <th>Transfer (₦)</th>
              <th>Total (₦)</th>
            </tr>
          </thead>
          <tbody>
            {groupedByDate.map((entry, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2">{entry.date}</td>
                <td>{entry.sales_reps}</td>
                <td>{entry.cash.toLocaleString()}</td>
                <td>{entry.transfer.toLocaleString()}</td>
                <td className="font-medium">{entry.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
