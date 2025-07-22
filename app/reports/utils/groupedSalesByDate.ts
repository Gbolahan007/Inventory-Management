type Sale = {
  id: number;
  total_amount: number;
  sale_date: string; // ISO date string
};

export function groupSalesByDate(sales: Sale[]): Record<string, number> {
  return sales.reduce((acc, sale) => {
    const date = sale.sale_date?.split("T")[0];
    acc[date] = (acc[date] || 0) + sale.total_amount;
    return acc;
  }, {} as Record<string, number>);
}

export function groupProfitByDate(profit) {
  return profit.reduce((acc, profit) => {
    const profitdate = profit.date?.split("T")[0];
    console.log(profitdate);
    acc[profitdate] = (acc[profitdate] || 0) + profit.profit;
    return acc;
    console.log(acc);
  }, {} as Record<string, number>);
}
