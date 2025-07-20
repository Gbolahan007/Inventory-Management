"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Calculator,
  PieChart as PieChartIcon,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

// Mock data using your hooks
const useTodaysProfit = () => ({
  profit: 2500,
  revenue: 12000,
  costs: 9500,
  margin: 20.8,
  growth: 15.2,
});

const monthlyProfitData = [
  { month: "Jan", revenue: 95000, costs: 76000, profit: 19000, margin: 20.0 },
  { month: "Feb", revenue: 105000, costs: 82000, profit: 23000, margin: 21.9 },
  { month: "Mar", revenue: 125000, costs: 98000, profit: 27000, margin: 21.6 },
  { month: "Apr", revenue: 110000, costs: 85000, profit: 25000, margin: 22.7 },
  { month: "May", revenue: 130000, costs: 100000, profit: 30000, margin: 23.1 },
  { month: "Jun", revenue: 140000, costs: 105000, profit: 35000, margin: 25.0 },
];

const productProfitability = [
  {
    name: "Laptop Pro",
    revenue: 45000,
    cost: 36000,
    profit: 9000,
    margin: 20.0,
  },
  {
    name: "Monitor 4K",
    revenue: 24000,
    cost: 18000,
    profit: 6000,
    margin: 25.0,
  },
  {
    name: "Headphones",
    revenue: 15000,
    cost: 9000,
    profit: 6000,
    margin: 40.0,
  },
  { name: "Keyboard", revenue: 14000, cost: 10500, profit: 3500, margin: 25.0 },
  { name: "Mouse", revenue: 8750, cost: 5250, profit: 3500, margin: 40.0 },
];

const categoryProfitability = [
  { name: "Electronics", profit: 18000, margin: 22.5, color: "#3B82F6" },
  { name: "Accessories", profit: 12000, margin: 35.0, color: "#10B981" },
  { name: "Software", profit: 8000, margin: 40.0, color: "#F59E0B" },
  { name: "Books", profit: 2000, margin: 15.0, color: "#EF4444" },
];

const weeklyProfitTrend = [
  { week: "W1", profit: 5200, target: 5000 },
  { week: "W2", profit: 4800, target: 5000 },
  { week: "W3", profit: 6100, target: 5000 },
  { week: "W4", profit: 5900, target: 5000 },
  { week: "W5", profit: 6500, target: 5000 },
  { week: "W6", profit: 7200, target: 5000 },
];

const expenseBreakdown = [
  {
    category: "Cost of Goods",
    amount: 65000,
    percentage: 52,
    color: "#EF4444",
  },
  {
    category: "Operating Expenses",
    amount: 25000,
    percentage: 20,
    color: "#F59E0B",
  },
  { category: "Marketing", amount: 15000, percentage: 12, color: "#10B981" },
  { category: "Salaries", amount: 20000, percentage: 16, color: "#3B82F6" },
];

const dailyProfitTrend = [
  { day: "Mon", profit: 850, target: 800 },
  { day: "Tue", profit: 920, target: 800 },
  { day: "Wed", profit: 780, target: 800 },
  { day: "Thu", profit: 1100, target: 800 },
  { day: "Fri", profit: 1250, target: 800 },
  { day: "Sat", profit: 1380, target: 800 },
  { day: "Sun", profit: 1020, target: 800 },
];

// Profit Metric Card Component
interface ProfitMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  target?: number;
}

const ProfitMetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
  suffix = "",
  color = "blue",
  target,
}: ProfitMetricCardProps) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}
          {value}
          {suffix}
        </p>
        {target && (
          <p className="text-sm text-gray-500 mt-1">
            Target: {prefix}
            {target}
            {suffix}
          </p>
        )}
      </div>
      <div
        className={`h-12 w-12 bg-${color}-50 rounded-full flex items-center justify-center`}
      >
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
    {trend !== undefined && (
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
    )}
  </div>
);

export default function ProfitabilityReportPage() {
  const todaysProfit = useTodaysProfit();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedView, setSelectedView] = useState("overview");

  const totalMonthlyProfit = monthlyProfitData.reduce(
    (sum, month) => sum + month.profit,
    0
  );
  const averageMargin =
    monthlyProfitData.reduce((sum, month) => sum + month.margin, 0) /
    monthlyProfitData.length;

  // Calculate profit alerts
  const lowMarginProducts = productProfitability.filter(
    (product) => product.margin < 20
  );
  const highPerformingProducts = productProfitability.filter(
    (product) => product.margin > 30
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Profitability Analysis
        </h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="products">Product Analysis</option>
            <option value="categories">Category Analysis</option>
            <option value="expenses">Expense Analysis</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Profit Alerts */}
      {lowMarginProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Low Margin Alert
            </h3>
          </div>
          <p className="mt-1 text-sm text-red-700">
            {lowMarginProducts.length} products have margins below 20%:{" "}
            {lowMarginProducts.map((p) => p.name).join(", ")}
          </p>
        </div>
      )}

      {/* Key Profit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProfitMetricCard
          title="Today's Profit"
          value={todaysProfit.profit.toLocaleString()}
          icon={DollarSign}
          trend={todaysProfit.growth}
          prefix="$"
          color="green"
          target={2000}
        />
        <ProfitMetricCard
          title="Profit Margin"
          value={todaysProfit.margin.toFixed(1)}
          icon={Percent}
          trend={5.2}
          suffix="%"
          color="blue"
          target={25}
        />
        <ProfitMetricCard
          title="Monthly Profit"
          value={totalMonthlyProfit.toLocaleString()}
          icon={TrendingUp}
          trend={12.8}
          prefix="$"
          color="purple"
        />
        <ProfitMetricCard
          title="Average Margin"
          value={averageMargin.toFixed(1)}
          icon={Target}
          trend={8.5}
          suffix="%"
          color="orange"
        />
      </div>

      {/* Conditional Content Based on Selected View */}
      {selectedView === "overview" && (
        <>
          {/* Profit Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Profit Trend */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Profit Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="profit"
                    fill="#10B981"
                    name="Profit"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Margin %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue vs Costs */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue vs Costs
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="costs"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Costs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Profit Trend */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Profit vs Target
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProfitTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Actual Profit"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {selectedView === "products" && (
        <>
          {/* Product Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Profitability */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Profitability
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productProfitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="profit" fill="#10B981" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Product Margins */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Margins
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productProfitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="margin" fill="#3B82F6" name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Performance Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productProfitability.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.margin > 30
                              ? "bg-green-100 text-green-800"
                              : product.margin > 20
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedView === "categories" && (
        <>
          {/* Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Profit Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Profit Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryProfitability}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="profit"
                  >
                    {categoryProfitability.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Margins */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Margins
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryProfitability}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="margin" fill="#8B5CF6" name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {selectedView === "expenses" && (
        <>
          {/* Expense Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expense Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${category} ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Expense Amounts */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expense Amounts
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#DC2626" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">High Performers</h4>
            {highPerformingProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <span className="text-sm font-medium text-green-800">
                  {product.name}
                </span>
                <span className="text-sm text-green-600">
                  {product.margin.toFixed(1)}% margin
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Needs Attention</h4>
            {lowMarginProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <span className="text-sm font-medium text-red-800">
                  {product.name}
                </span>
                <span className="text-sm text-red-600">
                  {product.margin.toFixed(1)}% margin
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
