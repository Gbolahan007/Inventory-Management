import { createSalesClient } from "@/app/_lib/client-data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SaleItem {
  id?: string;
  product_id: string;
  name: string;
  quantity: number;
  approved_quantity?: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  sales_rep_id?: string;
  sales_rep_name?: string;
  fulfillment_id?: string;
}
interface Expense {
  category: string;
  amount: number;
  createdAt?: string;
  tableId?: number;
}
interface SaleData {
  table_id: number;
  total_amount: number;
  payment_method: string;
  sales_rep_name: string;
  items: SaleItem[];
  expenses?: Expense[];
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: SaleData) => createSalesClient(saleData),
    retry: false,
    gcTime: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["sale_items"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error: Error) => {
      console.error("Sale error:", error);
    },
  });
}
