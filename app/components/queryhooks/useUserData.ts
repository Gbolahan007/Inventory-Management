import { getAllUsersClient } from "@/app/_lib/client-data-service";
import { useQuery } from "@tanstack/react-query";

export function useUserData() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () => getAllUsersClient(),
    staleTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  return { user, isLoading, error };
}
