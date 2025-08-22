import { updateRequestStatus } from "@/app/_lib/data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      requestId,
      newStatus,
    }: {
      requestId: string;
      newStatus: "given" | "cancelled";
    }) => updateRequestStatus(requestId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barRequests"] });
    },
  });

  return { mutate, isPending };
}
