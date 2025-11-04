import { getBookingExpenses } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useBookingExpensesQuery(bookingId: string | number | null) {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["booking_expenses", bookingId],
    queryFn: () => getBookingExpenses(String(bookingId)),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 60 * 30, // 30 mins
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return { expenses, isLoading };
}
