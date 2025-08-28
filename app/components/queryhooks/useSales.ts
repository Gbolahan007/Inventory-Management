// useSales.ts
import { getTodaysSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useSales(start: Date, end: Date) {
  const { data: salesData } = useQuery({
    queryKey: ["sales", start.toISOString(), end.toISOString()],
    queryFn: () => getTodaysSalesClient(start, end),
  });
  return { salesData };
}
