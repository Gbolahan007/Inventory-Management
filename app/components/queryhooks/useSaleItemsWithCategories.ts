import { getSaleItemsWithCategories } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useSaleItemsWithCategories() {
  const {
    data: saleItemsWithCategories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sales_items"],
    queryFn: () => getSaleItemsWithCategories(),
  });
  return { saleItemsWithCategories, isLoading, error };
}
