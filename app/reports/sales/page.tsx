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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Users,
  Target,
} from "lucide-react";

// Mock data using your hooks
const useSales = () => [
  { date: "2024-01-01", amount: 1200, quantity: 15, profit: 240 },
  { date: "2024-01-02", amount: 1500, quantity: 18, profit: 300 },
  { date: "2024-01-03", amount: 1100, quantity: 12, profit: 220 },
  { date: "2024-01-04", amount: 1800, quantity: 22, profit: 360 },
  { date: "2024-01-05", amount: 1350, quantity: 16, profit: 270 },
  { date: "2024-01-06", amount: 1600, quantity: 20, profit: 320 },
  { date: "2024-01-07", amount: 1450, quantity: 17, profit: 290 },
];

const useAllSales = () => [
  {
    id: 1,
    date: "2024-01-07",
    product: "Laptop Pro",
    customer: "John Doe",
    amount: 1500,
    status: "completed",
  },
  {
    id: 2,
    date: "2024-01-07",
    product: "Wireless Mouse",
    customer: "Jane Smith",
    amount: 50,
    status: "completed",
  },
  {
    id: 3,
    date: "2024-01-06",
    product: "Keyboard",
    customer: "Bob Johnson",
    amount: 100,
    status: "completed",
  },
  {
    id: 4,
    date: "2024-01-06",
    product: "Monitor",
    customer: "Alice Brown",
    amount: 400,
    status: "pending",
  },
  {
    id: 5,
    date: "2024-01-05",
    product: "Headphones",
    customer: "Charlie Wilson",
    amount: 150,
    status: "completed",
  },
];

const salesByCategory = [
  { name: "Electronics", sales: 45000, percentage: 45, color: "#3B82F6" },
  { name: "Accessories", sales: 25000, percentage: 25, color: "#10B981" },
  { name: "Software", sales: 20000, percentage: 20, color: "#F59E0B" },
  { name: "Books", sales: 10000, percentage: 10, color: "#EF4444" },
];

const salesByRegion = [
  { region: "North", sales: 28000, orders: 340 },
  { region: "South", sales: 35000, orders: 420 },
  { region: "East", sales: 22000, orders: 280 },
  { region: "West", sales: 31000, orders: 390 },
];

const monthlySales = [
  { month: "Jan", sales: 95000, target: 100000 },
  { month: "Feb", sales: 105000, target: 110000 },
  { month: "Mar", sales: 125000, target: 120000 },
  { month: "Apr", sales: 110000, target: 115000 },
  { month: "May", sales: 130000, target: 125000 },
  { month: "Jun", sales: 140000, target: 135000 },
];

// Sales Metric Card Component
interface SalesMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

const SalesMetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
  suffix = "",
  color = "blue",
}: SalesMetricCardProps) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}
          {value}
          {suffix}
        </p>
      </div>
      <div
        className={`h-12 w-12 bg-${color}-50 rounded-full flex items-center justify-center`}
      >
        <Icon className={`h-6 w-6 text-${color}-600`} />
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

export default function SalesReportPage() {
  const sales = useSales();
  const allSales = useAllSales();
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = totalSales / totalOrders;
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesMetricCard
          title="Total Sales"
          value={totalSales.toLocaleString()}
          icon={DollarSign}
          trend={12.5}
          prefix="$"
          color="blue"
        />
        <SalesMetricCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          trend={8.2}
          color="green"
        />
        <SalesMetricCard
          title="Average Order Value"
          value={averageOrderValue.toFixed(0)}
          icon={Target}
          trend={5.3}
          prefix="$"
          color="purple"
        />
        <SalesMetricCard
          title="Total Profit"
          value={totalProfit.toLocaleString()}
          icon={TrendingUp}
          trend={15.8}
          prefix="$"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Region */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales by Region
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Sales vs Target */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Sales vs Target
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" name="Actual Sales" />
              <Bar dataKey="target" fill="#E5E7EB" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Sales
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sale.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
