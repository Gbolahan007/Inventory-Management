/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Auth
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";

// Data hooks ---------------------------------------------------------------
import { useStats } from "@/app/components/queryhooks/useStats";
import { useRecentSales } from "@/app/components/queryhooks/useRecentSales";
import { useSaleItemsWithCategories } from "@/app/components/queryhooks/useSaleItemsWithCategories";
import { useTopSellingProducts } from "@/app/components/queryhooks/useTopSellingProducts";
import { getItemStats } from "@/app/components/utils/getItemStats";

// Utils -------------------------------------------------------------------
import { getTopSellingCategories } from "./utils/categoryUtils";
import {
  groupProfitByDate,
  groupSalesByDate,
} from "./utils/groupedSalesByDate";

// -------------------------------------------------------------------------
// Types (using your actual type definitions)
// -------------------------------------------------------------------------
export type Product = {
  id: string;
  name: string;
  category?: string;
  cost_price: number;
  selling_price: number;
  profit_margin?: number;
  current_stock: number;
  minimum_stock?: number;
  low_stock?: boolean;
  profit?: number;
  is_active?: boolean;
};

export type Sale = {
  id: string;
  sale_number?: string;
  total_amount: number;
  payment_method?: string;
  sale_date: string;
  created_at?: string;
  quantity_sold?: number;
  total_revenue?: number;
  profits?: number;
  total_cost?: number;
  inventory?: {
    id: string;
    subcategories: {
      name: string;
      categories: {
        name: string;
      };
    };
  };
};
export type SaleItem = {
  id?: string;
  sale_id?: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  products?: Partial<Product>;
};
export type Stats = {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
};

// Extended stats interface for dashboard features
interface ExtendedStats extends Stats {
  revenueGrowth?: number;
  salesGrowth?: number;
  productGrowth?: number;
  profitGrowth?: number;
  inventoryTurnover?: number;
  averageOrderValue?: number;
  profitMargin?: number;
}

interface ItemStat {
  name: string;
  quantity: number;
  revenue: number;
}

interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

interface RechartsPayloadItem {
  payload: ItemStat;
  value: number;
  dataKey: string;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------
const CATEGORY_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-4))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-5))",
];

const EMPTY_EXTENDED_STATS: ExtendedStats = {
  totalRevenue: 0,
  totalSales: 0,
  totalProducts: 0,
  lowStockItems: 0,
  revenueGrowth: 0,
  salesGrowth: 0,
  productGrowth: 0,
  profitGrowth: 0,
  inventoryTurnover: 0,
  averageOrderValue: 0,
  profitMargin: 0,
};

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
const fmtCurrency = (n: number | undefined | null) =>
  `₦${(n ?? 0).toLocaleString()}`;

function hasExtendedStatsProperties(stats: Stats): stats is ExtendedStats {
  return typeof stats === "object" && stats !== null;
}

function createExtendedStats(stats: Stats): ExtendedStats {
  return {
    ...stats,
    revenueGrowth: 0,
    salesGrowth: 0,
    productGrowth: 0,
    profitGrowth: 0,
    inventoryTurnover: 0,
    averageOrderValue:
      stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0,
    profitMargin: 0,
  };
}

// -------------------------------------------------------------------------
// Metric Card
// -------------------------------------------------------------------------
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  prefix?: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
}: MetricCardProps) {
  const up = trend > 0;
  return (
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {prefix}
            {value}
          </p>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {up ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        )}
        <span
          className={`text-sm font-medium ${
            up
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {Math.abs(trend).toFixed(1)}%
        </span>
        <span className="text-sm text-muted-foreground ml-1">
          vs last period
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Custom tooltip for Top Products bar
// -------------------------------------------------------------------------
export type ProductMetric = "quantity" | "revenue";

interface ItemTooltipProps {
  active?: boolean;
  payload?: RechartsPayloadItem[];
  label?: string;
  metric: ProductMetric;
}

function ItemTooltip({ active, payload, label, metric }: ItemTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as ItemStat;
  return (
    <div className="bg-popover p-2 rounded border border-border text-xs shadow-md">
      <div className="font-semibold mb-1 text-popover-foreground">{label}</div>
      {metric === "quantity" ? (
        <>
          <div className="text-popover-foreground">
            Units: {p.quantity.toLocaleString()}
          </div>
          <div className="text-popover-foreground">
            Revenue: {fmtCurrency(p.revenue)}
          </div>
        </>
      ) : (
        <>
          <div className="text-popover-foreground">
            Revenue: {fmtCurrency(p.revenue)}
          </div>
          <div className="text-popover-foreground">
            Units: {p.quantity.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------
export default function ReportsDashboard(): React.JSX.Element {
  // ✅ Auth state and routing with enhanced error handling
  const {
    user,
    userRole,
    loading: authLoading,
    hasPermission,
    error: authError,
    isInitialized,
    refreshAuth,
  } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ✅ Enhanced auth protection effect
  useEffect(() => {
    console.log("🔍 Reports Auth Check:", {
      authLoading,
      isInitialized,
      user: !!user,
      userRole,
      hasAdminPermission: hasPermission("admin"),
      authError,
    });

    // Don't do anything while still loading auth state
    if (authLoading || !isInitialized) {
      return;
    }

    // Handle auth errors - try to refresh once
    if (authError) {
      console.error("Auth error in reports:", authError);
      if (authError.includes("timeout") || authError.includes("expired")) {
        refreshAuth();
        return;
      }
    }

    // If no user is authenticated, redirect to login
    if (!user) {
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If user is authenticated but role is salesrep, redirect to sales dashboard
    if (userRole === "salesrep") {
      setIsRedirecting(true);
      router.push("/dashboard/sales");
      return;
    }

    // If user doesn't have admin permission (and is not a salesrep), redirect to login
    if (!hasPermission("admin") && userRole !== null) {
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If we get here, user has proper access
    setIsRedirecting(false);
  }, [
    authLoading,
    isInitialized,
    user,
    userRole,
    router,
    hasPermission,
    authError,
    refreshAuth,
  ]);

  // Data -------------------------------------------------------------------
  const { stats, isLoading: statsLoading } = useStats();
  const { recentSales = [] as Sale[], isLoading: salesLoading } =
    useRecentSales();
  const { saleItemsWithCategories = [] } = useSaleItemsWithCategories();
  const { topSellingProducts: salesItems = [] } = useTopSellingProducts();
  const profitDate = salesItems.map((item) => ({
    date: item.created_at,
    profit: item.profit_amount,
  }));

  // Local UI state ----------------------------------------------------------
  const [productMetric, setProductMetric] = useState<ProductMetric>("quantity");

  // Category aggregates (Revenue basis) ------------------------------------
  const topCategories = useMemo(() => {
    if (!saleItemsWithCategories || !Array.isArray(saleItemsWithCategories))
      return [];
    return getTopSellingCategories(saleItemsWithCategories, "revenue");
  }, [saleItemsWithCategories]);

  const categoryData: CategoryDatum[] = useMemo(
    () =>
      topCategories.map((cat, i) => ({
        name: cat.category,
        value: cat.totalRevenue,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })),
    [topCategories]
  );

  // Revenue Trend data (group sales per day) -------------------------------
  const chartData = useMemo(() => {
    if (!recentSales || !Array.isArray(recentSales)) return [];

    const grouped = groupSalesByDate(recentSales);
    return Object.entries(grouped)
      .map(([date, total_amount]) => ({ sale_date: date, total_amount }))
      .sort((a, b) => a.sale_date.localeCompare(b.sale_date));
  }, [recentSales]);

  // Profit Trend data (group profit per day) -------------------------------
  const profitChartData = useMemo(() => {
    const profitBydate = groupProfitByDate(profitDate);

    return Object.entries(profitBydate)
      .map(([date, profit]) => ({
        date,
        profit: Number(profit) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [profitDate]);

  // Item stats (units + revenue) -------------------------------------------
  const rawItemStats: ItemStat[] = useMemo(() => {
    if (!saleItemsWithCategories) return [];
    return getItemStats(saleItemsWithCategories);
  }, [saleItemsWithCategories]);

  // Sort depending on selected metric so chart highlights correct order
  const itemStats: ItemStat[] = useMemo(() => {
    const arr = rawItemStats.map((r) => ({
      name: r.name ?? "Unknown",
      quantity: Number(r.quantity) || 0,
      revenue: Number(r.revenue) || 0,
    }));
    return arr.sort((a, b) =>
      productMetric === "quantity"
        ? b.quantity - a.quantity
        : b.revenue - a.revenue
    );
  }, [rawItemStats, productMetric]);

  // ✅ Show loading state while checking auth or redirecting
  if (authLoading || !isInitialized || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">
            {authLoading || !isInitialized
              ? "Loading dashboard..."
              : "Redirecting..."}
          </p>
          {authError && (
            <p className="text-xs text-red-500 max-w-md text-center">
              {authError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading dashboard data -------------------------------------------------
  if (statsLoading || salesLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  // Safe stats --------------------------------------------------------------
  const s: ExtendedStats = stats
    ? hasExtendedStatsProperties(stats)
      ? createExtendedStats(stats)
      : createExtendedStats(stats)
    : EMPTY_EXTENDED_STATS;

  const totals = salesItems.reduce(
    (acc, item) => {
      acc.totalPrice += item.total_price;
      acc.totalCost += item.total_cost;
      return acc;
    },
    { totalPrice: 0, totalCost: 0 }
  );

  const netProfit = totals.totalPrice - totals.totalCost;
  const productMetricKey =
    productMetric === "quantity" ? "quantity" : "revenue";

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={s.totalRevenue?.toLocaleString() ?? "N/A"}
          icon={DollarSign}
          trend={s.revenueGrowth ?? 0}
          prefix="₦"
        />
        <MetricCard
          title="Total Sales"
          value={s.totalSales?.toLocaleString() ?? "N/A"}
          icon={ShoppingCart}
          trend={s.salesGrowth ?? 0}
        />
        <MetricCard
          title="Total Products"
          value={s.totalProducts ?? "N/A"}
          icon={Package}
          trend={s.productGrowth ?? 0}
        />
        <MetricCard
          title="Total Profit"
          value={netProfit.toLocaleString()}
          icon={TrendingUp}
          trend={s.profitGrowth ?? 0}
          prefix="₦"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="sale_date"
                tickFormatter={(v: string) => new Date(v).toLocaleDateString()}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                formatter={(v: number) => [fmtCurrency(v), "Revenue"]}
                labelFormatter={(l: string) => new Date(l).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="total_amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(data: any) =>
                  `${data.name} ${((data.percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [fmtCurrency(v), "Revenue"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products + Profit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Top Selling Products
            </h3>
            <select
              value={productMetric}
              onChange={(e) =>
                setProductMetric(e.target.value as ProductMetric)
              }
              className="text-sm border border-input rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="quantity">Units</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemStats}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip content={<ItemTooltip metric={productMetric} />} />
              <Bar dataKey={productMetricKey} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Analysis */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Profit Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => new Date(v).toLocaleDateString()}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                formatter={(v: number) => [fmtCurrency(v), "Profit"]}
                labelFormatter={(l: string) => new Date(l).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar
                dataKey="profit"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
