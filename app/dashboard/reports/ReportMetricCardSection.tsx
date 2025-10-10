"use client";

import React from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { ExtendedStats } from "./page";

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
          <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />
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

export default function ReportMetricCardSection({
  stats,
  netProfit,
}: {
  stats: ExtendedStats;
  netProfit: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Revenue"
        value={stats.totalRevenue?.toLocaleString() ?? "N/A"}
        icon={DollarSign}
        trend={stats.revenueGrowth ?? 0}
        prefix="₦"
      />
      <MetricCard
        title="Total Sales"
        value={stats.totalSales?.toLocaleString() ?? "N/A"}
        icon={ShoppingCart}
        trend={stats.salesGrowth ?? 0}
      />
      <MetricCard
        title="Total Products"
        value={stats.totalProducts ?? "N/A"}
        icon={Package}
        trend={stats.productGrowth ?? 0}
      />
      <MetricCard
        title="Total Profit"
        value={netProfit.toLocaleString()}
        icon={TrendingUp}
        trend={stats.profitGrowth ?? 0}
        prefix="₦"
      />
    </div>
  );
}
