/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useDailyExpenses } from "@/app/components/queryhooks/useDailyExpenses";
import { useDailySalesReport } from "@/app/components/queryhooks/useDailySalesReport";
import { useRoomBookings } from "@/app/components/queryhooks/useRoomBookings";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import React, { useMemo, useState } from "react";
import ExpenseForm from "./ExpenseForm";

interface DailySalesRecord {
  date: string;
  drinkSales?: number;
  cigarette?: number;
  totalSales?: number;
}

interface Booking {
  id: string | number;
  room_type: string;
  num_nights?: number;
  customer_type?: string;
  discount_sale?: boolean | string;
  total_price?: number;
  category: string;
  created_at: string;
}

export default function DailySalesReports() {
  const { dailySalesReport } = useDailySalesReport() as {
    dailySalesReport: DailySalesRecord[] | undefined;
  };
  const { room_bookings } = useRoomBookings() as { room_bookings: Booking[] };
  const { expenses } = useDailyExpenses();

  const [filterType, setFilterType] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const getLocalDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-CA");
  const today = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString(
    "en-CA"
  );

  // ✅ Filter sales data
  const filteredSalesData = useMemo(() => {
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
        if (selectedMonth)
          filtered = filtered.filter((item) =>
            item.date.startsWith(selectedMonth)
          );
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

  // ✅ Filtered Bookings
  const filteredBookings = useMemo(() => {
    if (!room_bookings) return [];

    let filtered = [...room_bookings];
    switch (filterType) {
      case "today":
        filtered = filtered.filter((b) => getLocalDate(b.created_at) === today);
        break;
      case "yesterday":
        filtered = filtered.filter(
          (b) => getLocalDate(b.created_at) === yesterday
        );
        break;
      case "weekly":
        filtered = filtered.filter(
          (b) =>
            getLocalDate(b.created_at) >= sevenDaysAgo &&
            getLocalDate(b.created_at) <= today
        );
        break;
      case "monthly":
        if (selectedMonth)
          filtered = filtered.filter((b) =>
            getLocalDate(b.created_at).startsWith(selectedMonth)
          );
        break;
    }

    return filtered;
  }, [
    room_bookings,
    filterType,
    selectedMonth,
    today,
    yesterday,
    sevenDaysAgo,
  ]);

  // ✅ Group room data
  const groupedRoomData = useMemo(() => {
    const grouped: Record<
      string,
      { room: number; shortRest: number; total: number }
    > = {};
    filteredBookings.forEach((b) => {
      const date = getLocalDate(b.created_at);
      const price = b.total_price || 0;
      if (!grouped[date]) grouped[date] = { room: 0, shortRest: 0, total: 0 };

      if (b.category === "Room") grouped[date].room += price;
      if (b.category === "Short Rest") grouped[date].shortRest += price;
      grouped[date].total += price;
    });
    return grouped;
  }, [filteredBookings]);

  // ✅ Helper: Get expenses for each date
  const getExpensesByDate = (date: string) => {
    if (!expenses) return [];
    return expenses.filter((exp: any) => exp.expense_date?.startsWith(date));
  };

  // ✅ Totals (after deducting expenses)
  const totals = useMemo(() => {
    const allDates = Array.from(
      new Set([
        ...Object.keys(groupedRoomData),
        ...filteredSalesData.map((d) => d.date),
      ])
    );

    let totalRoom = 0;
    let totalShortRest = 0;
    let totalDrink = 0;
    let totalCig = 0;
    let totalExpenses = 0;
    let grandTotal = 0;

    allDates.forEach((date) => {
      const roomData = groupedRoomData[date] || {
        room: 0,
        shortRest: 0,
        total: 0,
      };
      const drink =
        filteredSalesData.find((d) => d.date === date)?.drinkSales || 0;
      const cig =
        filteredSalesData.find((d) => d.date === date)?.cigarette || 0;

      const dailyExpenses = getExpensesByDate(date);
      const dailyExpenseTotal = dailyExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0),
        0
      );

      const gross = roomData.room + roomData.shortRest + drink + cig;
      const net = gross - dailyExpenseTotal;

      totalRoom += roomData.room;
      totalShortRest += roomData.shortRest;
      totalDrink += drink;
      totalCig += cig;
      totalExpenses += dailyExpenseTotal;
      grandTotal += net;
    });

    return {
      room: totalRoom,
      shortRest: totalShortRest,
      drink: totalDrink,
      cig: totalCig,
      expenses: totalExpenses,
      total: grandTotal,
    };
  }, [filteredSalesData, groupedRoomData, expenses]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(n);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ✅ Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Daily Sales Report</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your daily performance
            </p>
          </div>
        </div>

        {/* ✅ Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setFilterType("today")}
            className={`px-3 py-2 rounded-md text-sm border ${
              filterType === "today"
                ? "bg-primary text-white"
                : "bg-card text-foreground"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilterType("yesterday")}
            className={`px-3 py-2 rounded-md text-sm border ${
              filterType === "yesterday"
                ? "bg-primary text-white"
                : "bg-card text-foreground"
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setFilterType("weekly")}
            className={`px-3 py-2 rounded-md text-sm border ${
              filterType === "weekly"
                ? "bg-primary text-white"
                : "bg-card text-foreground"
            }`}
          >
            This Week
          </button>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setFilterType("monthly");
              }}
              className="border rounded-md p-2 text-sm bg-card"
            />
            {selectedMonth && (
              <button
                onClick={() => {
                  setSelectedMonth("");
                  setFilterType("all");
                }}
                className="text-xs text-muted-foreground underline"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setFilterType("all");
              setSelectedMonth("");
            }}
            className={`px-3 py-2 rounded-md text-sm border ${
              filterType === "all"
                ? "bg-primary text-white"
                : "bg-card text-foreground"
            }`}
          >
            All
          </button>
        </div>

        {/* ✅ Summary Cards (Improved Design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ">
          {[
            { label: "Room Sales", value: totals.room },
            { label: "Short Rest", value: totals.shortRest },
            { label: "Drink Sales", value: totals.drink },
            { label: "Cigarette", value: totals.cig },
            { label: "Total Expenses", value: totals.expenses },
            { label: "Net Total", value: totals.total },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-semibold mt-1 tracking-tight">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Sales Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Sales Records</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider  ">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                    Room Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                    Short Rest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                    Drink Sales
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                    Cigarette
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                    Net Total
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {Array.from(
                  new Set([
                    ...Object.keys(groupedRoomData),
                    ...filteredSalesData.map((d) => d.date),
                  ])
                )
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .map((date) => {
                    const roomData = groupedRoomData[date] || {
                      room: 0,
                      shortRest: 0,
                      total: 0,
                    };
                    const drink =
                      filteredSalesData.find((d) => d.date === date)
                        ?.drinkSales || 0;
                    const cig =
                      filteredSalesData.find((d) => d.date === date)
                        ?.cigarette || 0;

                    const dailyExpenses = getExpensesByDate(date);
                    const totalExpenses = dailyExpenses.reduce(
                      (sum, exp) => sum + (exp.amount || 0),
                      0
                    );

                    const grossTotal =
                      roomData.room + roomData.shortRest + drink + cig;
                    const netTotal = grossTotal - totalExpenses;

                    const isExpanded = expandedDate === date;

                    return (
                      <React.Fragment key={date}>
                        <tr className="hover:bg-muted/50 transition">
                          <td className="px-6 py-4 text-sm">
                            {formatDate(date)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {formatCurrency(roomData.room)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {formatCurrency(roomData.shortRest)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {formatCurrency(drink)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {formatCurrency(cig)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold">
                            {formatCurrency(netTotal)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                setExpandedDate(isExpanded ? null : date)
                              }
                              className="text-primary text-sm flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  Hide <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  Show <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* ✅ Expanded Row for Expenses */}
                        {isExpanded && (
                          <tr className="bg-muted/20">
                            <td colSpan={7} className="p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-lg">
                                  Expenses for {formatDate(date)}
                                </h4>

                                {(() => {
                                  // ✅ Group expenses by category
                                  const groupedByCategory: Record<
                                    string,
                                    number
                                  > = {};
                                  dailyExpenses.forEach((exp: any) => {
                                    if (!groupedByCategory[exp.category])
                                      groupedByCategory[exp.category] = 0;
                                    groupedByCategory[exp.category] +=
                                      exp.amount || 0;
                                  });

                                  const groupedExpenses =
                                    Object.entries(groupedByCategory);

                                  return groupedExpenses.length > 0 ? (
                                    <ul className="space-y-1">
                                      {groupedExpenses.map(
                                        ([category, total]) => (
                                          <li
                                            key={category}
                                            className="flex justify-between border-b border-border py-1"
                                          >
                                            <span className="text-sm">
                                              {category}
                                            </span>
                                            <span className="text-sm font-medium">
                                              {formatCurrency(total)}
                                            </span>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="text-muted-foreground text-sm">
                                      No expenses added for this date.
                                    </p>
                                  );
                                })()}

                                {/* ✅ Show total expenses and net profit */}
                                <div className="flex justify-between border-border pt-2 font-semibold">
                                  <span>Total Expenses:</span>
                                  <span>{formatCurrency(totalExpenses)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-semibold">
                                  <span>Net Profit:</span>
                                  <span>{formatCurrency(netTotal)}</span>
                                </div>

                                {/* ✅ Add Expense Form */}
                                <ExpenseForm selectedDate={date} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
