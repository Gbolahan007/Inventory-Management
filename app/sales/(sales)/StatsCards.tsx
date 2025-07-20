import { ShoppingCart, DollarSign, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "./types";

interface StatsCardsProps {
  stats: Stats | undefined;
  isDarkMode: boolean;
  salesItems: [];
}

export function StatsCards({ stats, isDarkMode, salesItems }: StatsCardsProps) {
  const totalrevenue = salesItems.reduce(
    (cur, item) => cur + item.total_price,
    0
  );
  const profit = salesItems.reduce((cur, item) => cur + item.total_cost, 0);

  const netProfit = totalrevenue - profit;
  const cardClass = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const titleClass = `text-sm font-medium ${
    isDarkMode ? "text-gray-200" : "text-gray-900"
  }`;
  const iconClass = `h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`;
  const valueClass = `text-2xl font-bold ${
    isDarkMode ? "text-white" : "text-gray-900"
  }`;
  const descriptionClass = `text-xs ${
    isDarkMode ? "text-gray-400" : "text-gray-500"
  }`;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClass}>Total Sales</CardTitle>
          <ShoppingCart className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>{stats?.totalSales || 0}</div>
          <p className={descriptionClass}>Sales completed</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClass}>Total Revenue</CardTitle>
          <DollarSign className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>
            ₦{(totalrevenue || 0).toLocaleString()}
          </div>
          <p className={descriptionClass}>Total earnings</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClass}>Products</CardTitle>
          <Package className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className={valueClass}>{stats?.totalProducts || 0}</div>
          <p className={descriptionClass}>Active products</p>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={titleClass}>Net Profit</CardTitle>
          <TrendingUp className={iconClass} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ₦{netProfit.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
