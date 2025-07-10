import { getTotalInventory } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useTotalInventory() {
  const { data: totalInventory } = useQuery({
    queryKey: ["products"],
    queryFn: () => getTotalInventory(),
  });
  return { totalInventory };
}
