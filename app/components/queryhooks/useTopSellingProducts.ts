// useSales.ts
import { getTopsellingProducts } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useTopSellingProducts() {
  const { data: topSellingProducts } = useQuery({
    queryKey: ["sale_items"],
    queryFn: () => getTopsellingProducts(),
  });
  return { topSellingProducts };
}
