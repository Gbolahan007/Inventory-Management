// useSales.ts
import { getTodaysSales } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useSales(start: Date, end: Date) {
  const { data: salesData } = useQuery({
    queryKey: ["sales", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysSales(start, end),
  });
  return { salesData };
}
