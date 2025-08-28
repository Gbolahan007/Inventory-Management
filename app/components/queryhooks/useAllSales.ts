// useSales.ts
import { getAllSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useAllSales() {
  const { data: monthlySales } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getAllSalesClient(),
  });
  return { monthlySales };
}
