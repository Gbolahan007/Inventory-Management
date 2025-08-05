/* eslint-disable @typescript-eslint/no-explicit-any */

interface Product {
  name: string;
  category: string;
}

interface SaleItem {
  quantity: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  products?: Product;
}

export function getTopSellingCategories(
  saleItemsData: SaleItem[],
  sortBy: "quantity" | "revenue" | "profit" | "transactions" = "quantity"
) {
  if (!saleItemsData || !Array.isArray(saleItemsData)) return [];

  const categoryStats: Record<string, any> = {};

  saleItemsData.forEach((item) => {
    const category = item.products?.category || "Unknown";

    if (!categoryStats[category]) {
      categoryStats[category] = {
        category,
        totalQuantity: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        transactionCount: 0,
        products: new Set<string>(),
      };
    }

    categoryStats[category].totalQuantity += item.quantity;
    categoryStats[category].totalRevenue += item.total_price;
    categoryStats[category].totalCost += item.total_cost;
    categoryStats[category].totalProfit += item.profit_amount;
    categoryStats[category].transactionCount += 1;
    if (item.products?.name) {
      categoryStats[category].products.add(item.products.name);
    }
  });

  const processedStats = Object.values(categoryStats).map((stat: any) => ({
    ...stat,
    uniqueProductsCount: stat.products.size,
    products: undefined, // remove set before returning
  }));

  const sorters: Record<string, (a: any, b: any) => number> = {
    quantity: (a, b) => b.totalQuantity - a.totalQuantity,
    revenue: (a, b) => b.totalRevenue - a.totalRevenue,
    profit: (a, b) => b.totalProfit - a.totalProfit,
    transactions: (a, b) => b.transactionCount - a.transactionCount,
  };

  return processedStats.sort(sorters[sortBy]);
}
