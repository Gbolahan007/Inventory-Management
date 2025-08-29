// useSales.ts
import { getTopSellingProductsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTopSellingProducts() {
  const { data: topSellingProducts } = useQuery({
    queryKey: ["sale_items", "top_selling"],
    queryFn: () => getTopSellingProductsClient(),
    staleTime: 1000 * 60 * 15,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { topSellingProducts };
}
