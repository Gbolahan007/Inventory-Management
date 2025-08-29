import { getSaleItemsWithCategoriesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";
export function useSaleItemsWithCategories() {
  const {
    data: saleItemsWithCategories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sale_items", "categories"],
    queryFn: () => getSaleItemsWithCategoriesClient(),
    staleTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { saleItemsWithCategories, isLoading, error };
}
