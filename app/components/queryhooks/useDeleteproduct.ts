import { getDeleteProductsClient } from "@/app/_lib/client-data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: (id: number) => getDeleteProductsClient(id),
    onSuccess: () => {
      // Invalidate product-related queries after deletion
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
    },
  });

  return { isPending, mutate };
}
