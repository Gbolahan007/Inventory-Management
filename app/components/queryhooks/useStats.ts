import { getStatsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStatsClient(),
  });
  return { stats, isLoading, error };
}
