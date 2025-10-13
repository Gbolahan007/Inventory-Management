"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useStats } from "@/app/components/queryhooks/useStats";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useSaleItemsWithCategories } from "@/app/components/queryhooks/useSaleItemsWithCategories";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";
import {
  groupProfitByDate,
  groupSalesByDate,
} from "./utils/groupedSalesByDate";
import { getItemStats } from "@/app/components/utils/getItemStats";
import { getTopSellingCategories } from "./utils/categoryUtils";
import ReportMetricCardSection from "./ReportMetricCardSection";
import ReportChartSection from "./ReportChartSection";
import ProductAndProfitSection from "./ProductAndProfitSection";
import DailySalesReports from "./DailySalesReports";
import CashAndTransferReport from "./CashAndTransferReport"; // ✅ new component
import { BarChart3, CalendarDays, CreditCard, Loader2 } from "lucide-react";

export type ExtendedStats = {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
  revenueGrowth?: number;
  salesGrowth?: number;
  productGrowth?: number;
  profitGrowth?: number;
  inventoryTurnover?: number;
  averageOrderValue?: number;
  profitMargin?: number;
};

const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ReportsDashboard() {
  const { loading } = useAuth();
  const { stats } = useStats();
  const { recentSales = [] } = useRecentSales();
  const { saleItemsWithCategories = [] } = useSaleItemsWithCategories();
  const { topSellingProducts = [] } = useTopSellingProducts();
  const [activeTab, setActiveTab] = useState<
    "overview" | "dailyReport" | "cashTransfer"
  >("overview");

  const profitDate = useMemo(
    () =>
      topSellingProducts.map((item) => ({
        date: item.created_at,
        profit: item.profit_amount,
      })),
    [topSellingProducts]
  );

  const s = useMemo(
    () => ({
      totalSales: stats?.totalSales ?? 0,
      totalRevenue: stats?.totalRevenue ?? 0,
      totalProducts: stats?.totalProducts ?? 0,
      lowStockItems: stats?.lowStockItems ?? 0,
      averageOrderValue:
        stats?.totalSales && stats.totalSales > 0
          ? stats.totalRevenue / stats.totalSales
          : 0,
    }),
    [stats]
  );

  const totals = useMemo(() => {
    return topSellingProducts.reduce(
      (acc, item) => {
        acc.totalPrice += item.total_price;
        acc.totalCost += item.total_cost;
        return acc;
      },
      { totalPrice: 0, totalCost: 0 }
    );
  }, [topSellingProducts]);

  const netProfit = totals.totalPrice - totals.totalCost;

  const chartData = useMemo(() => {
    const grouped = groupSalesByDate(recentSales);
    return Object.entries(grouped).map(([date, total_amount]) => ({
      sale_date: date,
      total_amount,
    }));
  }, [recentSales]);

  const profitChartData = useMemo(() => {
    const grouped = groupProfitByDate(profitDate);
    return Object.entries(grouped).map(([date, profit]) => ({
      date,
      profit: Number(profit) || 0,
    }));
  }, [profitDate]);

  const categoryData = useMemo(() => {
    const topCategories = getTopSellingCategories(
      saleItemsWithCategories,
      "revenue"
    );
    return topCategories.map((cat, i) => ({
      name: cat.category,
      value: cat.totalRevenue,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [saleItemsWithCategories]);

  const itemStats = useMemo(
    () => getItemStats(saleItemsWithCategories),
    [saleItemsWithCategories]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium">
        <Loader2 className="animate-spin h-5 w-5 mr-3 text-primary" />
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Tabs Navigation */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-x-hidden">
        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary bg-muted/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("dailyReport")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "dailyReport"
                ? "text-primary border-b-2 border-primary bg-muted/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            Daily Report
          </button>

          {/* ✅ NEW TAB */}
          <button
            onClick={() => setActiveTab("cashTransfer")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
              activeTab === "cashTransfer"
                ? "text-primary border-b-2 border-primary bg-muted/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Cash & Transfer Report
          </button>
        </div>
      </div>

      {/* Conditionally Render Tabs */}
      {activeTab === "overview" ? (
        <>
          <ReportMetricCardSection stats={s} netProfit={netProfit} />
          <ReportChartSection
            chartData={chartData}
            categoryData={categoryData}
          />
          <ProductAndProfitSection
            itemStats={itemStats}
            profitChartData={profitChartData}
          />
        </>
      ) : activeTab === "dailyReport" ? (
        <DailySalesReports />
      ) : (
        <CashAndTransferReport />
      )}
    </div>
  );
}
