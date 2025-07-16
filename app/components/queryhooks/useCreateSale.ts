import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSales } from "@/app/_lib/data-service";
import toast from "react-hot-toast";

interface SaleData {
  total_amount: number;
  payment_method: string;
  items: any[]; // Use your SaleItem type
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: SaleData) => createSales(saleData),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Sale completed successfully!");
    },
    onError: (error) => {
      console.error("Sale error:", error);
      toast.error("Failed to complete sale");
    },
  });
}
