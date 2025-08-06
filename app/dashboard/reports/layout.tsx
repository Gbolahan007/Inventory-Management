"use client";

import { Calendar, TrendingUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Time range options
const timeRanges = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

// Navigation tabs
const reportTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: TrendingUp,
    path: "/dashboard/reports",
    description: "Overview with key metrics",
  },
  // {
  //   id: "sales",
  //   label: "Sales",
  //   icon: DollarSign,
  //   path: "/reports/sales",
  //   description: "Sales-focused analytics",
  // },
  // {
  //   id: "inventory",
  //   label: "Inventory",
  //   icon: Package,
  //   path: "/reports/inventory",
  //   description: "Stock and inventory reports",
  // },
  // {
  //   id: "profitability",
  //   label: "Profitability",
  //   icon: TrendingUp,
  //   path: "/reports/profits",
  //   description: "Profit analysis",
  // },
];

interface ReportsLayoutProps {
  children: React.ReactNode;
}
export default function ReportsLayout({ children }: ReportsLayoutProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive business insights and analytics
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2 bg-card rounded-lg shadow-sm border border-border p-1">
                <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium text-foreground pr-8 focus:ring-0"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-border bg-card rounded-t-lg shadow-sm">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.path;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.path)}
                    className={`${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Descriptions */}
          <div className="bg-card border-x border-b border-border rounded-b-lg px-6 py-3">
            {reportTabs.map((tab) => {
              const isActive = pathname === tab.path;
              if (!isActive) return null;

              return (
                <p key={tab.id} className="text-sm text-muted-foreground">
                  {tab.description}
                </p>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-card rounded-lg shadow-sm border border-border min-h-[600px] overflow-hidden">
          {children || (
            <div className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to Reports & Analytics
                </h3>
                <p className="text-muted-foreground">
                  Select a tab above to view detailed reports and insights about
                  your business performance.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Data refreshed every 15 minutes • Last update:{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}
