import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import { PaymentMethod } from "JS/typingForNow/types";

/**
 * Hook to get payment methods
 */
export const useGetPaymentMethods = () => {
  const { paymentMethodService } = useAppServiceContext();
  const { paymentMethod } = useQueryKeys();

  const { data, isLoading } = useQuery({
    queryKey: paymentMethod.list(),
    queryFn: async () => {
      const response = await paymentMethodService.getPaymentMethods();
      return response;
    },
  });

  return {
    paymentMethods: data?.data || [],
    paymentMethodsIsLoading: isLoading,
    paymentMethodsResponse: data,
  };
};

/**
 * Hook to get payment methods for a specific client
 */
export const useGetClientPaymentMethods = (clientId: string | null) => {
  const { paymentMethodService } = useAppServiceContext();
  const { paymentMethod } = useQueryKeys();

  const { data, isLoading } = useQuery({
    queryKey: paymentMethod.clientPaymentMethods(clientId || ""),
    enabled: !!clientId,
    queryFn: async () => {
      const response = await paymentMethodService.getClientPaymentMethods(
        clientId!
      );
      return response;
    },
  });

  return {
    clientPaymentMethods: data?.data || [],
    clientPaymentMethodsIsLoading: isLoading,
    clientPaymentMethodsResponse: data,
  };
};

export const useGetStripePaymentMethodsByClientId = (
  clientId: string | null
) => {
  const { paymentMethodService } = useAppServiceContext();
  const { paymentMethod } = useQueryKeys();

  const { data, isLoading } = useQuery({
    queryKey: paymentMethod.stripePaymentMethods(clientId || ""),
    enabled: !!clientId,
    queryFn: async () => {
      const response =
        await paymentMethodService.getStripePaymentMethodsByClientId(clientId!);
      return response;
    },
  });

  return {
    stripePaymentMethods: data?.data || [],
    stripePaymentMethodsIsLoading: isLoading,
    stripePaymentMethodsResponse: data,
  };
};
