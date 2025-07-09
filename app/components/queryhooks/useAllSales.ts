// useSales.ts
import { getAllSales } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useAllSales() {
  const { data: monthlySales } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getAllSales(),
  });
  return { monthlySales };
}
