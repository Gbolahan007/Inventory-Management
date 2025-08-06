/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

// Import the TopSellingProduct type
import type { TopSellingProduct } from "../(dashboard)/TopSellingItems";

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Header component for better organization
const DashboardHeader = () => {
  const currentDate = new Date();

  return (
    <div className="hidden sm:block">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            <span className="hidden sm:inline">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="sm:hidden">
              {currentDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const { user, userRole, loading, hasPermission, isInitialized } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Memoize date calculations to prevent unnecessary re-renders
  const { start, end } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  // Fetch data using hooks
  const { salesData } = useSales(start, end);
  const { totalInventory } = useTotalInventory();
  const { monthlySales } = useAllSales();
  const { topSellingProducts: rawTopSellingProducts } = useTopSellingProducts();
  const { salesProfit } = useTodaysProfit(start, end);

  // Transform top selling products data to match expected type
  const topSellingProducts: TopSellingProduct[] | undefined = useMemo(() => {
    if (!rawTopSellingProducts) return undefined;

    return rawTopSellingProducts.map((item: any) => {
      // Extract product name from the products array or use fallback
      const productName =
        Array.isArray(item.products) && item.products.length > 0
          ? item.products[0].name
          : item.products?.name || `Product ${item.product_id}`;

      return {
        id: item.id || item.product_id,
        product_id: String(item.product_id),
        name: productName,
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.total_price) || 0,
      };
    });
  }, [rawTopSellingProducts]);

  // Fixed auth effect - only redirect when we have complete auth info
  useEffect(() => {
    if (loading || !isInitialized) {
      return;
    }

    if (!user) {
      console.log("No user found, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    if (userRole === "salesrep") {
      console.log("Salesrep detected, redirecting to sales dashboard");
      setIsRedirecting(true);
      router.push("/dashboard/sales");
      return;
    }

    if (userRole !== "admin" && !hasPermission("admin")) {
      console.log("Not admin, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If we get here, user is authenticated and has proper permissions
    setIsRedirecting(false);
    console.log("Dashboard access granted for admin user");
  }, [loading, isInitialized, user, userRole, router, hasPermission]);

  // Show loading state while checking auth
  if (loading || !isInitialized) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // Show loading state while redirecting
  if (isRedirecting) {
    return <LoadingSpinner message="Redirecting..." />;
  }

  // Final safety check - don't render if no user or wrong permissions
  if (!user || (userRole !== "admin" && !hasPermission("admin"))) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
            {/* Header */}
            <DashboardHeader />

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
