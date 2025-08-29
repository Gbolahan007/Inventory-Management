import { getTotalInventoryClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTotalInventory() {
  const { data: totalInventory } = useQuery({
    queryKey: ["products", "total_inventory"],
    queryFn: () => getTotalInventoryClient(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  return { totalInventory };
}
