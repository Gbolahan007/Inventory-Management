import { createProduct } from "@/app/_lib/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formdata: FormData) => createProduct(formdata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      toast.success("New product added");
    },
    onError: (error) => {
      console.error("Failed to create product:", error);
      toast.error("Failed to add product");
    },
  });
}
