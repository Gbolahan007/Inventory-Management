import { getRecentSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useRecentSales() {
  const { data: recentSales, isLoading } = useQuery({
    queryKey: ["sales", "recent"],
    queryFn: () => getRecentSalesClient(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { recentSales, isLoading };
}
