import { getStats } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(),
  });
  return { stats, isLoading, error };
}
