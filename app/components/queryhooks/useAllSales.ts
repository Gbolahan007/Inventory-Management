import { getAllSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useAllSales() {
  const { data: monthlySales } = useQuery({
    queryKey: ["sales", "all"],
    queryFn: () => getAllSalesClient(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return { monthlySales };
}
