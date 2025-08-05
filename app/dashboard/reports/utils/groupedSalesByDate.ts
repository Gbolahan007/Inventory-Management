/* eslint-disable @typescript-eslint/no-explicit-any */

type Sale = {
  id: number;
  total_amount: number;
  sale_date: string; // ISO date string
};
type ProfitEntry = {
  date: string;
  profit: number;
};

export function groupSalesByDate(sales: Sale[]): Record<string, number> {
  return sales.reduce((acc, sale) => {
    const date = sale.sale_date?.split("T")[0];
    acc[date] = (acc[date] || 0) + sale.total_amount;
    return acc;
  }, {} as Record<string, number>);
}

export function groupProfitByDate(
  profit: ProfitEntry[]
): Record<string, number> {
  return profit.reduce((acc: Record<string, number>, entry: ProfitEntry) => {
    const profitDate = entry.date?.split("T")[0];
    acc[profitDate] = (acc[profitDate] || 0) + entry.profit;
    return acc;
  }, {});
}
