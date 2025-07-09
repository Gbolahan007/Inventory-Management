import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { FormatCurrency } from "../hooks/useFormatCurrency";
import type { SaleItem } from "../page";

interface TopSellingItemsProps {
  topSellingProducts?: SaleItem[];
}

type ItemStat = {
  name: string;
  quantity: string | number;
  revenue: number;
};

function getItemStats(items: SaleItem[]): ItemStat[] {
  const stats: Record<string, ItemStat> = {};
  items?.forEach((item) => {
    const name = item.products.name;
    if (!stats[name]) {
      stats[name] = {
        name,
        quantity: 0,
        revenue: 0,
      };
    }
    stats[name].quantity += item.quantity;
    stats[name].revenue += item.total_price;
  });
  return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
}

export function TopSellingItems({ topSellingProducts }: TopSellingItemsProps) {
  const itemStats = getItemStats(topSellingProducts || []);

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Top Selling Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {itemStats.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} sold
                </p>
              </div>
              <div className="text-xs sm:text-sm font-medium ml-2 text-primary">
                {FormatCurrency(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
