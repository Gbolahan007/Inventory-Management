import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getItemStats } from "../components/utils/getItemStats";
import { FormatCurrency } from "../hooks/useFormatCurrency";
import { SaleItem } from "../dashboard/reports/page";

export type TopSellingProduct = {
  id: string;
  product_id: string;
  name?: string;
  quantity: number;
  revenue: number;
};

export function mapTopSellingProductToSaleItem(
  topProduct: TopSellingProduct
): SaleItem {
  const unitPrice =
    topProduct.quantity > 0 ? topProduct.revenue / topProduct.quantity : 0;

  return {
    product_id: topProduct.product_id,
    name: topProduct.name || `Product ${topProduct.id}`,
    quantity: topProduct.quantity,
    unit_price: unitPrice,
    unit_cost: 0, // Set actual cost if available
    total_price: topProduct.revenue,
    total_cost: 0, // Calculate: unit_cost * quantity
    profit_amount: topProduct.revenue, // Calculate: total_price - total_cost
  };
}

interface TopSellingItemsProps {
  topSellingProducts?: TopSellingProduct[];
}

export function TopSellingItems({ topSellingProducts }: TopSellingItemsProps) {
  // Convert TopSellingProduct[] to SaleItem[] before passing to getItemStats
  const saleItems =
    topSellingProducts?.map(mapTopSellingProductToSaleItem) || [];
  const itemStats = getItemStats(saleItems);

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
