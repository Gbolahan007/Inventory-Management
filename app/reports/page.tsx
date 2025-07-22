"use client";

import React, { useMemo, useState } from "react";
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

// Data hooks ---------------------------------------------------------------
import { useRecentSales } from "../components/queryhooks/useRecentSales";
import { useSaleItemsWithCategories } from "../components/queryhooks/useSaleItemsWithCategories";
import { useStats } from "../components/queryhooks/useStats";

// Utils -------------------------------------------------------------------
import { getTopSellingCategories } from "./utils/categoryUtils"; // SaleItemWithProduct[] -> aggregates
import { groupSalesByDate } from "./utils/groupedSalesByDate"; // Sale[] -> {date: total}
import { getItemStats } from "../components/utils/getItemStats"; // SaleItems[] -> ItemStat[]

// -------------------------------------------------------------------------
// Types (minimal fallbacks – prefer importing shared types in production)
// -------------------------------------------------------------------------
interface Stats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  revenueGrowth: number;
  salesGrowth: number;
  productGrowth: number;
  profitGrowth: number;
  inventoryTurnover: number;
  averageOrderValue: number;
  profitMargin: number; // % (0–100)
}

interface Sale {
  id: number | string;
  total_amount: number;
  sale_date: string; // ISO
  payment_method?: string | null;
}

interface ItemStat {
  name: string; // product name
  quantity: number; // units sold
  revenue: number; // total revenue ₦
}

interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------
const CATEGORY_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#6366F1",
];

const EMPTY_STATS: Stats = {
  totalRevenue: 0,
  totalSales: 0,
  totalProducts: 0,
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}
            {value}
          </p>
        </div>
        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
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
            up ? "text-green-600" : "text-red-600"
          }`}
        >
          {Math.abs(trend).toFixed(1)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs last period</span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Custom tooltip for Top Products bar (shows Units + Revenue)
// -------------------------------------------------------------------------
export type ProductMetric = "quantity" | "revenue";

interface ItemTooltipProps {
  active?: boolean;
  payload?: any[]; // recharts payload
  label?: string;
  metric: ProductMetric;
}
function ItemTooltip({ active, payload, label, metric }: ItemTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as ItemStat;
  return (
    <div className="bg-white p-2 rounded border text-xs shadow">
      <div className="font-semibold mb-1">{label}</div>
      {metric === "quantity" ? (
        <>
          <div>Units: {p.quantity.toLocaleString()}</div>
          <div>Revenue: {fmtCurrency(p.revenue)}</div>
        </>
      ) : (
        <>
          <div>Revenue: {fmtCurrency(p.revenue)}</div>
          <div>Units: {p.quantity.toLocaleString()}</div>
        </>
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------------
export default function ReportsDashboard(): React.JSX.Element {
  // Data -------------------------------------------------------------------
  const { stats, isLoading: statsLoading } = useStats();
  const { recentSales = [], isLoading: salesLoading } = useRecentSales();
  const { saleItemsWithCategories = [] } = useSaleItemsWithCategories();

  // Local UI state ----------------------------------------------------------
  const [productMetric, setProductMetric] = useState<ProductMetric>("quantity");

  // Category aggregates (Revenue basis) ------------------------------------
  const topCategories = useMemo(
    () => getTopSellingCategories(saleItemsWithCategories, "revenue"),
    [saleItemsWithCategories]
  );
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
    const grouped = groupSalesByDate(recentSales as Sale[]); // {YYYY-MM-DD: total}
    return Object.entries(grouped)
      .map(([date, total_amount]) => ({ sale_date: date, total_amount }))
      .sort((a, b) => a.sale_date.localeCompare(b.sale_date));
  }, [recentSales]);

  // Item stats (units + revenue) -------------------------------------------
  const rawItemStats: ItemStat[] = useMemo(
    () => getItemStats(saleItemsWithCategories || []),
    [saleItemsWithCategories]
  );

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

  // Loading ----------------------------------------------------------------
  if (statsLoading || salesLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard data...
      </div>
    );
  }

  // Safe stats --------------------------------------------------------------
  const s: Stats = stats ?? EMPTY_STATS;
  // Approx net profit using profitMargin (if you prefer real calc, pass cost data)
  const netProfit = s.profitMargin
    ? (s.totalRevenue ?? 0) * (s.profitMargin / 100)
    : 0;

  // Choose dataKey for Top Products chart ----------------------------------
  const productMetricKey =
    productMetric === "quantity" ? "quantity" : "revenue";

  return (
    <div className="p-6 space-y-6">
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
          title="Net Profit"
          value={netProfit.toLocaleString()}
          icon={TrendingUp}
          trend={s.profitGrowth ?? 0}
          prefix="₦"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sale_date"
                tickFormatter={(v: string) => new Date(v).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(v: number) => [fmtCurrency(v), "Revenue"]}
                labelFormatter={(l: string) => new Date(l).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="total_amount"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [fmtCurrency(v), "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products + Recent Sales -------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Products
            </h3>
            {/* Metric selector: Units vs Revenue */}
            <select
              value={productMetric}
              onChange={(e) =>
                setProductMetric(e.target.value as ProductMetric)
              }
              className="text-sm border rounded px-2 py-1 bg-white focus:outline-none focus:ring"
            >
              <option value="quantity">Units</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itemStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ItemTooltip metric={productMetric} />} />
              <Bar dataKey={productMetricKey} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Sales Activity
          </h3>
          <div className="space-y-4">
            {(recentSales as Sale[]).slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sale #{sale.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(sale.sale_date).toLocaleDateString()} •{" "}
                    {sale.payment_method ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {fmtCurrency(sale.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats ------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {s.inventoryTurnover || "N/A"}
            </p>
            <p className="text-sm text-gray-600">Inventory Turnover</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {s.averageOrderValue ? fmtCurrency(s.averageOrderValue) : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Average Order Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {s.profitMargin ? `${s.profitMargin.toFixed(1)}%` : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Profit Margin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
