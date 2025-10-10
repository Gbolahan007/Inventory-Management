import { getDailySalesReportClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useDailySalesReport() {
  const {
    data: dailySalesReport,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sales", "dailyReport"],
    queryFn: () => getDailySalesReportClient(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { dailySalesReport, isLoading, isError };
}
