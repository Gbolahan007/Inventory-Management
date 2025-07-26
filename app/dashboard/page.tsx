"use client";

import { Calendar } from "lucide-react";

import { useSales } from "../components/queryhooks/useSales";
import { useAllSales } from "../components/queryhooks/useAllSales";
import { useTotalInventory } from "../components/queryhooks/useTotalInventory";
import { useTopSellingProducts } from "../components/queryhooks/useTopSellingProducts";
import { MetricsGrid } from "../(dashboard)/MetricsGrid";
import { TopSellingItems } from "../(dashboard)/TopSellingItems";
import { RecentSales } from "../(dashboard)/RecentSales";
import { LowStockAlert } from "../(dashboard)/LowStockAlert";
import { QuickActions } from "../(dashboard)/QuickActions";
import { SalesChart } from "../(dashboard)/SalesChart";
import { useTodaysProfit } from "../components/queryhooks/useTodaysProfit";

export default function Dashboard() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { salesData } = useSales(start, end);
  const { totalInventory } = useTotalInventory();
  const { monthlySales } = useAllSales();
  const { topSellingProducts } = useTopSellingProducts();
  const { salesProfit } = useTodaysProfit(start, end);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Desktop Header */}
            <div className="hidden sm:block">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Welcome back! Here&apos;s what&apos;s happening with your
                    store today.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    <span className="hidden sm:inline">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="sm:hidden">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <MetricsGrid
              salesData={salesData ?? []}
              salesProfit={salesProfit}
              totalInventory={totalInventory}
            />

            {/* Sales Overview Chart */}
            <SalesChart monthlySales={monthlySales} />

            {/* Bottom Section */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              <TopSellingItems topSellingProducts={topSellingProducts} />
              <RecentSales />
              <LowStockAlert />
            </div>

            {/* Mobile Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
