import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSales } from "@/app/_lib/data-service";
import toast from "react-hot-toast";

interface SaleItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  selling_price: number;
  total_price: number;
  profit_amount: number;
}

interface SaleData {
  total_amount: number;
  payment_method: string;
  items: SaleItem[];
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: SaleData) => createSales(saleData),
    onSuccess: () => {
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
