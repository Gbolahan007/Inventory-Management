"use client";

import { ChartContainer } from "@/app/components/ui/ChartContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data for the dashboard
const salesData = [
  { month: "Jan", sales: 45000 },
  { month: "Feb", sales: 52000 },
  { month: "Mar", sales: 48000 },
  { month: "Apr", sales: 61000 },
  { month: "May", sales: 55000 },
  { month: "Jun", sales: 67000 },
  { month: "Jul", sales: 72000 },
  { month: "Aug", sales: 69000 },
  { month: "Sep", sales: 75000 },
  { month: "Oct", sales: 78000 },
  { month: "Nov", sales: 82000 },
  { month: "Dec", sales: 89000 },
];

const topSellingItems = [
  { id: 1, name: "Wireless Headphones", sold: 245, revenue: "$12,250" },
  { id: 2, name: "Smart Watch", sold: 189, revenue: "$37,800" },
  { id: 3, name: "Laptop Stand", sold: 156, revenue: "$4,680" },
  { id: 4, name: "USB-C Cable", sold: 134, revenue: "$2,010" },
  { id: 5, name: "Phone Case", sold: 98, revenue: "$2,940" },
];

const recentSales = [
  {
    id: "#12345",
    customer: "John Doe",
    amount: "$299.00",
    status: "Completed",
    time: "2 min ago",
  },
  {
    id: "#12346",
    customer: "Jane Smith",
    amount: "$159.00",
    status: "Processing",
    time: "5 min ago",
  },
  {
    id: "#12347",
    customer: "Mike Johnson",
    amount: "$89.00",
    status: "Completed",
    time: "8 min ago",
  },
  {
    id: "#12348",
    customer: "Sarah Wilson",
    amount: "$199.00",
    status: "Completed",
    time: "12 min ago",
  },
  {
    id: "#12349",
    customer: "Tom Brown",
    amount: "$349.00",
    status: "Pending",
    time: "15 min ago",
  },
];

const lowStockItems = [
  { name: "iPhone Cases", stock: 5, threshold: 20 },
  { name: "Bluetooth Speakers", stock: 8, threshold: 25 },
  { name: "Power Banks", stock: 12, threshold: 30 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full ">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
          <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 ">
            {/* Desktop Header */}
            <div className="hidden sm:block">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Sales Dashboard
                  </h1>
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
                    <span className="sm:hidden ">
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid - Fully Responsive */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              <Card className="col-span-1 group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Sales Today
                  </CardTitle>
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-foreground mb-1">
                    $2,847
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      +12.5%
                    </span>
                    from yesterday
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-foreground mb-1">
                    1,247
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      +8.2%
                    </span>
                    from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 group hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent/20 hover:border-l-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Inventory
                  </CardTitle>
                  <div className="p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-foreground mb-1">
                    8,542
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3 rotate-180" />
                      -2.1%
                    </span>
                    from last week
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Profit
                  </CardTitle>
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-3xl font-bold text-foreground mb-1">
                    $45,231
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      +15.3%
                    </span>
                    from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Overview Chart - Responsive Height */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Sales Overview
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Monthly sales performance for the current year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] sm:h-[300px] lg:h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                        className="sm:text-xs"
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `#${value / 1000}k`}
                        className="sm:text-xs"
                      />
                      <Tooltip
                        formatter={(value) => [
                          `$${value.toLocaleString()}`,
                          "Sales",
                        ]}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                          color: "hsl(var(--card-foreground))",
                        }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="hsl(var(--primary))"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Bottom Section - Responsive Layout */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              {/* Top Selling Items */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Top Selling Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {topSellingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.sold} sold
                          </p>
                        </div>
                        <div className="text-xs sm:text-sm font-medium ml-2 text-primary">
                          {item.revenue}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sales */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Recent Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {recentSales.slice(0, 4).map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                            {sale.customer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.time}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xs sm:text-sm font-medium text-primary">
                            {sale.amount}
                          </div>
                          <Badge
                            variant={
                              sale.status === "Completed"
                                ? "default"
                                : sale.status === "Processing"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs mt-1"
                          >
                            {sale.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Stock Alert */}
              <Card className="lg:col-span-1 border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Items that need restocking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {lowStockItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Threshold: {item.threshold} units
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs ml-2">
                          {item.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-only Quick Actions */}
            <div className="sm:hidden">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      Add Product
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Reports
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Manage Orders
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
