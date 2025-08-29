import { createSalesClient } from "@/app/_lib/client-data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface SaleItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_cost: number;
  selling_price: number;
  total_price: number;
  profit_amount: number;
}

interface SaleData {
  table_id: number;
  total_amount: number;
  payment_method: string;
  sales_rep_name: string;
  items: SaleItem[];
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: SaleData) => createSalesClient(saleData),
    onSuccess: () => {
      // Invalidate ALL sales-related queries
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["sale_items"] });

      toast.success("Sale completed successfully!");
    },
    onError: (error: Error) => {
      console.error("Sale error:", error);
      toast.error("Failed to complete sale");
    },
  });
}
