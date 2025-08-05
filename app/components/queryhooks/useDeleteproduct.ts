import { getDeleteProducts } from "@/app/_lib/data-service";
import { useMutation } from "@tanstack/react-query";

export function useDeleteProduct() {
  const { isPending, mutate } = useMutation({
    mutationFn: (id: number) => getDeleteProducts(id),
  });

  return { isPending, mutate };
}
