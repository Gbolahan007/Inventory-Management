// useSales.ts
import { getTodaysProfit } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useTodaysProfit(start: Date, end: Date) {
  const { data: salesProfit } = useQuery({
    queryKey: ["sale_items", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysProfit(start, end),
  });
  return { salesProfit };
}
