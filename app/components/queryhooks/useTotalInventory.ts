import { getTotalInventoryClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useTotalInventory() {
  const { data: totalInventory } = useQuery({
    queryKey: ["products"],
    queryFn: () => getTotalInventoryClient(),
  });
  return { totalInventory };
}
