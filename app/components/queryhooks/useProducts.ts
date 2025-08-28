import { getProductsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProductsClient(),
  });
  return { products, isLoading, error, refetch };
}
