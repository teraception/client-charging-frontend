import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import { CreatePaymentMethodDto } from "JS/typingForNow/types";

export const useCreatePaymentMethod = () => {
  const { paymentMethodService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { paymentMethod } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreatePaymentMethodDto) => {
      const response = await paymentMethodService.createPaymentMethod(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentMethod.list(),
      });
    },
  });
  return {
    createPaymentMethod: mutateAsync,
    createPaymentMethodResponse: data,
    createPaymentMethodLoader: isPending,
  };
};
