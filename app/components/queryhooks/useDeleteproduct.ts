import { getDeleteProductsClient } from "@/app/_lib/client-data-service";
import { useMutation } from "@tanstack/react-query";

export function useDeleteProduct() {
  const { isPending, mutate } = useMutation({
    mutationFn: (id: number) => getDeleteProductsClient(id),
  });

  return { isPending, mutate };
}
