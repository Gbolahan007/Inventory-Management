// useSales.ts
import { getTodaysProfitClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTodaysProfit(start: Date, end: Date) {
  const { data: salesProfit } = useQuery({
    queryKey: ["sale_items", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysProfitClient(start, end),
  });
  return { salesProfit };
}
