import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import { CreateInvoiceDto } from "JS/typingForNow/types";

export const useGetInvoicesByClient = (clientId: string | null) => {
  const { invoiceService } = useAppServiceContext();
  const { invoice } = useQueryKeys();

  const { data, isLoading, refetch } = useQuery({
    queryKey: invoice.listByClient(clientId || ""),
    enabled: !!clientId,
    queryFn: async () => {
      const response = await invoiceService.getInvoicesByClientId(clientId!);
      return response;
    },
  });

  return {
    invoicesData: data?.data || [],
    invoicesIsLoading: isLoading,
    invoicesResponse: data,
    refetchInvoices: refetch,
  };
};

export const useGetInvoiceDetails = (invoiceId: string | null) => {
  const { invoiceService } = useAppServiceContext();
  const { invoice } = useQueryKeys();

  const { data, isLoading } = useQuery({
    queryKey: invoice.details(invoiceId || ""),
    enabled: !!invoiceId,
    queryFn: async () => {
      const response = await invoiceService.getInvoiceDetails(invoiceId!);
      return response;
    },
  });

  return {
    invoiceData: data?.data,
    invoiceIsLoading: isLoading,
    invoiceResponse: data,
  };
};

export const useCreateInvoice = () => {
  const { invoiceService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { invoice } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async (data: CreateInvoiceDto) => {
      const response = await invoiceService.createInvoice(data);
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate invoices list for this client
      queryClient.invalidateQueries({
        queryKey: invoice.listByClient(variables.clientId),
      });
    },
  });

  return {
    createInvoice: mutateAsync,
    createInvoiceIsLoading: isLoading,
    createInvoiceResponse: data,
  };
};

export const useDeleteInvoice = () => {
  const { invoiceService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { invoice } = useQueryKeys();

  const {
    mutateAsync,
    isPending: isLoading,
    data,
  } = useMutation({
    mutationFn: async ({
      invoiceId,
      dbInvoiceId,
    }: {
      invoiceId: string;
      dbInvoiceId: string;
    }) => {
      const response = await invoiceService.deleteInvoice(
        invoiceId,
        dbInvoiceId
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate invoices list for this client
      queryClient.invalidateQueries({
        queryKey: invoice.all,
      });
    },
  });

  return {
    deleteInvoice: mutateAsync,
    deleteInvoiceIsLoading: isLoading,
    deleteInvoiceResponse: data,
  };
};
