import { getStatsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => getStatsClient(),
    staleTime: 1000 * 60 * 3,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  return { stats, isLoading, error };
}
