import { getRecentSales } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useRecentSales() {
  const { data: recentSales } = useQuery({
    queryKey: ["sales"],
    queryFn: () => getRecentSales(),
  });
  return { recentSales };
}
