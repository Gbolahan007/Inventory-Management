"use client";

import { getBarFulfillmentsClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useBarFulfillments(filters?: {
  tableId?: number;
  salesRepId?: string;
  status?: string;
  dateRange?: { start: string; end: string };
}) {
  const {
    data: fulfillments,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["bar_fulfillments", filters],
    queryFn: () => getBarFulfillmentsClient(filters),

    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true, // can be useful

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    enabled: true,
  });

  return {
    fulfillments: fulfillments || [],
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  };
}
