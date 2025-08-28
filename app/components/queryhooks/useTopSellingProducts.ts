// useSales.ts
import { getTopSellingProductsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTopSellingProducts() {
  const { data: topSellingProducts } = useQuery({
    queryKey: ["sale_items"],
    queryFn: () => getTopSellingProductsClient(),
  });
  return { topSellingProducts };
}
