// useSales.ts
import { getTodaysProfitClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTodaysProfit(start: Date, end: Date) {
  const { data: salesProfit } = useQuery({
    queryKey: ["sale_items", "profit", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysProfitClient(start, end),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { salesProfit };
}
