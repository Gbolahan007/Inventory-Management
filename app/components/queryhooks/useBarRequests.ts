import { createBarRequests } from "@/app/_lib/data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateBarRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBarRequests,
    onSuccess: () => {
      // Invalidate bar requests query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["bar-requests"] });

      // Optionally update products cache if stock is reduced virtually
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Error creating bar request:", error);
    },
  });
};
