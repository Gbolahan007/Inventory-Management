// import { handleSubmit } from "@/app/(auth)/action";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/router";
// import toast from "react-hot-toast";

// export function useLogin() {
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const { mutate: login, isLoading } = useMutation({
//     mutationFn: ({ email, password }) => handleSubmit({ email, password }),
//     onSuccess: (user) => {
//       queryClient.setQueryData(["user"], user.user);
//       router.push("/dashboard/inventory");
//     },
//     onError: () => {
//       toast.error("Provided email or password are incorrect");
//     },
//   });

//   return { login, isLoading };
// }
