import { getSaleItemsWithCategoriesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useSaleItemsWithCategories() {
  const {
    data: saleItemsWithCategories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sales_items"],
    queryFn: () => getSaleItemsWithCategoriesClient(),
  });
  return { saleItemsWithCategories, isLoading, error };
}
