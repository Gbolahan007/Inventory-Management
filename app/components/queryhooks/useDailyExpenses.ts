import { getExpensesClient } from "@/app/_lib/client-data-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useDailyExpenses() {
  const queryClient = useQueryClient();

  const {
    data: expenses,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["daily_expenses"],
    queryFn: () => getExpensesClient(),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const invalidateExpenses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["daily_expenses"] });
  };

  return { expenses, isLoading, error, refetch, invalidateExpenses };
}
