import { getProducts } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  return { products, isLoading, error };
}
