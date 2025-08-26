import { getBarRequests } from "@/app/_lib/data-service";
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
    queryFn: () => getBarRequests(),

    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour

    // PREVENT AUTOMATIC REFETCHING
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    enabled: true, // Query is enabled
  });

  return {
    barRequests: barRequests || [], // Ensure we always return an array
    isLoading,
    error,
    refetch,
    isError,
    isFetching, // Useful to show when background refetching
  };
}
