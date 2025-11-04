import { getAllExpensesWithBookings } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useAllRoomExpenses() {
  const {
    data: allExpenses,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["room_expenses"],
    queryFn: () => getAllExpensesWithBookings(),
    staleTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { allExpenses, isLoading, refetch, isFetching };
}
