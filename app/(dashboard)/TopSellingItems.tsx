import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { FormatCurrency } from "../hooks/useFormatCurrency";

export type TopSellingProduct = {
  id: string;
  product_id: string;
  name?: string;
  quantity: number;
  revenue: number;
};

export type SaleItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
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
    unit_cost: 0,
    total_price: topProduct.revenue,
    total_cost: 0,
    profit_amount: topProduct.revenue,
  };
}

function mergeDuplicateItems(items: SaleItem[]): SaleItem[] {
  const mergedMap = new Map<string, SaleItem>();

  items.forEach((item) => {
    if (mergedMap.has(item.name)) {
      const existing = mergedMap.get(item.name)!;
      existing.quantity += item.quantity;
      existing.total_price += item.total_price;
      existing.profit_amount += item.profit_amount;
      existing.unit_price =
        existing.quantity > 0 ? existing.total_price / existing.quantity : 0;
    } else {
      mergedMap.set(item.name, { ...item });
    }
  });

  return Array.from(mergedMap.values());
}

// Get individual items (no grouping) - sorted by quantity sold
export function getIndividualItemStats(items?: SaleItem[]): SaleItem[] {
  if (!items) return [];

  // Sort by quantity sold (descending) or by revenue
  return [...items].sort((a, b) => b.quantity - a.quantity).slice(0, 11);
}

interface TopSellingItemsProps {
  topSellingProducts?: TopSellingProduct[];
}

export function TopSellingItems({ topSellingProducts }: TopSellingItemsProps) {
  const saleItems =
    topSellingProducts?.map(mapTopSellingProductToSaleItem) || [];
  const mergedItems = mergeDuplicateItems(saleItems);

  // Sort and get top items
  const individualItems = getIndividualItemStats(mergedItems);

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
          {individualItems.map((item, index) => (
            <div
              key={`${item.product_id}-${index}`}
              className="flex items-center justify-between"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium leading-none truncate text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} units sold
                </p>
              </div>
              <div className="text-xs sm:text-sm font-medium ml-2 text-primary">
                {FormatCurrency(item.total_price)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
