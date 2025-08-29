import { getRecentSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useRecentSales() {
  const { data: recentSales, isLoading } = useQuery({
    queryKey: ["sales", "recent"],
    queryFn: () => getRecentSalesClient(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return { recentSales, isLoading };
}
