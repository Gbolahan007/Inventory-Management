import { getBarRequestsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useBarRequestsQuery() {
  const {
    data: barRequests,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["bar_requests"],
    queryFn: () => getBarRequestsClient(),

    staleTime: 1000 * 60 * 15, // 15 minutes - reasonable for bar requests
    gcTime: 1000 * 60 * 60, // 1 hour cache

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    enabled: true,
  });

  return {
    barRequests: barRequests || [],
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  };
}
