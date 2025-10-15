import { getProductsClient } from "@/app/_lib/client-data-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useProducts() {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["products", "list"],
    queryFn: () => getProductsClient(),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return {
    products,
    isLoading,
    error,
    refetch,
    isRefetching,
    invalidateProducts,
  };
}
