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
} from "recharts";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Archive,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

// Mock data using your hooks
const useProducts = () => [
  {
    id: 1,
    name: "Laptop Pro",
    category: "Electronics",
    stock: 15,
    minStock: 10,
    maxStock: 50,
    price: 1500,
    value: 22500,
    status: "good",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    category: "Accessories",
    stock: 5,
    minStock: 20,
    maxStock: 100,
    price: 50,
    value: 250,
    status: "low",
  },
  {
    id: 3,
    name: "Keyboard",
    category: "Accessories",
    stock: 3,
    minStock: 15,
    maxStock: 75,
    price: 100,
    value: 300,
    status: "critical",
  },
  {
    id: 4,
    name: "Monitor 4K",
    category: "Electronics",
    stock: 25,
    minStock: 8,
    maxStock: 40,
    price: 400,
    value: 10000,
    status: "good",
  },
  {
    id: 5,
    name: "Headphones",
    category: "Accessories",
    stock: 12,
    minStock: 10,
    maxStock: 60,
    price: 150,
    value: 1800,
    status: "good",
  },
  {
    id: 6,
    name: "Webcam HD",
    category: "Electronics",
    stock: 8,
    minStock: 12,
    maxStock: 30,
    price: 80,
    value: 640,
    status: "low",
  },
  {
    id: 7,
    name: "USB Cable",
    category: "Accessories",
    stock: 45,
    minStock: 25,
    maxStock: 100,
    price: 15,
    value: 675,
    status: "good",
  },
  {
    id: 8,
    name: "Power Bank",
    category: "Electronics",
    stock: 18,
    minStock: 15,
    maxStock: 50,
    price: 60,
    value: 1080,
    status: "good",
  },
];

const useTotalInventory = () => ({
  totalProducts: 450,
  totalValue: 125000,
  lowStockItems: 8,
  outOfStockItems: 2,
  totalCategories: 4,
  turnoverRate: 4.2,
});

const inventoryByCategory = [
  { name: "Electronics", value: 45000, items: 125, color: "#3B82F6" },
  { name: "Accessories", value: 25000, items: 220, color: "#10B981" },
  { name: "Software", value: 35000, items: 85, color: "#F59E0B" },
  { name: "Books", value: 20000, items: 45, color: "#EF4444" },
];

const stockMovement = [
  { date: "2024-01-01", incoming: 150, outgoing: 120, net: 30 },
  { date: "2024-01-02", incoming: 180, outgoing: 140, net: 40 },
  { date: "2024-01-03", incoming: 120, outgoing: 160, net: -40 },
  { date: "2024-01-04", incoming: 200, outgoing: 180, net: 20 },
  { date: "2024-01-05", incoming: 160, outgoing: 150, net: 10 },
  { date: "2024-01-06", incoming: 140, outgoing: 130, net: 10 },
  { date: "2024-01-07", incoming: 170, outgoing: 145, net: 25 },
];

const topMovingProducts = [
  { name: "Laptop Pro", moved: 85, type: "outgoing" },
  { name: "Wireless Mouse", moved: 120, type: "outgoing" },
  { name: "USB Cable", moved: 200, type: "outgoing" },
  { name: "Monitor 4K", moved: 60, type: "outgoing" },
  { name: "Headphones", moved: 95, type: "outgoing" },
];

// Inventory Metric Card Component
interface InventoryMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  alert?: boolean;
}

const InventoryMetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
  suffix = "",
  color = "blue",
  alert = false,
}: InventoryMetricCardProps) => (
  <div
    className={`bg-white p-6 rounded-lg border ${
      alert ? "border-red-200 bg-red-50" : "border-gray-200"
    } hover:shadow-md transition-shadow`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p
          className={`text-2xl font-bold ${
            alert ? "text-red-600" : "text-gray-900"
          }`}
        >
          {prefix}
          {value}
          {suffix}
        </p>
      </div>
      <div
        className={`h-12 w-12 ${
          alert ? "bg-red-100" : `bg-${color}-50`
        } rounded-full flex items-center justify-center`}
      >
        <Icon
          className={`h-6 w-6 ${alert ? "text-red-600" : `text-${color}-600`}`}
        />
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

const getStockStatusColor = (status: string) => {
  switch (status) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "good":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStockStatusIcon = (status: string) => {
  switch (status) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "low":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "good":
      return <Package className="h-4 w-4 text-green-500" />;
    default:
      return <Package className="h-4 w-4 text-gray-500" />;
  }
};

export default function InventoryReportPage() {
  const products = useProducts();
  const inventory = useTotalInventory();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredProducts = products.filter((product) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "low")
      return product.status === "low" || product.status === "critical";
    if (selectedFilter === "good") return product.status === "good";
    return product.status === selectedFilter;
  });

  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.value,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Inventory Management
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Products</option>
            <option value="good">Good Stock</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryMetricCard
          title="Total Products"
          value={inventory.totalProducts}
          icon={Package}
          trend={3.2}
          color="blue"
        />
        <InventoryMetricCard
          title="Total Value"
          value={inventory.totalValue.toLocaleString()}
          icon={DollarSign}
          trend={8.5}
          prefix="$"
          color="green"
        />
        <InventoryMetricCard
          title="Low Stock Items"
          value={inventory.lowStockItems}
          icon={AlertTriangle}
          color="yellow"
          alert={inventory.lowStockItems > 5}
        />
        <InventoryMetricCard
          title="Turnover Rate"
          value={inventory.turnoverRate}
          icon={TrendingUp}
          trend={12.3}
          suffix="x"
          color="purple"
        />
      </div>

      {/* Critical Alerts */}
      {inventory.lowStockItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">
              Inventory Alerts
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {products
              .filter((p) => p.status === "critical" || p.status === "low")
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between bg-white p-2 rounded border"
                >
                  <span className="text-sm text-gray-900">{product.name}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(
                      product.status
                    )}`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory by Category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inventoryByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, items }) => `${name} (${items})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {inventoryByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Movement */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stock Movement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#10B981"
                strokeWidth={2}
                name="Incoming"
              />
              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#EF4444"
                strokeWidth={2}
                name="Outgoing"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Net Change"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Moving Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMovingProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="moved" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Value Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Inventory
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStockStatusIcon(product.status)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{product.stock}</span>
                      <span className="text-gray-500 text-xs ml-1">
                        / {product.maxStock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(
                        product.status
                      )}`}
                    >
                      {product.status}
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
