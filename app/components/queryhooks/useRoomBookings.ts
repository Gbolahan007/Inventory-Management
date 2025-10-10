import { getRoomBookingClient } from "@/app/_lib/client-data-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useRoomBookings() {
  const queryClient = useQueryClient();

  const {
    data: room_bookings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["room_bookings"],
    queryFn: () => getRoomBookingClient(),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["room_bookings"] });
  };
  return { room_bookings, isLoading, error, refetch, invalidateProducts };
}
