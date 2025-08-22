import { updateMultipleRequestsStatus } from "@/app/_lib/data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateMultipleRequestsStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      requestIds,
      newStatus,
    }: {
      requestIds: string[];
      newStatus: "given" | "cancelled";
    }) => updateMultipleRequestsStatus(requestIds, newStatus),
    onSuccess: () => {
      // Invalidate and refetch bar requests data
      queryClient.invalidateQueries({ queryKey: ["barRequests"] });
    },
  });

  return { mutate, isPending };
}
