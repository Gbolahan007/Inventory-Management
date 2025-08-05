import { SaleItem } from "@/app/dashboard/reports/page";

type ItemStat = {
  name: string;
  quantity: number;
  revenue: number;
  salesItem: SaleItem[];
};

export function getItemStats(items?: SaleItem[]): ItemStat[] {
  const stats: Record<string, ItemStat> = {};

  items?.forEach((item) => {
    const name = item.products?.name || "Unknown Product";

    if (!stats[name]) {
      stats[name] = {
        name,
        quantity: 0,
        revenue: 0,
        salesItem: [],
      };
    }

    stats[name].quantity += item.quantity;
    stats[name].revenue += item.total_price;
    stats[name].salesItem.push(item);
  });

  return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
}
