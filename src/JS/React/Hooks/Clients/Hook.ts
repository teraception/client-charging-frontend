import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppServiceContext } from "JS/Routing/Context/ServiceContextProvider";
import { useQueryKeys } from "../UseQueryKeys";
import {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
} from "JS/typingForNow/types";

export const useGetAllClients = () => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.list(),
    queryFn: async () => {
      const response = await clientService.getAllClients();
      return response;
    },
  });
  return {
    clientsData: data?.data,
    getAllClientsLoader: isLoading,
    getAllClientsResponse: data,
  };
};

export const useGetClientDetails = (clientId: string) => {
  const { clientService } = useAppServiceContext();
  const { client } = useQueryKeys();
  const { data, isLoading } = useQuery({
    queryKey: client.details(clientId),
    queryFn: async () => {
      const response = await clientService.getClientDetails(clientId);
      return response;
    },
  });
  return {
    clientData: data?.data,
    clientDetailsResponse: data,
    clientDetailLoader: isLoading,
  };
};

export const useCreateClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateClientDTO) => {
      const response = await clientService.createClient(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    createClient: mutateAsync,
    createClientResponse: data,
    createClientLoader: isPending,
  };
};

export const useUpdateClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      clientId,
      data,
    }: {
      clientId: string;
      data: UpdateClientDTO;
    }) => {
      const response = await clientService.updateClient(clientId, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    updateClient: mutateAsync,
    updateClientResponse: data,
    updateClientLoader: isPending,
  };
};

export const useDeleteClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await clientService.deleteClient(clientId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    deleteClient: mutateAsync,
    deleteClientResponse: data,
    deleteClientLoader: isPending,
  };
};

export const useInviteClient = () => {
  const { clientService } = useAppServiceContext();
  const queryClient = useQueryClient();
  const { client } = useQueryKeys();
  const { data, mutateAsync, isPending } = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await clientService.inviteClient(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: client.list(),
      });
    },
  });
  return {
    inviteClient: mutateAsync,
    inviteClientResponse: data,
    inviteClientLoader: isPending,
  };
};
