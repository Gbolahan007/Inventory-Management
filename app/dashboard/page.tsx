"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LowStockAlert } from "../(dashboard)/LowStockAlert";
import { MetricsGrid } from "../(dashboard)/MetricsGrid";
import { QuickActions } from "../(dashboard)/QuickActions";
import { RecentSales } from "../(dashboard)/RecentSales";
import { SalesChart } from "../(dashboard)/SalesChart";
import { TopSellingItems } from "../(dashboard)/TopSellingItems";
import { useAllSales } from "../components/queryhooks/useAllSales";
import { useSales } from "../components/queryhooks/useSales";
import { useTodaysProfit } from "../components/queryhooks/useTodaysProfit";
import { useTopSellingProducts } from "../components/queryhooks/useTopSellingProducts";
import { useTotalInventory } from "../components/queryhooks/useTotalInventory";
import { useAuth } from "../(auth)/hooks/useAuth";

export default function Dashboard() {
  const router = useRouter();
  const { user, userRole, loading, hasPermission } = useAuth();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { salesData } = useSales(start, end);
  const { totalInventory } = useTotalInventory();
  const { monthlySales } = useAllSales();
  const { topSellingProducts } = useTopSellingProducts();
  const { salesProfit } = useTodaysProfit(start, end);

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push("/login");
        return;
      }

      // If salesrep, redirect to their specific dashboard
      if (userRole === "salesrep") {
        router.push("/dashboard/sales");
        return;
      }

      // If not admin, redirect to unauthorized page or login
      if (!hasPermission("admin")) {
        router.push("/login");
        return;
      }
    }
  }, [loading, user, userRole, router, hasPermission]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting
  if (!user || !hasPermission("admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Header */}
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

            {/* Metrics */}
            <MetricsGrid
              salesData={salesData ?? []}
              salesProfit={salesProfit}
              totalInventory={totalInventory}
            />

            {/* Sales Chart */}
            <SalesChart monthlySales={monthlySales} />

            {/* Bottom Widgets */}
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
