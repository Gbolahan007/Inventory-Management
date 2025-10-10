"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const fmtCurrency = (n: number | undefined | null) =>
  `₦${(n ?? 0).toLocaleString()}`;

type ProductMetric = "quantity" | "revenue";

interface ItemStat {
  name: string;
  quantity: number;
  revenue: number;
}

interface ProfitChartDatum {
  date: string;
  profit: number;
}

interface ProductsAndProfitSectionProps {
  itemStats: ItemStat[];
  profitChartData: ProfitChartDatum[];
}

export default function ProductAndProfitSection({
  itemStats,
  profitChartData,
}: ProductsAndProfitSectionProps) {
  const [metric, setMetric] = useState<ProductMetric>("quantity");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Selling Products */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Top Selling Products</h3>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as ProductMetric)}
            className="text-sm border border-input rounded px-2 py-1"
          >
            <option value="quantity">Units</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={itemStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              formatter={(v: number) => [
                metric === "revenue" ? fmtCurrency(v) : v,
                metric === "revenue" ? "Revenue" : "Units",
              ]}
            />
            <Bar dataKey={metric} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Analysis */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => new Date(v).toLocaleDateString()}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              formatter={(v: number) => [fmtCurrency(v), "Profit"]}
              labelFormatter={(l: string) => new Date(l).toLocaleDateString()}
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
  );
}
