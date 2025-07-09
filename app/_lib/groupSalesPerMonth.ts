import { format } from "date-fns";

type MonthlySales = { month: string; sales: number }[];

export function groupSalesByMonth(
  salesData: { total_amount: number; sale_date: string }[]
): MonthlySales {
  const monthlyMap = new Map<string, number>();

  salesData?.forEach((sale) => {
    const month = format(new Date(sale.sale_date), "MMM yyyy");
    monthlyMap.set(month, (monthlyMap.get(month) || 0) + sale.total_amount);
  });

  return Array.from(monthlyMap.entries()).map(([month, sales]) => ({
    month,
    sales,
  }));
}
