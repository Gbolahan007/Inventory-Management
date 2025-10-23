import { useQuery } from "@tanstack/react-query";
import { getBarModificationsClient } from "@/app/_lib/client-data-service";

export function useBarModificationsQuery(filters?: {
  tableId?: number;
  status?: string;
  dateRange?: { start: string; end: string };
}) {
  const {
    data: modifications = [],
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["pending_modifications", filters],
    queryFn: () => getBarModificationsClient(filters),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 5000,
  });

  return { modifications, isLoading, isError, error, refetch };
}
