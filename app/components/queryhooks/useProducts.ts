import { getProductsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", "list"],
    queryFn: () => getProductsClient(),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return { products, isLoading, error, refetch };
}
