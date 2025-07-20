"use client";

import type React from "react";

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
import { useRecentSales } from "../components/queryhooks/useRecentSales";
import { useSaleItemsWithCategories } from "../components/queryhooks/useSaleItemsWithCategories";
import { useStats } from "../components/queryhooks/useStats";
import { useTopSellingProducts } from "../components/queryhooks/useTopSellingProducts";

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  prefix?: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
}: MetricCardProps) => (
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
      {trend > 0 ? (
        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
      )}
      <span
        className={`text-sm font-medium ${
          trend > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {Math.abs(trend)}%
      </span>
      <span className="text-sm text-gray-500 ml-1">vs last period</span>
    </div>
  </div>
);

export function getTopSellingCategories(
  saleItemsData: SaleItemWithProduct[],
  sortBy: "quantity" | "revenue" | "profit" | "transactions" = "quantity"
): CategoryAggregate[] {
  if (!saleItemsData || !Array.isArray(saleItemsData)) {
    return [];
  }

  const categoryStats: Record<string, any> = {};

  saleItemsData.forEach((item) => {
    const category = item.products?.category || "Unknown";

    if (!categoryStats[category]) {
      categoryStats[category] = {
        category,
        totalQuantity: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        transactionCount: 0,
        products: new Set<string>(),
      };
    }
    console.log(categoryStats);
    categoryStats[category].totalQuantity += item.quantity;
    categoryStats[category].totalRevenue += item.total_price;
    categoryStats[category].totalCost += item.total_cost;
    categoryStats[category].totalProfit += item.profit_amount;
    categoryStats[category].transactionCount += 1;
    categoryStats[category].products.add(item.products?.name);
  });

  const processedStats = Object.values(categoryStats).map((stat: any) => ({
    ...stat,
    uniqueProductsCount: stat.products.size,
    products: undefined,
  }));

  switch (sortBy) {
    case "quantity":
      return processedStats.sort((a, b) => b.totalQuantity - a.totalQuantity);
    case "revenue":
      return processedStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    case "profit":
      return processedStats.sort((a, b) => b.totalProfit - a.totalProfit);
    case "transactions":
      return processedStats.sort(
        (a, b) => b.transactionCount - a.transactionCount
      );
    default:
      return processedStats;
  }
}

export default function ReportsDashboard() {
  const { stats, isLoading: statsLoading } = useStats();
  const { recentSales = [], isLoading: salesLoading } = useRecentSales();
  const { topSellingProducts: salesItems = [] } = useTopSellingProducts();
  const { saleItemsWithCategories = [] } = useSaleItemsWithCategories();

  const topCategories = getTopSellingCategories(
    saleItemsWithCategories,
    "revenue"
  );

  // Create dynamic category data for Pie Chart
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

  const categoryData = topCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.totalRevenue,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  if (statsLoading || salesLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard data...
      </div>
    );
  }

  const safeStats = stats || ({} as Stats);
  const safeRecentSales = recentSales || [];
  const safeSalesItems = salesItems || [];

  const totalUnitPrice = safeSalesItems.reduce(
    (cur, item) => cur + (item.total_cost || 0),
    0
  );

  const netprofit = (safeStats?.totalRevenue || 0) - totalUnitPrice;

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        <MetricCard
          title="Total Revenue"
          value={safeStats.totalRevenue?.toLocaleString() || "N/A"}
          icon={DollarSign}
          trend={safeStats.revenueGrowth || 0}
          prefix="₦"
        />
        <MetricCard
          title="Total Sales"
          value={safeStats.totalSales?.toLocaleString() || "N/A"}
          icon={ShoppingCart}
          trend={safeStats.salesGrowth || 0}
        />
        <MetricCard
          title="Total Products"
          value={safeStats.totalProducts || "N/A"}
          icon={Package}
          trend={safeStats.productGrowth || 0}
        />
        <MetricCard
          title="Net Profit"
          value={netprofit?.toLocaleString() || "N/A"}
          icon={TrendingUp}
          trend={safeStats.profitGrowth || 0}
          prefix="₦"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeRecentSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="sale_date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  `₦${value.toLocaleString()}`,
                  "Revenue",
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
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
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `₦${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safeSalesItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString(),
                  "Quantity Sold",
                ]}
              />
              <Bar dataKey="total_quantity" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Sales Activity
          </h3>
          <div className="space-y-4">
            {safeRecentSales.slice(0, 5).map((sale, index) => (
              <div
                key={sale.id || index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sale #{sale.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(sale.sale_date).toLocaleDateString()} •{" "}
                    {sale.payment_method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₦{sale.total_amount?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {safeStats.inventoryTurnover || "N/A"}
            </p>
            <p className="text-sm text-gray-600">Inventory Turnover</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {safeStats.averageOrderValue
                ? `₦${safeStats.averageOrderValue.toLocaleString()}`
                : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Average Order Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {safeStats.profitMargin
                ? `${safeStats.profitMargin.toFixed(1)}%`
                : "N/A"}
            </p>
            <p className="text-sm text-gray-600">Profit Margin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
