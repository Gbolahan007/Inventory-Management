import { getUserData } from "@/app/_lib/data-service";
import { useQuery } from "@tanstack/react-query";

export function useUserData() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUserData(),
  });
  return { user, isLoading, error };
}
