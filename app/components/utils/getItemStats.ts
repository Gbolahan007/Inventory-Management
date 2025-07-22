import { SaleItem } from "@/app/page";

type ItemStat = {
  name: string;
  quantity: number;
  revenue: number;
};
export function getItemStats(items: SaleItem[]): ItemStat[] {
  const stats: Record<string, ItemStat> = {};
  items?.forEach((item) => {
    const name = item.products?.name;
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
  return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
}
