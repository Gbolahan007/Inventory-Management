// useSales.ts
import { getTodaysSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useSales(start: Date, end: Date) {
  const { data: salesData } = useQuery({
    queryKey: ["sales", "range", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysSalesClient(start, end),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { salesData };
}
