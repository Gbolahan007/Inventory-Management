"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

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
    path: "/reports",
    description: "Overview with key metrics",
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    path: "/reports/sales",
    description: "Sales-focused analytics",
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    path: "/reports/inventory",
    description: "Stock and inventory reports",
  },
  {
    id: "profitability",
    label: "Profitability",
    icon: TrendingUp,
    path: "/reports/profits",
    description: "Profit analysis",
  },
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive business insights and analytics
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border p-1">
              <Calendar className="h-4 w-4 text-gray-500 ml-2" />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 pr-8"
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

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
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
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-sm border min-h-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
}
