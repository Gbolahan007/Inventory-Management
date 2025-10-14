import { getExpensesRepClient } from "@/app/_lib/client-data-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useRepExpenses() {
  const queryClient = useQueryClient();

  const {
    data: expenses,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => getExpensesRepClient(),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const invalidateExpenses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  return { expenses, isLoading, error, refetch, invalidateExpenses };
}
