import { getBarRequests } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useBarRequestsQuery() {
  const {
    data: barRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bar_requests"],
    queryFn: () => getBarRequests(),
  });

  return { barRequests, isLoading, error, refetch };
}
