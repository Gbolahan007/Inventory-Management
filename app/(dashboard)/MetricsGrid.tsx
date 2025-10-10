/* eslint-disable @typescript-eslint/no-explicit-any */

import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { FormatCurrency } from "../hooks/useFormatCurrency";
import { MetricCard } from "./MetricCard";
import { Sale } from "../dashboard/sales/(sales)/types";

type ProfitData = {
  profit_amount: number;
};

interface MetricsGridProps {
  salesData?: Sale[];
  totalInventory?: any[];
  salesProfit: ProfitData[] | undefined;
}

export function MetricsGrid({
  salesData,
  totalInventory,
  salesProfit,
}: MetricsGridProps) {
  const todaySales = (salesData ?? []).reduce(
    (total, sale) => total + sale.total_amount,
    0
  );
  const inventory = (totalInventory ?? []).reduce(
    (total, item) => total + Number(item.current_stock),
    0
  );

  const totalProfit = (salesProfit ?? []).reduce(
    (total, item) => total + item.profit_amount,
    0
  );

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      <MetricCard
        title="Sales Today"
        value={FormatCurrency(todaySales)}
        icon={<DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
        trend={{ value: "+12.5%", isPositive: true, label: "from yesterday" }}
      />

      <MetricCard
        title="Total Orders"
        value={salesData?.length || 0}
        icon={<ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
        trend={{ value: "+8.2%", isPositive: true, label: "from last month" }}
      />

      <MetricCard
        title="Inventory"
        value={inventory}
        icon={<Package className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />}
        trend={{ value: "-2.1%", isPositive: false, label: "from last week" }}
        borderColor="border-l-accent/20 hover:border-l-accent"
      />

      <MetricCard
        title="Total Profit"
        value={"*".repeat(String(FormatCurrency(totalProfit)).length)}
        icon={<TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />}
        trend={{ value: "+15.3%", isPositive: true, label: "from last month" }}
      />
    </div>
  );
}
