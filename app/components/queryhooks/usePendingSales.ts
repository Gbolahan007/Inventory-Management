import { getPendingSalesClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function usePendingSales() {
  const {
    data: pendingSales,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["sales", "pending"],
    queryFn: () => getPendingSalesClient(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { pendingSales, isLoading, isFetching, refetch };
}
