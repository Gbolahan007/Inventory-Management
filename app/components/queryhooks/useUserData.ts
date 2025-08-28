import { getAllUsersClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useUserData() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsersClient(),
  });
  return { user, isLoading, error };
}
